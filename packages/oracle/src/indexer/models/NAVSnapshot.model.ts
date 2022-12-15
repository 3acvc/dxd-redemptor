import { Document, model, Schema } from "mongoose";
import { ChainId } from "../../constants";

export interface NAVTokenDocument {
    address: string;
    symbol: string;
    decimals: number;
    balance: string;
}

interface NAVSnapshotDocument extends Document {
    _id: string;
    chainId: ChainId;
    block: number;
    timestamp: Date;
    nav: number;
    navTokenList: NAVTokenDocument[];
    navAddressList: string[];
}

const NAVTokenSchema = new Schema<NAVTokenDocument>(
    {
        address: {
            type: String,
            required: true,
        },
        balance: {
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
        // usdValue: {
        //     type: Number,
        //     required: true,
        // },
    },
    {
        timestamps: true,
    }
);

const NAVSnapshotSchema = new Schema<NAVSnapshotDocument>(
    {
        chainId: {
            type: Schema.Types.Number,
            required: true,
            enum: Object.values(ChainId),
        },
        block: {
            type: Schema.Types.Number,
            required: true,
        },
        timestamp: {
            type: Schema.Types.Date,
            required: true,
        },
        nav: {
            type: Number,
            required: true,
        },
        navTokenList: {
            type: [NAVTokenSchema],
            required: true,
        },
        navAddressList: {
            type: [String],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

NAVSnapshotSchema.index(
    {
        chainId: 1,
        blockNumber: 1,
    },
    { unique: true }
);

export const NAVSnapshotModel = model<NAVSnapshotDocument>(
    "NAVSnapshot",
    NAVSnapshotSchema
);
