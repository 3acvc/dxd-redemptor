import Decimal from "decimal.js-light";
import mongoose from "mongoose";
import { handle } from ".";
import {
    ChainId,
    DXDAO_AVATAR as DXDAO_AVATAR_ADDRESS,
    ERC20_TRANSFER_SIGHASH,
} from "../../../constants";
import {
    DXD as DXD_TOKEN,
    NAV_TOKEN_LIST,
    Token,
} from "../../../entities/token";
import { keccak256 } from "@ethersproject/solidity";
import {
    getTreasuryBalancesAtBlocks,
    TreasuryBalancesSnapshotModel,
} from "../../db/treasury-balances-snapshot";
import {
    DXDCirculatingSupplySnapshotModel,
    getDXDCirculatingSupplyAtBlocks,
} from "../../db/dxd-circulating-supply-snapshot";
import { defaultAbiCoder } from "@ethersproject/abi";
import { parseUnits } from "@ethersproject/units";
import { addressEqual } from "../utils";
import { WebSocketProvider } from "@ethersproject/providers";

const DXD = DXD_TOKEN[ChainId.ETHEREUM];
const DXDAO_AVATAR = DXDAO_AVATAR_ADDRESS[ChainId.ETHEREUM];
const MAINNET_TREASURY_TOKENS = NAV_TOKEN_LIST.filter(
    (token) => token.chainId === ChainId.ETHEREUM
);
const GNOSIS_TREASURY_TOKENS = NAV_TOKEN_LIST.filter(
    (token) => token.chainId === ChainId.GNOSIS
);

