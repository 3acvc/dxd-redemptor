import { badRequest } from "@hapi/boom";
import { Wallet } from "@ethersproject/wallet";

import {
  ChainId,
  getQuote,
  signQuote,
  quoteToEIP712Hash,
} from "dxd-redemptor-oracle";

import { IVerifyAndSignOracleAggreagatorMessageRequest } from "./types";
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { getRequiredEnv } from "../utils/env";

const providerList: Record<ChainId, Provider> = {
  [ChainId.ETHEREUM]: new JsonRpcProvider(
    getRequiredEnv("ETHEREUM_RPC_ENDPOINT")
  ),
  [ChainId.GNOSIS]: new JsonRpcProvider(getRequiredEnv("GNOSIS_RPC_ENDPOINT")),
};

const subgraphEndpointList: Record<ChainId, string> = {
  [ChainId.ETHEREUM]: getRequiredEnv("ETHEREUM_ORACLE_GRAPHQL_ENDPOINT"),
  [ChainId.GNOSIS]: getRequiredEnv("GNOSIS_ORACLE_GRAPHQL_ENDPOINT"),
};

const verifyingContract = getRequiredEnv("REDEMPTOR_ADDRESS");

/**
 * Verifies and signs a message from the oracle aggregator
 * @param req The request object
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
    const { blockNumber, quote: aggregatorQuote } = req.payload;
    // For value,s verify that the message is correct
    const verifierQuote = await getQuote({
      block: blockNumber as Record<ChainId, number>,
      redeemedTokenAddress: aggregatorQuote.redeemedToken,
      redeemedDxdWeiAmount: aggregatorQuote.redeemedDXD,
      providerList,
      subgraphEndpointList,
      deadline: parseInt(aggregatorQuote.deadline),
    });

    // Verify that the message is correct
    const aggregatorQuoteHash = quoteToEIP712Hash(aggregatorQuote);
    const verifierQuoteHash = quoteToEIP712Hash(verifierQuote);

    // Verify that the message is correct
    if (aggregatorQuoteHash !== verifierQuoteHash) {
      throw badRequest(`Aggregator does not match verifier's quote`);
    }

    // Construst the signer from the private key
    const signer = new Wallet(process.env.SIGNER_PRIVATE_KEY as string);

    // When the message is correct, sign it and return the signature
    const signature = await signQuote(
      signer,
      aggregatorQuote,
      verifyingContract
    );

    return {
      data: {
        signature,
      },
    };
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
