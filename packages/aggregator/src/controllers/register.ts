import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import { badRequest, unauthorized } from "@hapi/boom";
import { keccak256 } from "@ethersproject/solidity";
import { verifyMessage } from "@ethersproject/wallet";
import { getRedemptor } from "../utils/redemptor";
import { VerifierModel } from "../models/verifier";

const redemptor = getRedemptor();
const REGISTRATION_MESSAGE = `\x19Ethereum Signed Message:\n32${keccak256(
  ["string"],
  ["Bro I'd like to be a signer"]
)}`;

interface RegistrationRequest extends Request {
  payload: {
    signature: string;
    endpoint: string;
  };
}

/**
 * Get the registration message
 * @returns
 */
export async function handleGetRegisterationMessage(): Promise<{
  data: {
    message: string;
  };
}> {
  return {
    data: {
      message: REGISTRATION_MESSAGE,
    },
  };
}

export async function handleRegister(
  request: RegistrationRequest,
  response: ResponseToolkit
): Promise<ResponseObject> {
  try {
    const { signature, endpoint } = request.payload;

    // validate the endpoint is a valid URL
    if (new URL(endpoint).protocol !== "https:") {
      throw badRequest("endpoint protocol must be https");
    }

    const signer = verifyMessage(REGISTRATION_MESSAGE, signature);
    if (!(await redemptor.isSigner())) throw unauthorized();
    await new VerifierModel({ address: signer, endpoint }).save();
    return response.response().code(201);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    if (error.isBoom) {
      throw error;
    }
    throw badRequest(error);
  }
}
