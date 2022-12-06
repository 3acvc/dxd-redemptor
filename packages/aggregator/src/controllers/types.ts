import { Request } from '@hapi/hapi';

import { OracleMessageStruct } from '../../generated/contracts/DXDRedemptor';

export interface IRegisterSignerRequest extends Request {
  payload: {
    /**
     * The signer address
     */
    signerAddress: string;
    /**
     * The oracle URL that will be used to get the signature. This URL should be publicly accessible.
     */
    oracleURL: string;
  };
}

export interface IGetOrderQuotePayloadRequest extends Request {
  payload: {
    /**
     * Amount of DXD to redeem.
     */
    redeemedDXD: string;
    /**
     * The address of the token DXD will be redeemed for.
     */
    redeemedToken: string;
  };
}

/**
 * The message oracle.
 */
export interface IGetOrderQuotePayloadResponse {
  data: {
    payload: OracleMessageStruct;
    sigantures: string[];
  };
}

