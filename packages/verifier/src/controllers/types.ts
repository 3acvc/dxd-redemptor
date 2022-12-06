import { OracleMessageStruct } from '../../generated/contracts/DXDRedemptor';

export interface IVerifyAndSignOracleAggreagatorMessageRequest extends Request {
  payload: {
    message: OracleMessageStruct;
    blockNumber: Record<string, number>;
  };
}