describe("ethereum handler", () => {
    let providerList: Record<ChainId, WebSocketProvider>;

    beforeAll(async () => {
        mongoose.connection.on("error", (error) => {
            console.error(error);
            process.exit(100);
        });
        await mongoose.connect(global.__MONGO_URI__, {});
        providerList = {
            [ChainId.ETHEREUM]: {
                getBlockNumber: jest.fn(),
            } as unknown as WebSocketProvider,
            [ChainId.GNOSIS]: {
                getBlockNumber: jest.fn(),
            } as unknown as WebSocketProvider,
        };
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    let tokenA: Token,
        tokenB: Token,
        tokenC: Token,
        tokenD: Token,
        initialDXDSupply: Decimal;

    beforeEach(async () => {
        tokenA = MAINNET_TREASURY_TOKENS[0];
        tokenB = MAINNET_TREASURY_TOKENS[1];

        tokenC = GNOSIS_TREASURY_TOKENS[0];
        tokenD = GNOSIS_TREASURY_TOKENS[1];

        // ethereum initial snapshot
        await new TreasuryBalancesSnapshotModel({
            blockNumber: 0,
            chainId: ChainId.ETHEREUM,
            balances: [
                {
                    token: {
                        address: tokenA.address,
                        symbol: tokenA.symbol,
                        decimals: tokenA.decimals,
                    },
                    amount: "2",
                },
                {
                    token: {
                        address: tokenB.address,
                        symbol: tokenB.symbol,
                        decimals: tokenB.decimals,
                    },
                    amount: "7.9919",
                },
            ],
        }).save();

        // gnosis initial snapshot
        await new TreasuryBalancesSnapshotModel({
            blockNumber: 0,
            chainId: ChainId.GNOSIS,
            balances: [
                {
                    token: {
                        address: tokenC.address,
                        symbol: tokenC.symbol,
                        decimals: tokenC.decimals,
                    },
                    amount: "2",
                },
                {
                    token: {
                        address: tokenD.address,
                        symbol: tokenD.symbol,
                        decimals: tokenD.decimals,
                    },
                    amount: "1.22",
                },
            ],
        }).save();

        // DXD supply initial snapshot
        initialDXDSupply = new Decimal("11.23");
        await new DXDCirculatingSupplySnapshotModel({
            blockNumber: 0,
            supply: initialDXDSupply.toString(),
        }).save();
    });

    afterEach(async () => {
        await TreasuryBalancesSnapshotModel.deleteMany();
        await DXDCirculatingSupplySnapshotModel.deleteMany();
    });

    test("should ignore non-transfer event", async () => {
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        await handle(providerList, {
            // block number is increased so that if anything wrong gets
            // saved we can catch it by counting documents (no updates
            // happen)
            blockNumber: 10,
            blockHash: "",
            logIndex: 0,
            transactionHash: "",
            transactionIndex: 0,
            removed: false,
            topics: [keccak256(["string"], ["Random()"])],
            address: "0x0000000000000000000000000000000000000000",
            data: "0x",
        });
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        const supply = await getDXDCirculatingSupplyAtBlocks(10);
        expect(supply.toString()).toBe("11.23");
    });

    test("should reduce dxd supply on transfer to a 'holding' address", async () => {
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        await handle(providerList, {
            blockNumber: 10,
            blockHash: "",
            logIndex: 0,
            transactionHash: "",
            transactionIndex: 0,
            removed: false,
            topics: [
                ERC20_TRANSFER_SIGHASH,
                // from
                defaultAbiCoder.encode(
                    ["address"],
                    ["0x0000000000000000000000000000000000000001"]
                ),
                // to
                defaultAbiCoder.encode(["address"], [DXDAO_AVATAR]),
            ],
            address: DXD.address,
            data: defaultAbiCoder.encode(
                ["uint256"],
                [parseUnits("10", DXD.decimals)]
            ),
        });
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            2
        );
        const supply = await getDXDCirculatingSupplyAtBlocks(10);
        expect(supply.toString()).toBe("1.23");
    });

    test("should not reduce dxd supply on transfer between 'holding' addresses", async () => {
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        await handle(providerList, {
            blockNumber: 10,
            blockHash: "",
            logIndex: 0,
            transactionHash: "",
            transactionIndex: 0,
            removed: false,
            topics: [
                ERC20_TRANSFER_SIGHASH,
                // from
                defaultAbiCoder.encode(["address"], [DXD.address]),
                // to
                defaultAbiCoder.encode(["address"], [DXDAO_AVATAR]),
            ],
            address: DXD.address,
            data: defaultAbiCoder.encode(
                ["uint256"],
                [parseUnits("10", DXD.decimals)]
            ),
        });
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        const supply = await getDXDCirculatingSupplyAtBlocks(10);
        expect(supply.toString()).toBe("11.23");
    });

    test("should increase dxd supply on transfer to an external address", async () => {
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        await handle(providerList, {
            blockNumber: 10,
            blockHash: "",
            logIndex: 0,
            transactionHash: "",
            transactionIndex: 0,
            removed: false,
            topics: [
                ERC20_TRANSFER_SIGHASH,
                // from
                defaultAbiCoder.encode(["address"], [DXDAO_AVATAR]),
                // to
                defaultAbiCoder.encode(
                    ["address"],
                    ["0x0000000000000000000000000000000000000001"]
                ),
            ],
            address: DXD.address,
            data: defaultAbiCoder.encode(
                ["uint256"],
                [parseUnits("1", DXD.decimals)]
            ),
        });
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            2
        );
        const supply = await getDXDCirculatingSupplyAtBlocks(10);
        expect(supply.toString()).toBe("12.23");
    });

    test("should not increase dxd supply on transfer between 'holding' addresses", async () => {
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        await handle(providerList, {
            blockNumber: 10,
            blockHash: "",
            logIndex: 0,
            transactionHash: "",
            transactionIndex: 0,
            removed: false,
            topics: [
                ERC20_TRANSFER_SIGHASH,
                // from
                defaultAbiCoder.encode(["address"], [DXDAO_AVATAR]),
                // to
                defaultAbiCoder.encode(["address"], [DXD.address]),
            ],
            address: DXD.address,
            data: defaultAbiCoder.encode(
                ["uint256"],
                [parseUnits("5.123", DXD.decimals)]
            ),
        });
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        const supply = await getDXDCirculatingSupplyAtBlocks(10);
        expect(supply.toString()).toBe("11.23");
    });

    test("should reduce treasury token balance on transfer from avatar address", async () => {
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        const initialBalances = await getTreasuryBalancesAtBlocks({
            [ChainId.ETHEREUM]: 0,
            [ChainId.GNOSIS]: 0,
        });
        const token = tokenA;
        await handle(providerList, {
            blockNumber: 10,
            blockHash: "",
            logIndex: 0,
            transactionHash: "",
            transactionIndex: 0,
            removed: false,
            topics: [
                ERC20_TRANSFER_SIGHASH,
                // from
                defaultAbiCoder.encode(["address"], [DXDAO_AVATAR]),
                // to
                defaultAbiCoder.encode(
                    ["address"],
                    ["0x0000000000000000000000000000000000000001"]
                ),
            ],
            address: token.address,
            data: defaultAbiCoder.encode(
                ["uint256"],
                [parseUnits("2", token.decimals)]
            ),
        });
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(3);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        const balances = await getTreasuryBalancesAtBlocks({
            [ChainId.ETHEREUM]: 10,
            [ChainId.GNOSIS]: 1,
        });
        expect(balances.length).toBe(initialBalances.length);
        for (let i = 0; i < initialBalances.length; i++) {
            const initialBalance = initialBalances[i];
            const postUpdateBalance = balances[i];
            if (addressEqual(postUpdateBalance.currency.address, token.address))
                expect(postUpdateBalance.toString()).toBe(
                    initialBalance.minus("2").toString()
                );
            else
                expect(postUpdateBalance.toString()).toBe(
                    initialBalance.toString()
                );
        }
        const supply = await getDXDCirculatingSupplyAtBlocks(10);
        expect(supply.toString()).toBe("11.23");
    });

    test("should not reduce treasury token balance on self transfer", async () => {
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        const initialBalances = await getTreasuryBalancesAtBlocks({
            [ChainId.ETHEREUM]: 0,
            [ChainId.GNOSIS]: 0,
        });
        const token = tokenA;
        await handle(providerList, {
            blockNumber: 10,
            blockHash: "",
            logIndex: 0,
            transactionHash: "",
            transactionIndex: 0,
            removed: false,
            topics: [
                ERC20_TRANSFER_SIGHASH,
                // from
                defaultAbiCoder.encode(["address"], [DXDAO_AVATAR]),
                // to
                defaultAbiCoder.encode(["address"], [DXDAO_AVATAR]),
            ],
            address: token.address,
            data: defaultAbiCoder.encode(
                ["uint256"],
                [parseUnits("2", token.decimals)]
            ),
        });
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        const postUpdateBalances = await getTreasuryBalancesAtBlocks({
            [ChainId.ETHEREUM]: 10,
            [ChainId.GNOSIS]: 1,
        });
        expect(postUpdateBalances.length).toBe(initialBalances.length);
        for (let i = 0; i < initialBalances.length; i++) {
            const initialBalance = initialBalances[i];
            const postUpdateBalance = postUpdateBalances[i];
            expect(postUpdateBalance.toString()).toBe(
                initialBalance.toString()
            );
        }
        const supply = await getDXDCirculatingSupplyAtBlocks(10);
        expect(supply.toString()).toBe("11.23");
    });

    test("should reduce treasury token balance on transfer from avatar address", async () => {
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        const initialBalances = await getTreasuryBalancesAtBlocks({
            [ChainId.ETHEREUM]: 0,
            [ChainId.GNOSIS]: 0,
        });
        const token = tokenA;
        await handle(providerList, {
            blockNumber: 10,
            blockHash: "",
            logIndex: 0,
            transactionHash: "",
            transactionIndex: 0,
            removed: false,
            topics: [
                ERC20_TRANSFER_SIGHASH,
                // from
                defaultAbiCoder.encode(["address"], [DXDAO_AVATAR]),
                // to
                defaultAbiCoder.encode(
                    ["address"],
                    ["0x0000000000000000000000000000000000000001"]
                ),
            ],
            address: token.address,
            data: defaultAbiCoder.encode(
                ["uint256"],
                [parseUnits("2", token.decimals)]
            ),
        });
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(3);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        const balances = await getTreasuryBalancesAtBlocks({
            [ChainId.ETHEREUM]: 10,
            [ChainId.GNOSIS]: 1,
        });
        expect(balances.length).toBe(initialBalances.length);
        for (let i = 0; i < initialBalances.length; i++) {
            const initialBalance = initialBalances[i];
            const postUpdateBalance = balances[i];
            if (addressEqual(postUpdateBalance.currency.address, token.address))
                expect(postUpdateBalance.toString()).toBe(
                    initialBalance.minus("2").toString()
                );
            else
                expect(postUpdateBalance.toString()).toBe(
                    initialBalance.toString()
                );
        }
        const supply = await getDXDCirculatingSupplyAtBlocks(10);
        expect(supply.toString()).toBe("11.23");
    });

    test("should increase treasury token balance on transfer to avatar address", async () => {
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(2);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        const initialBalances = await getTreasuryBalancesAtBlocks({
            [ChainId.ETHEREUM]: 0,
            [ChainId.GNOSIS]: 0,
        });
        const token = tokenA;
        await handle(providerList, {
            blockNumber: 10,
            blockHash: "",
            logIndex: 0,
            transactionHash: "",
            transactionIndex: 0,
            removed: false,
            topics: [
                ERC20_TRANSFER_SIGHASH,
                // from
                defaultAbiCoder.encode(
                    ["address"],
                    ["0x0000000000000000000000000000000000000001"]
                ),
                // to
                defaultAbiCoder.encode(["address"], [DXDAO_AVATAR]),
            ],
            address: token.address,
            data: defaultAbiCoder.encode(
                ["uint256"],
                [parseUnits("2", token.decimals)]
            ),
        });
        expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(3);
        expect(await DXDCirculatingSupplySnapshotModel.countDocuments()).toBe(
            1
        );
        const balances = await getTreasuryBalancesAtBlocks({
            [ChainId.ETHEREUM]: 10,
            [ChainId.GNOSIS]: 1,
        });
        expect(balances.length).toBe(initialBalances.length);
        for (let i = 0; i < initialBalances.length; i++) {
            const initialBalance = initialBalances[i];
            const postUpdateBalance = balances[i];
            if (addressEqual(postUpdateBalance.currency.address, token.address))
                expect(postUpdateBalance.toString()).toBe(
                    initialBalance.plus("2").toString()
                );
            else
                expect(postUpdateBalance.toString()).toBe(
                    initialBalance.toString()
                );
        }
        const supply = await getDXDCirculatingSupplyAtBlocks(10);
        expect(supply.toString()).toBe("11.23");
    });
});
