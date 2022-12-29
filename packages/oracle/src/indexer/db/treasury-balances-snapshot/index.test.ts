import Decimal from "decimal.js-light";
import mongoose from "mongoose";
import {
    getTreasuryBalancesAtBlocks,
    TreasuryBalancesSnapshotModel,
    updateTreasuryBalancesSnapshot,
} from ".";
import { ChainId } from "../../../constants";
import { BigNumber } from "@ethersproject/bignumber";
import { NAV_TOKEN_LIST, Token } from "../../../entities/token";
import { addressEqual } from "../../log-handlers/utils";
import { parseUnits } from "@ethersproject/units";

describe("treasury balances snapshot handling", () => {
    beforeAll(async () => {
        mongoose.connection.on("error", (error) => {
            console.error(error);
            process.exit(100);
        });
        await mongoose.connect(global.__MONGO_URI__, {});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe("update", () => {
        let blockNumber: number;
        let tokens: Token[];
        let initialBalance: Record<ChainId, { [address: string]: Decimal }>;

        beforeEach(async () => {
            blockNumber = 0;
            initialBalance = {
                [ChainId.ETHEREUM]: {},
                [ChainId.GNOSIS]: {},
            };
            tokens = NAV_TOKEN_LIST.filter(
                (token) => token.chainId === ChainId.ETHEREUM
            );
            await new TreasuryBalancesSnapshotModel({
                blockNumber,
                chainId: ChainId.ETHEREUM,
                balances: tokens.map((token, i) => {
                    const amount = new Decimal(i + 1);
                    initialBalance[ChainId.ETHEREUM][token.address] = amount;
                    return {
                        token: {
                            address: token.address,
                            symbol: token.symbol,
                            decimals: token.decimals,
                        },
                        amount,
                    };
                }),
            }).save();
            await new TreasuryBalancesSnapshotModel({
                blockNumber,
                chainId: ChainId.GNOSIS,
                balances: tokens.map((token, i) => {
                    const amount = new Decimal(tokens.length - i);
                    initialBalance[ChainId.GNOSIS][token.address] = amount;
                    return {
                        token: {
                            address: token.address,
                            symbol: token.symbol,
                            decimals: token.decimals,
                        },
                        amount,
                    };
                }),
            }).save();
        });

        afterEach(async () => {
            await TreasuryBalancesSnapshotModel.deleteMany();
        });

        test("should do nothing when supply change is 0", async () => {
            expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(
                2
            );
            const preUpdateDocument =
                await TreasuryBalancesSnapshotModel.findOne({
                    chainId: ChainId.ETHEREUM,
                });
            expect(preUpdateDocument).not.toBeNull();
            const token = tokens[0];
            await updateTreasuryBalancesSnapshot(
                ChainId.ETHEREUM,
                blockNumber + 1,
                token.address,
                BigNumber.from(0)
            );
            expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(
                2
            );
            const postUpdateDocument =
                await TreasuryBalancesSnapshotModel.findOne({
                    chainId: ChainId.ETHEREUM,
                });
            expect(postUpdateDocument).not.toBeNull();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const nonNullPostUpdateDocument = postUpdateDocument!;
            expect(preUpdateDocument?.equals(nonNullPostUpdateDocument)).toBe(
                true
            );
            expect(nonNullPostUpdateDocument.balances.length).toBe(
                tokens.length
            );
            expect(nonNullPostUpdateDocument.balances[0].token.address).toBe(
                token.address
            );
            expect(nonNullPostUpdateDocument.balances[0].token.symbol).toBe(
                token.symbol
            );
            expect(nonNullPostUpdateDocument.balances[0].token.decimals).toBe(
                token.decimals
            );
            expect(nonNullPostUpdateDocument.balances[0].amount).toBe(
                initialBalance[ChainId.ETHEREUM][token.address].toString()
            );
        });

        test("should update instead of saving a new snapshot when multiple updates are performed in the same block (positive change)", async () => {
            expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(
                2
            );
            const preUpdateDocument =
                await TreasuryBalancesSnapshotModel.findOne({
                    chainId: ChainId.ETHEREUM,
                });
            expect(preUpdateDocument).not.toBeNull();
            const updatedToken = tokens[0];
            const preUpdateTokenBalance = preUpdateDocument?.balances.find(
                (balance) =>
                    addressEqual(balance.token.address, updatedToken.address)
            );
            expect(preUpdateTokenBalance?.amount).toBe(
                initialBalance[ChainId.ETHEREUM][
                    updatedToken.address
                ].toString()
            );
            // positive change
            const positiveChange = new Decimal("10");
            await updateTreasuryBalancesSnapshot(
                ChainId.ETHEREUM,
                blockNumber,
                updatedToken.address,
                BigNumber.from(parseUnits(positiveChange.toString(), 18))
            );
            expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(
                2
            );
            const postUpdateDocument =
                await TreasuryBalancesSnapshotModel.findOne({
                    chainId: ChainId.ETHEREUM,
                });
            expect(postUpdateDocument).not.toBeNull();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const nonNullPostUpdateDocument = postUpdateDocument!;
            expect(nonNullPostUpdateDocument.blockNumber).toBe(
                preUpdateDocument?.blockNumber
            );
            const postUpdateTokenBalance = postUpdateDocument?.balances.find(
                (balance) =>
                    addressEqual(balance.token.address, updatedToken.address)
            );
            expect(postUpdateTokenBalance?.amount).toBe(
                initialBalance[ChainId.ETHEREUM][updatedToken.address]
                    .plus(positiveChange)
                    .toString()
            );
            // checks that an update has been performed
            expect(preUpdateDocument?.equals(nonNullPostUpdateDocument)).toBe(
                true
            );
        });

        test("should update instead of saving a new snapshot when multiple updates are performed in the same block (negative change)", async () => {
            expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(
                2
            );
            const preUpdateDocument =
                await TreasuryBalancesSnapshotModel.findOne({
                    chainId: ChainId.ETHEREUM,
                });
            expect(preUpdateDocument).not.toBeNull();
            const updatedToken = tokens[0];
            const preUpdateTokenBalance = preUpdateDocument?.balances.find(
                (balance) =>
                    addressEqual(balance.token.address, updatedToken.address)
            );
            expect(preUpdateTokenBalance?.amount).toBe(
                initialBalance[ChainId.ETHEREUM][
                    updatedToken.address
                ].toString()
            );
            // positive change
            const negativeChange = new Decimal("-0.2");
            await updateTreasuryBalancesSnapshot(
                ChainId.ETHEREUM,
                blockNumber,
                updatedToken.address,
                BigNumber.from(parseUnits(negativeChange.toString(), 18))
            );
            expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(
                2
            );
            const postUpdateDocument =
                await TreasuryBalancesSnapshotModel.findOne({
                    chainId: ChainId.ETHEREUM,
                });
            expect(postUpdateDocument).not.toBeNull();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const nonNullPostUpdateDocument = postUpdateDocument!;
            expect(nonNullPostUpdateDocument.blockNumber).toBe(
                preUpdateDocument?.blockNumber
            );
            const postUpdateTokenBalance = postUpdateDocument?.balances.find(
                (balance) =>
                    addressEqual(balance.token.address, updatedToken.address)
            );
            expect(postUpdateTokenBalance?.amount).toBe(
                initialBalance[ChainId.ETHEREUM][updatedToken.address]
                    .plus(negativeChange)
                    .toString()
            );
            // checks that an update has been performed
            expect(preUpdateDocument?.equals(nonNullPostUpdateDocument)).toBe(
                true
            );
        });

        test("should save a new snapshot when updates are performed across blocks (positive change)", async () => {
            expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(
                2
            );
            const preUpdateDocument =
                await TreasuryBalancesSnapshotModel.findOne({
                    chainId: ChainId.ETHEREUM,
                });
            expect(preUpdateDocument).not.toBeNull();
            const updatedToken = tokens[0];
            const preUpdateTokenBalance = preUpdateDocument?.balances.find(
                (balance) =>
                    addressEqual(balance.token.address, updatedToken.address)
            );
            expect(preUpdateTokenBalance?.amount).toBe(
                initialBalance[ChainId.ETHEREUM][
                    updatedToken.address
                ].toString()
            );
            // positive change
            const positiveChange = new Decimal("2");
            await updateTreasuryBalancesSnapshot(
                ChainId.ETHEREUM,
                blockNumber + 1,
                updatedToken.address,
                BigNumber.from(parseUnits(positiveChange.toString(), 18))
            );
            expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(
                3
            );
            const postUpdateDocument =
                await TreasuryBalancesSnapshotModel.findOne({
                    chainId: ChainId.ETHEREUM,
                }).sort([["blockNumber", "desc"]]);
            expect(postUpdateDocument).not.toBeNull();
            expect(postUpdateDocument?.blockNumber).not.toBe(
                preUpdateDocument?.blockNumber
            );
            expect(postUpdateDocument?.blockNumber).toBe(blockNumber + 1);
            const postUpdateTokenBalance = postUpdateDocument?.balances.find(
                (balance) =>
                    addressEqual(balance.token.address, updatedToken.address)
            );
            expect(postUpdateTokenBalance?.amount).toBe(
                initialBalance[ChainId.ETHEREUM][updatedToken.address]
                    .plus(positiveChange)
                    .toString()
            );
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(preUpdateDocument?.equals(postUpdateDocument!)).toBe(false);
        });

        test("should save a new snapshot when updates are performed across blocks (negative change)", async () => {
            expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(
                2
            );
            const preUpdateDocument =
                await TreasuryBalancesSnapshotModel.findOne({
                    chainId: ChainId.ETHEREUM,
                });
            expect(preUpdateDocument).not.toBeNull();
            const updatedToken = tokens[0];
            const preUpdateTokenBalance = preUpdateDocument?.balances.find(
                (balance) =>
                    addressEqual(balance.token.address, updatedToken.address)
            );
            expect(preUpdateTokenBalance?.amount).toBe(
                initialBalance[ChainId.ETHEREUM][
                    updatedToken.address
                ].toString()
            );
            // positive change
            const negativeChange = new Decimal("-0.1666");
            await updateTreasuryBalancesSnapshot(
                ChainId.ETHEREUM,
                blockNumber + 1,
                updatedToken.address,
                BigNumber.from(parseUnits(negativeChange.toString(), 18))
            );
            expect(await TreasuryBalancesSnapshotModel.countDocuments()).toBe(
                3
            );
            const postUpdateDocument =
                await TreasuryBalancesSnapshotModel.findOne({
                    chainId: ChainId.ETHEREUM,
                }).sort([["blockNumber", "desc"]]);
            expect(postUpdateDocument).not.toBeNull();
            expect(postUpdateDocument?.blockNumber).not.toBe(
                preUpdateDocument?.blockNumber
            );
            expect(postUpdateDocument?.blockNumber).toBe(blockNumber + 1);
            const postUpdateTokenBalance = postUpdateDocument?.balances.find(
                (balance) =>
                    addressEqual(balance.token.address, updatedToken.address)
            );
            expect(postUpdateTokenBalance?.amount).toBe(
                initialBalance[ChainId.ETHEREUM][updatedToken.address]
                    .plus(negativeChange)
                    .toString()
            );
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(preUpdateDocument?.equals(postUpdateDocument!)).toBe(false);
        });
    });

    describe("get supply at block", () => {
        let tokenA: Token, tokenB: Token, tokenC: Token, tokenD: Token;

        beforeEach(async () => {
            tokenA = new Token(
                ChainId.ETHEREUM,
                "0x000000000000000000000000000000000000000a",
                18,
                "A"
            );
            tokenB = new Token(
                ChainId.ETHEREUM,
                "0x000000000000000000000000000000000000000b",
                6,
                "B"
            );

            tokenC = new Token(
                ChainId.GNOSIS,
                "0x000000000000000000000000000000000000000c",
                18,
                "C"
            );
            tokenD = new Token(
                ChainId.GNOSIS,
                "0x000000000000000000000000000000000000000d",
                16,
                "D"
            );

            // Snapshot is:
            // Ethereum: 10 at block 0, 20 at block 5, 13.5 at block 20 and 2 at block 22
            // Gnosis: 2 at block 0, 61 at block 18, 13.5 at block 22
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
                        amount: "10",
                    },
                    {
                        token: {
                            address: tokenB.address,
                            symbol: tokenB.symbol,
                            decimals: tokenB.decimals,
                        },
                        amount: "5",
                    },
                ],
            }).save();
            await new TreasuryBalancesSnapshotModel({
                blockNumber: 5,
                chainId: ChainId.ETHEREUM,
                balances: [
                    {
                        token: {
                            address: tokenA.address,
                            symbol: tokenA.symbol,
                            decimals: tokenA.decimals,
                        },
                        amount: "20",
                    },
                    {
                        token: {
                            address: tokenB.address,
                            symbol: tokenB.symbol,
                            decimals: tokenB.decimals,
                        },
                        amount: "5",
                    },
                ],
            }).save();
            await new TreasuryBalancesSnapshotModel({
                blockNumber: 20,
                chainId: ChainId.ETHEREUM,
                balances: [
                    {
                        token: {
                            address: tokenA.address,
                            symbol: tokenA.symbol,
                            decimals: tokenA.decimals,
                        },
                        amount: "13.5",
                    },
                    {
                        token: {
                            address: tokenB.address,
                            symbol: tokenB.symbol,
                            decimals: tokenB.decimals,
                        },
                        amount: "20",
                    },
                ],
            }).save();
            await new TreasuryBalancesSnapshotModel({
                blockNumber: 22,
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
            await new TreasuryBalancesSnapshotModel({
                blockNumber: 18,
                chainId: ChainId.GNOSIS,
                balances: [
                    {
                        token: {
                            address: tokenC.address,
                            symbol: tokenC.symbol,
                            decimals: tokenC.decimals,
                        },
                        amount: "61",
                    },
                    {
                        token: {
                            address: tokenD.address,
                            symbol: tokenD.symbol,
                            decimals: tokenD.decimals,
                        },
                        amount: "0.8818888181881",
                    },
                ],
            }).save();
            await new TreasuryBalancesSnapshotModel({
                blockNumber: 22,
                chainId: ChainId.ETHEREUM,
                balances: [
                    {
                        token: {
                            address: tokenC.address,
                            symbol: tokenC.symbol,
                            decimals: tokenC.decimals,
                        },
                        amount: "13.5",
                    },
                    {
                        token: {
                            address: tokenD.address,
                            symbol: tokenD.symbol,
                            decimals: tokenD.decimals,
                        },
                        amount: "712.123",
                    },
                ],
            }).save();
        });

        afterEach(async () => {
            await TreasuryBalancesSnapshotModel.deleteMany();
        });

        test("should work when getting a snapshot", async () => {
            const balances = await getTreasuryBalancesAtBlocks({
                [ChainId.ETHEREUM]: 2,
                [ChainId.GNOSIS]: 20,
            });
            expect(balances.length).toBe(4);
            const tokenABalance = balances.find((balance) =>
                balance.currency.equals(tokenA)
            );
            const tokenBBalance = balances.find((balance) =>
                balance.currency.equals(tokenB)
            );
            const tokenCBalance = balances.find((balance) =>
                balance.currency.equals(tokenC)
            );
            const tokenDBalance = balances.find((balance) =>
                balance.currency.equals(tokenD)
            );
            expect(tokenABalance).not.toBeUndefined();
            expect(tokenBBalance).not.toBeUndefined();
            expect(tokenCBalance).not.toBeUndefined();
            expect(tokenDBalance).not.toBeUndefined();
            expect(tokenABalance?.eq(new Decimal("10"))).toBe(true);
            expect(tokenBBalance?.eq(new Decimal("5"))).toBe(true);
            expect(tokenCBalance?.eq(new Decimal("61"))).toBe(true);
            expect(tokenDBalance?.eq(new Decimal("0.8818888181881"))).toBe(
                true
            );
        });

        test("should work when getting a snapshot (blocks right on a new snapshot)", async () => {
            const balances = await getTreasuryBalancesAtBlocks({
                [ChainId.ETHEREUM]: 20,
                [ChainId.GNOSIS]: 0,
            });
            expect(balances.length).toBe(4);
            const tokenABalance = balances.find((balance) =>
                balance.currency.equals(tokenA)
            );
            const tokenBBalance = balances.find((balance) =>
                balance.currency.equals(tokenB)
            );
            const tokenCBalance = balances.find((balance) =>
                balance.currency.equals(tokenC)
            );
            const tokenDBalance = balances.find((balance) =>
                balance.currency.equals(tokenD)
            );
            expect(tokenABalance).not.toBeUndefined();
            expect(tokenBBalance).not.toBeUndefined();
            expect(tokenCBalance).not.toBeUndefined();
            expect(tokenDBalance).not.toBeUndefined();
            expect(tokenABalance?.eq(new Decimal("13.5"))).toBe(true);
            expect(tokenBBalance?.eq(new Decimal("20"))).toBe(true);
            expect(tokenCBalance?.eq(new Decimal("2"))).toBe(true);
            expect(tokenDBalance?.eq(new Decimal("1.22"))).toBe(true);
        });

        test("should fail when trying to get a very old snapshot", async () => {
            await expect(
                getTreasuryBalancesAtBlocks({
                    [ChainId.ETHEREUM]: -1,
                    [ChainId.GNOSIS]: 18,
                })
            ).rejects.toEqual(new Error("no snapshot present"));
        });
    });
});
