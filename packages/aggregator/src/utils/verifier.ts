import { LeanDocument } from "mongoose";
import { VerifierModel, VerifierDocument } from "../models/verifier";
import { getRedemptor } from "./redemptor";
import { ChainId, Quote, verifyQuoteSignature } from "dxd-redemptor-oracle";
import axios from "axios";

export const getVerifiers = async (): Promise<
    LeanDocument<VerifierDocument>[]
> => {
    // TODO: use multicall here
    const verifiersFromDb = await VerifierModel.find().lean();
    const redemptor = getRedemptor();
    const verifiers = [];
    for (const verifierFromDb of verifiersFromDb) {
        if (await redemptor.isSigner(verifierFromDb.address)) {
            verifiers.push(verifierFromDb);
        }
    }
    return verifiers;
};

export const verifyQuote = async (
    verifierAddress: string,
    verifierEndpoint: string,
    quote: Quote,
    block: Record<ChainId, number>
): Promise<string> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, 5_000);

    try {
        const response = await axios.post(verifierEndpoint, {
            blockNumber: block,
            quote,
        });

        const verifierSignature = response.data.data.signature;

        const addressFromSignature = verifyQuoteSignature(
            quote,
            getRedemptor().address,
            verifierSignature
        );

        if (
            addressFromSignature.toLowerCase() !== verifierAddress.toLowerCase()
        ) {
            throw new Error(
                `expected signature from ${verifierAddress}, got one by ${addressFromSignature}`
            );
        }

        return verifierSignature;
    } finally {
        clearTimeout(timeout);
    }
};
