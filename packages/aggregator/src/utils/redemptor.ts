import { ChainId, PROVIDER } from "dxd-redemptor-oracle";
import { getRequiredEnv } from "./env";
import { Contract } from "@ethersproject/contracts";
import { REDEMPTOR_ABI } from "../abis/redemptor";

const address = getRequiredEnv("REDEMPTOR_ADDRESS");
const provider = PROVIDER[ChainId.ETHEREUM];

export const getRedemptor = (): Contract => {
    return new Contract(address, REDEMPTOR_ABI, provider);
};
