import { Document, model, Schema } from 'mongoose';

export interface OracleSignerDocument extends Document {
  /**
   * The address of the signer
   */
  address: string;
  /**
   * The oracle URL to fetch the price from
   */
  oracleURL: string;
}

export const OracleSignerSchema = new Schema<OracleSignerDocument>(
  {
    address: {
      type: String,
      required: true,
      unique: true,
    },
    oracleURL: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * A oracle signer model contains information about a signer oracle: address and oracleURL.
 */
export const OracleSignerModel = model<OracleSignerDocument>(
  'OracleSigner',
  OracleSignerSchema
);

