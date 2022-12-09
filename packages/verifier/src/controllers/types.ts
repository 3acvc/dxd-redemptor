import { Quote } from "dxd-redemptor-oracle";

export interface IVerifyAndSignOracleAggreagatorMessageRequest extends Request {
    payload: {
        message: Quote;
        blockNumber: Record<string, number>;
    };
}
