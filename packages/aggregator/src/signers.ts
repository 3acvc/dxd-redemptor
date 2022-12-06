/**
 * The aggregator module creates the initial quote and then sends requests to the different
 */

import axios from 'axios';

import { OracleMessageStruct } from '../generated/contracts/DXDRedemptor';

/**
 * Adds block number to the message.
 */
export interface IGetSignatureFromExternalSignerPayload {
  message: OracleMessageStruct;
  blockNumber: Record<string, number>;
}

/**
 * Makes an HTTP request to the given URL and return the response as a string.
 * @param {string} signerOralceURL
 * @param {IGetSignatureFromExternalSignerPayload} payload
 * @returns
 */
export async function getSignatureFromExternalSigner(
  signerOralceURL: string,
  payload: IGetSignatureFromExternalSignerPayload
): Promise<{
  signature: string;
}> {
  return axios
    .post<{
      signature: string;
    }>(signerOralceURL, payload, {
      timeout: 5000,
      timeoutErrorMessage: `Timeout while getting signature from signer`,
    })
    .then(response => response.data);
}

