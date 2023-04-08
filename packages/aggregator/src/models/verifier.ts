import { Document, model, Schema } from "mongoose";

export interface VerifierDocument extends Document {
  address: string;
  endpoint: string;
}

export const VerifierSchema = new Schema<VerifierDocument>(
  {
    address: {
      type: String,
      required: true,
      unique: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const VerifierModel = model<VerifierDocument>(
  "Verifier",
  VerifierSchema
);
