import { LeanDocument } from "mongoose";
import { VerifierModel, VerifierDocument } from "../models/verifier";
import { getRedemptor } from "./redemptor";
import { ChainId, OracleMessageStruct } from "dxd-redemptor-oracle";

export const getVerifiers = async (): Promise<
    LeanDocument<VerifierDocument>[]
> => {
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

export const verify = async (
    verifierEndpoint: string,
    quote: OracleMessageStruct,
    blockNumber: Record<ChainId, number>
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
                quote,
                blockNumber,
            }),
            signal: controller.signal,
        });
        if (!response.ok) throw new Error("requiest failed");
        const { signature } = (await response.json()) as { signature: string };
        return signature;
    } finally {
        clearTimeout(timeout);
    }
};
