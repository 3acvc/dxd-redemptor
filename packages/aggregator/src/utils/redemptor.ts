import {
    ChainId,
    getDXDRedemptorContract,
    getProvider,
} from "dxd-redemptor-oracle";
import { getRequiredEnv } from "./env";
import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";

const address = getRequiredEnv("REDEMPTOR_ADDRESS");
const provider = getProvider(ChainId.Ethereum);

export const getRedemptor = (): Contract => {
    return getDXDRedemptorContract(address, provider as JsonRpcProvider);
};
