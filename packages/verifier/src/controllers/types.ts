import { Request } from "@hapi/hapi";
import { Quote } from "dxd-redemptor-oracle";

export interface IVerifyAndSignOracleAggreagatorMessageRequest extends Request {
    payload: {
        quote: Quote;
        blockNumber: Record<string, number>;
    };
}
