import { badRequest } from "@hapi/boom";
import { ResponseObject, ResponseToolkit } from "@hapi/hapi";
import { captureException } from "@sentry/node";

import {
    ChainId,
    getProviderList,
    getOracleMessagePayload,
    getDXDRedemptorContract,
    getDXDCirculatingSupply,
} from "dxd-redemptor-oracle";
import { getVerifiedOracleSigners } from "../db";
import { OracleSignerModel } from "../models/Signer.model";
import { getSignatureFromExternalSigner } from "../signers";

import {
    IGetOrderQuotePayloadRequest,
    IGetOrderQuotePayloadResponse,
    IRegisterSignerRequest,
} from "./types";

/**
 * Returns a quote for the given amount of DXD.
 */
export async function getOrderQuotePayloadController(
    req: IGetOrderQuotePayloadRequest
): Promise<IGetOrderQuotePayloadResponse> {
    // get all signers from the database and then compare them agaisnt the redemer contract
    try {
        const { redeemedDXD, redeemedToken } = req.payload;

        const provider = getProviderList();

        const blockNumber: Record<ChainId, number> = {
            [ChainId.Ethereum]: await provider[1].getBlockNumber(),
            [ChainId.Gnosis]: await provider[100].getBlockNumber(),
        };

        // get all signatures from the contract signers (DXdao members)
        const responseBody: IGetOrderQuotePayloadResponse = {
            data: {
                payload: {
                    redeemedDXD,
                    redeemedToken,
                    ...(await getOracleMessagePayload(blockNumber)),
                },
                sigantures: [],
            },
        };

        // First get total circulating supply of DXD
        responseBody.data.payload.circulatingDXDSupply = await (
            await getDXDCirculatingSupply(blockNumber)
        ).toString();

        const oracleSigners = await getVerifiedOracleSigners();

        for (const signer of oracleSigners) {
            try {
                // Fetcb the signature from the external signer, passing
                // the payload and the block number that the oracle used to generate the payload
                const { signature: signerSignature } =
                    await getSignatureFromExternalSigner(signer.oracleURL, {
                        message: responseBody.data.payload,
                        blockNumber,
                    });
                responseBody.data.sigantures.push(signerSignature);
            } catch (error) {
                captureException(error);
            }
        }
        return responseBody;
    } catch (error) {
        console.error(error);
        captureException(error);

        if (error.isBoom) {
            throw error;
        }

        throw badRequest(error);
    }
}

/**
 * A signer node must call this endpoint to register themselves as a signer.
 * @param {RegisterSignerRequest} req
 * @param payload
 */
export async function registerSignerController(
    req: IRegisterSignerRequest,
    res: ResponseToolkit
): Promise<ResponseObject> {
    try {
        const { signerAddress, oracleURL } = req.payload;

        // is the signer registered in the contract?
        const isASigner = await getDXDRedemptorContract().isSigner(
            signerAddress
        );

        if (!isASigner) {
            throw new Error(
                `Signer ${signerAddress} is not registered in the contract`
            );
        }

        // save the signer in the database
        await new OracleSignerModel({
            address: signerAddress,
            oracleURL,
        }).save();

        // the signer was added to the database
        return res.response().code(200);
    } catch (error) {
        console.error(error);
        captureException(error);

        if (error.isBoom) {
            throw error;
        }

        throw badRequest(error);
    }
}
