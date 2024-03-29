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
    getRequiredEnv("ETHEREUM_RPC_ENDPOINT")
  ),
  [ChainId.GNOSIS]: new JsonRpcProvider(getRequiredEnv("GNOSIS_RPC_ENDPOINT")),
};

const subgraphEndpointList: Record<ChainId, string> = {
  [ChainId.ETHEREUM]: getRequiredEnv("ETHEREUM_ORACLE_GRAPHQL_ENDPOINT"),
  [ChainId.GNOSIS]: getRequiredEnv("GNOSIS_ORACLE_GRAPHQL_ENDPOINT"),
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

    const aggregatorQuote = await getQuote({
      block,
      redeemedTokenAddress: rawRedeemedTokenAddress,
      redeemedDxdWeiAmount: rawRedeemedDXDAmount,
      providerList,
      subgraphEndpointList,
    });

    const verifiers = await getVerifiers();

    const allSignatures = await Promise.all(
      verifiers.map(async (verifier) => {
        try {
          return await verifyQuote(
            verifier.address,
            verifier.endpoint + "/verify",
            aggregatorQuote,
            block
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.log(error.response);
          // eslint-disable-next-line
          // @ts-ignore
          error = error?.response ? error?.response : error; // attempt to get the error from the response

          console.error(
            `verification failed for signer ${verifier.address} - reason:`,
            error
          );
          return null;
        }
      })
    );

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
    const signersThreshold = (await redemptor.signersThreshold()).toNumber();
    const totalRegisteredSigners = (await redemptor.signersAmount()).toNumber();
    const minimumSigners = Math.ceil(
      (totalRegisteredSigners * signersThreshold) / 10_000
    );
    // TODO: is bad request appropriate here?
    if (validSignatures.length < minimumSigners)
      throw badRequest("Not enough signatures");

    return { quote: aggregatorQuote, signatures: validSignatures };
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
