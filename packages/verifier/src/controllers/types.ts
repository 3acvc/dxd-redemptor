import { OracleMessageStruct } from "dxd-redemptor-oracle";

export interface IVerifyAndSignOracleAggreagatorMessageRequest extends Request {
    payload: {
        message: OracleMessageStruct;
        blockNumber: Record<string, number>;
    };
}
