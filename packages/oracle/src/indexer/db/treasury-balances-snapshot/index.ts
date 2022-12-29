import { Document, model, Schema } from "mongoose";
import { ChainId, DXDAO_AVATAR } from "../../../constants";
import { BigNumber } from "@ethersproject/bignumber";
import { enforce } from "../../../utils/invariant";
import { Amount, Token } from "../../../entities";
import Decimal from "decimal.js-light";
import { formatUnits } from "@ethersproject/units";
import { addressEqual } from "../../log-handlers/utils";
import { NAV_TOKEN_LIST } from "../../../entities/token";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getTokenBalancesAtBlock } from "../../../utils/balances";

interface ERC20TokenAmountDocument {
    token: {
        address: string;
        symbol: string;
        decimals: number;
    };
    amount: string;
}

const ERC20TokenAmountSchema = new Schema<ERC20TokenAmountDocument>(
    {
        token: {
            address: {
                type: String,
                required: true,
            },
            symbol: {
                type: String,
                required: true,
            },
            decimals: {
                type: Number,
                required: true,
            },
        },
        amount: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export interface TreasuryBalancesSnapshotDocument extends Document {
    chainId: number;
    blockNumber: number;
    balances: ERC20TokenAmountDocument[];
}

export const TreasuryBalancesSnapshotSchema =
    new Schema<TreasuryBalancesSnapshotDocument>(
        {
            chainId: {
                type: Number,
                required: true,
            },
            blockNumber: {
                type: Number,
                required: true,
            },
            balances: {
                type: [ERC20TokenAmountSchema],
                required: true,
            },
        },
        { timestamps: true }
    );

export const TreasuryBalancesSnapshotModel =
    model<TreasuryBalancesSnapshotDocument>(
        "TreasuryBalancesSnapshot",
        TreasuryBalancesSnapshotSchema
    );

export const initializeTreasuryBalancesSnapshot = async (
    blockNumbers: Record<ChainId, number>,
    providerList: Record<ChainId, JsonRpcProvider>
) => {
    await TreasuryBalancesSnapshotModel.deleteMany();

    const balancesByChain: Record<ChainId, ERC20TokenAmountDocument[]> = {
        [ChainId.ETHEREUM]: [],
        [ChainId.GNOSIS]: [],
    };
    const treasuryTokenBalances = await getTokenBalancesAtBlock(
        NAV_TOKEN_LIST.map((token) => ({
            token,
            owner: DXDAO_AVATAR[token.chainId],
        })),
        blockNumbers,
        providerList
    );

    for (const balance of treasuryTokenBalances) {
        const { chainId, address, symbol, decimals } = balance.currency;
        balancesByChain[chainId].push({
            token: {
                address,
                symbol,
                decimals,
            },
            amount: balance.toString(),
        });
    }

    await new TreasuryBalancesSnapshotModel({
        chainId: ChainId.ETHEREUM,
        blockNumber: blockNumbers[ChainId.ETHEREUM],
        balances: balancesByChain[ChainId.ETHEREUM],
    }).save();
    await new TreasuryBalancesSnapshotModel({
        chainId: ChainId.GNOSIS,
        blockNumber: blockNumbers[ChainId.GNOSIS],
        balances: balancesByChain[ChainId.GNOSIS],
    }).save();
};

export const updateTreasuryBalancesSnapshot = async (
    chainId: ChainId,
    blockNumber: number,
    tokenAddress: string,
    balanceChange: BigNumber
) => {
    if (balanceChange.isZero()) return;
    const currentSnapshot = await TreasuryBalancesSnapshotModel.findOne({
        chainId,
    }).sort([["blockNumber", "desc"]]);
    enforce(
        !!currentSnapshot && blockNumber >= currentSnapshot.blockNumber,
        "inconsistent snapshot update"
    );
    let updated = false;
    currentSnapshot.balances = currentSnapshot.balances.map((balance) => {
        if (!addressEqual(tokenAddress, balance.token.address)) return balance;
        if (!updated) updated = true;
        return {
            ...balance,
            amount: new Decimal(balance.amount)
                .add(formatUnits(balanceChange, balance.token.decimals))
                .toString(),
        };
    });
    enforce(!!updated, "no update");
    if (currentSnapshot.blockNumber === blockNumber) {
        await currentSnapshot.save();
    } else {
        await new TreasuryBalancesSnapshotModel({
            chainId: currentSnapshot.chainId,
            blockNumber,
            balances: currentSnapshot.balances,
        }).save();
    }
};

export const getTreasuryBalancesAtBlocks = async (
    blockNumber: Record<ChainId, number>
): Promise<Amount<Token>[]> => {
    return (
        await Promise.all(
            Object.entries(blockNumber).map(
                async ([rawChainId, blockNumber]) => {
                    const chainId = parseInt(rawChainId);
                    const snapshot =
                        await TreasuryBalancesSnapshotModel.findOne({
                            chainId,
                            blockNumber: { $lte: blockNumber },
                        })
                            .sort([["blockNumber", "desc"]])
                            .lean();
                    enforce(!!snapshot, "no snapshot present");
                    return snapshot.balances.map((balance) => {
                        const token = new Token(
                            chainId,
                            balance.token.address,
                            balance.token.decimals,
                            balance.token.symbol
                        );
                        return new Amount(token, balance.amount);
                    });
                }
            )
        )
    ).flat(1);
};
