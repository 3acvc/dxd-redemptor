import { Request } from "@hapi/hapi";
import { badRequest } from "@hapi/boom";
import {
    PROVIDER,
    ChainId,
    Quote,
    quote,
    Token,
    DXD,
    Amount,
} from "dxd-redemptor-oracle";
import { getVerifiers, verify } from "../utils/verifier";

interface QuoteRequest extends Request {
    query: {
        redeemedDXD: string;
        redeemedToken: string;
    };
}

interface QuoteResponse {
    quote: Quote;
    signatures: string[];
}

export async function handleQuote(
    request: QuoteRequest
): Promise<QuoteResponse> {
    try {
        const { redeemedDXD: rawRedeemedDXD, redeemedToken: rawRedeemedToken } =
            request.query;
        const block: Record<ChainId, number> = {
            [ChainId.ETHEREUM]:
                (await PROVIDER[ChainId.ETHEREUM].getBlockNumber()) - 10,
            [ChainId.GNOSIS]:
                (await PROVIDER[ChainId.GNOSIS].getBlockNumber()) - 10,
        };
        const redeemedToken = new Token(
            ChainId.ETHEREUM,
            rawRedeemedToken,
            // TODO: FETCH TOKEN ON-CHAIN
            18,
            "SYMBOL"
        );
        const redeemedDXD = Amount.fromRawAmount(
            DXD[ChainId.ETHEREUM],
            rawRedeemedDXD
        );
        const oracleQuote = await quote(block, redeemedToken, redeemedDXD);

        const verifiers = await getVerifiers();
        const signatures = [];
        for (const verifier of verifiers) {
            try {
                signatures.push(
                    await verify(verifier.endpoint, oracleQuote, block)
                );
            } catch (error) {
                console.error(
                    `verification failed for signer ${verifier.address} - reason:`,
                    error
                );
            }
        }

        return { quote: oracleQuote, signatures };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error(error);
        if (error.isBoom) {
            throw error;
        }
        throw badRequest(error);
    }
}
