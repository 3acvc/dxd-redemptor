import { getRequiredEnv } from "./env";
import { Contract } from "@ethersproject/contracts";
import { REDEMPTOR_ABI } from "../abis/redemptor";
import { JsonRpcProvider } from "@ethersproject/providers";

const address = getRequiredEnv("REDEMPTOR_ADDRESS");
const provider = new JsonRpcProvider(getRequiredEnv("ETHEREUM_RPC_ENDPOINT"));

export const getRedemptor = (): Contract => {
  return new Contract(address, REDEMPTOR_ABI, provider);
};
