import { Provider } from "@ethersproject/abstract-provider";
import { badRequest } from "@hapi/boom";
import { Wallet } from "@ethersproject/wallet";

import {
    Amount,
    ChainId,
    DXD,
    quote,
    Token,
    signQuote,
} from "dxd-redemptor-oracle";

import { IVerifyAndSignOracleAggreagatorMessageRequest } from "./types";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getRequiredEnv } from "../utils/env";

const providerList: Record<ChainId, Provider> = {
    [ChainId.ETHEREUM]: new JsonRpcProvider(
        getRequiredEnv("JSON_RPC_PROVIDER_ETHEREUM")
    ),
    [ChainId.GNOSIS]: new JsonRpcProvider(
        getRequiredEnv("JSON_RPC_PROVIDER_GNOSIS")
    ),
};

const verifyingContract = getRequiredEnv("REDEMPTOR_ADDRESS");

/**
 * Verifies and signs a message from the oracle aggregator
 */
export async function verifyAndSignOracleAggreagatorMessageController(
    req: IVerifyAndSignOracleAggreagatorMessageRequest
): Promise<{
    data: {
        signature: string;
    };
}> {
    // get all signers from the database and then compare them agaisnt the redemer contract
    try {
        const { blockNumber, message: aggregatorQuote } = req.payload;

        const responseBody = {
            data: {
                signature: "",
            },
        };

        const redeemedToken = new Token(
            ChainId.ETHEREUM,
            aggregatorQuote.redeemedToken,
            // TODO: FETCH TOKEN ON-CHAIN
            18,
            "SYMBOL"
        );
        const redeemedDXD = Amount.fromRawAmount(
            DXD[ChainId.ETHEREUM],
            aggregatorQuote.redeemedDXD
        );

        // For value,s verify that the message is correct
        const verifierQuote = await quote(
            blockNumber as Record<ChainId, number>,
            redeemedToken,
            redeemedDXD,
            providerList
        );

        // Verify that the message is correct
        if (
            aggregatorQuote.circulatingDXDSupply !==
                verifierQuote.circulatingDXDSupply ||
            aggregatorQuote.redeemedAmount !== verifierQuote.redeemedAmount ||
            aggregatorQuote.redeemedToken !== verifierQuote.redeemedToken
        ) {
            throw badRequest("Message is not correct");
        }

        // Construst the signer from the private key
        const signer = new Wallet(process.env.SIGNER_PRIVATE_KEY as string);

        // When the message is correct, sign it and return the signature
        responseBody.data.signature = await signQuote(
            signer,
            {
                verifyingContract,
                chainId: ChainId.ETHEREUM,
            },
            aggregatorQuote
        );

        return responseBody;
    } catch (error: any) {
        console.error(error);
        if (error.isBoom) {
            throw error;
        }
        throw badRequest(error);
    }
}
