import { Request } from "@hapi/hapi";
import { badRequest } from "@hapi/boom";
import { ChainId, getQuote, Quote } from "dxd-redemptor-oracle";
import { getVerifiers, verifyQuote } from "../utils/verifier";
import { getRedemptor } from "../utils/redemptor";
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { getRequiredEnv } from "../utils/env";

const redemptor = getRedemptor();

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

const providerList: Record<ChainId, Provider> = {
    [ChainId.ETHEREUM]: new JsonRpcProvider(
        getRequiredEnv("JSON_RPC_PROVIDER_ETHEREUM")
    ),
    [ChainId.GNOSIS]: new JsonRpcProvider(
        getRequiredEnv("JSON_RPC_PROVIDER_GNOSIS")
    ),
};

export async function handleQuote(
    request: QuoteRequest
): Promise<QuoteResponse> {
    try {
        const {
            redeemedDXD: rawRedeemedDXDAmount,
            redeemedToken: rawRedeemedTokenAddress,
        } = request.query;
        const block: Record<ChainId, number> = {
            [ChainId.ETHEREUM]:
                (await providerList[ChainId.ETHEREUM].getBlockNumber()) - 10,
            [ChainId.GNOSIS]:
                (await providerList[ChainId.GNOSIS].getBlockNumber()) - 10,
        };

        const oracleQuote = await getQuote(
            block,
            rawRedeemedTokenAddress,
            rawRedeemedDXDAmount,
            providerList
        );

        const verifiers = await getVerifiers();

        const allSignatures = await Promise.all(
            verifiers.map(async (verifier) => {
                try {
                    return await verifyQuote(
                        verifier.address,
                        verifier.endpoint + "/verify",
                        oracleQuote,
                        block
                    );
                } catch (error) {
                    console.error(
                        `verification failed for signer ${verifier.address} - reason:`,
                        error
                    );
                    return null;
                }
            })
        );

        console.log({
            allSignatures,
        });

        const validSignatures = allSignatures.reduce(
            (validSignatures: string[], signature) => {
                if (!!signature && validSignatures.indexOf(signature) < 0)
                    validSignatures.push(signature);
                return validSignatures;
            },
            []
        );

        // converting to number is safe, we're dealing with bps
        // and small numbers
        const signersThreshold = (
            await redemptor.signersThreshold()
        ).toNumber();
        const totalRegisteredSigners = (
            await redemptor.signersAmount()
        ).toNumber();
        const minimumSigners = Math.ceil(
            (totalRegisteredSigners * signersThreshold) / 10_000
        );
        // TODO: is bad request appropriate here?
        if (validSignatures.length < minimumSigners)
            throw badRequest("Not enough signatures");

        return { quote: oracleQuote, signatures: validSignatures };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
        console.error(error);
        // eslint-disable-next-line
        // @ts-ignore
        if (error.isBoom) {
            throw error;
        }
        // eslint-disable-next-line
        // @ts-ignore
        throw badRequest(error);
    }
}
