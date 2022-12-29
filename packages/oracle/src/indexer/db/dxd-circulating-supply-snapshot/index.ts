import { model, Schema, Document } from "mongoose";
import { BigNumber } from "@ethersproject/bignumber";
import { enforce } from "../../../utils/invariant";
import Decimal from "decimal.js-light";
import { formatUnits } from "@ethersproject/units";
import { getDXDCirculatingSupply } from "../../../utils/dxd";
import { WebSocketProvider } from "@ethersproject/providers";
import { ChainId } from "../../../constants";

export interface DXDCirculatingSupplySnapshotDocument extends Document {
    supply: string;
    blockNumber: number;
}

export const DXDCirculatingSupplySnapshotSchema =
    new Schema<DXDCirculatingSupplySnapshotDocument>(
        {
            supply: {
                type: String,
                required: true,
            },
            blockNumber: {
                type: Number,
                required: true,
            },
        },
        { timestamps: true }
    );

export const DXDCirculatingSupplySnapshotModel =
    model<DXDCirculatingSupplySnapshotDocument>(
        "DXDCirculatingSupplySnapshot",
        DXDCirculatingSupplySnapshotSchema
    );

export const initializeDXDCirculatingSupplySnapshot = async (
    blockNumber: Record<ChainId, number>,
    providerList: Record<ChainId, WebSocketProvider>
) => {
    await DXDCirculatingSupplySnapshotModel.deleteMany();
    const initialDXDSupply = await getDXDCirculatingSupply(
        blockNumber,
        providerList
    );
    await new DXDCirculatingSupplySnapshotModel({
        blockNumber: blockNumber[ChainId.ETHEREUM],
        supply: initialDXDSupply,
    }).save();
};

export const updateDXDCirculatingSupplySnapshot = async (
    blockNumber: number,
    supplyChange: BigNumber
) => {
    if (supplyChange.isZero()) return;
    const currentSnapshot =
        await DXDCirculatingSupplySnapshotModel.findOne().sort([
            ["blockNumber", "desc"],
        ]);
    enforce(
        !!currentSnapshot && blockNumber >= currentSnapshot.blockNumber,
        "inconsistent snapshot update"
    );
    const newSupply = new Decimal(currentSnapshot.supply)
        // rest assured as dxd has 18 decimals
        .plus(formatUnits(supplyChange, 18))
        .toString();
    if (currentSnapshot.blockNumber === blockNumber) {
        currentSnapshot.supply = newSupply;
        await currentSnapshot.save();
    } else {
        await new DXDCirculatingSupplySnapshotModel({
            blockNumber,
            supply: newSupply,
        }).save();
    }
};

export const getDXDCirculatingSupplyAtBlocks = async (
    blockNumber: number
): Promise<Decimal> => {
    const snapshot = await DXDCirculatingSupplySnapshotModel.findOne({
        blockNumber: { $lte: blockNumber },
    })
        .sort([["blockNumber", "desc"]])
        .lean();
    enforce(!!snapshot, "no snapshot present");
    return new Decimal(snapshot.supply);
};
