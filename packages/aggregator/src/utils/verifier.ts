import { LeanDocument } from "mongoose";
import { VerifierModel, VerifierDocument } from "../models/verifier";
import { getRedemptor } from "./redemptor";
import { ChainId } from "dxd-redemptor-oracle";
import { verifyMessage } from "@ethersproject/wallet";

export const getVerifiers = async (): Promise<
    LeanDocument<VerifierDocument>[]
> => {
    // TODO: use multicall here
    const verifiersFromDb = await VerifierModel.find().lean();
    const redemptor = getRedemptor();
    const verifiers = [];
    for (const verifierFromDb of verifiersFromDb) {
        if (await redemptor.isSigner(verifierFromDb)) {
            verifiers.push(verifierFromDb);
        }
    }
    return verifiers;
};

export const verifyQuote = async (
    verifierAddress: string,
    verifierEndpoint: string,
    quoteHash: string,
    block: Record<ChainId, number>
): Promise<string> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, 5_000);

    try {
        const { default: fetch } = await import("node-fetch");
        const response = await fetch(verifierEndpoint, {
            method: "POST",
            body: JSON.stringify({
                block,
            }),
            signal: controller.signal,
        });
        if (!response.ok) throw new Error("request failed");
        const { signature } = (await response.json()) as { signature: string };
        const addressFromSignature = verifyMessage(quoteHash, signature);
        if (addressFromSignature.toLowerCase() !== verifierAddress.toLowerCase())
            throw new Error(
                `expected signature from ${verifierAddress}, got one by ${addressFromSignature}`
            );
        return signature;
    } finally {
        clearTimeout(timeout);
    }
};
