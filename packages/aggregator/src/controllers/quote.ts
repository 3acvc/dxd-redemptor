import { Request } from "@hapi/hapi";
import { badRequest } from "@hapi/boom";
import {
    ChainId,
    getOracleMessagePayload,
    getProviderList,
    OracleMessageStruct,
} from "dxd-redemptor-oracle";
import { getVerifiers, verify } from "../utils/verifier";

interface QuoteRequest extends Request {
    query: {
        redeemedDXD: string;
        redeemedToken: string;
    };
}

interface QuoteResponse {
    quote: OracleMessageStruct;
    signatures: string[];
}

export async function handleQuote(
    request: QuoteRequest
): Promise<QuoteResponse> {
    try {
        const { redeemedDXD, redeemedToken } = request.query;
        const provider = getProviderList();
        const blockNumber: Record<ChainId, number> = {
            [ChainId.Ethereum]: await provider[
                ChainId.Ethereum
            ].getBlockNumber(),
            [ChainId.Gnosis]: await provider[ChainId.Gnosis].getBlockNumber(),
        };
        const quote = await getOracleMessagePayload(blockNumber, {
            redeemedDXD,
            redeemedToken,
        });

        const verifiers = await getVerifiers();
        const signatures = [];
        for (const verifier of verifiers) {
            try {
                signatures.push(
                    await verify(verifier.endpoint, quote, blockNumber)
                );
            } catch (error) {
                console.error(
                    `verification failed for signer ${verifier.address} - reason:`,
                    error
                );
            }
        }

        return { quote, signatures };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error(error);
        if (error.isBoom) {
            throw error;
        }
        throw badRequest(error);
    }
}
