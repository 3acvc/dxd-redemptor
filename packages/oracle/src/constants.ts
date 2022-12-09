import { Interface } from "@ethersproject/abi";
import { GraphQLClient } from "graphql-request";
import { ERC20_ABI } from "./abis/erc20";

export enum ChainId {
    ETHEREUM = 1,
    GNOSIS = 100,
}

export const getRequiredEnv = (key: string): string => {
    const value = process.env[key] as string;
    if (!value) {
        console.error(`${key} env is required`);
        process.exit(1);
    }
    return value;
};

export const getEnv = (key: string): string => {
    return process.env[key] as string;
};

/**
 * Native token addresses. Same for all networks.
 *
 */
export const NATIVE_TOKEN_ADDRESS =
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

/**
 * Multicall contract addresses. Same for all networks.
 */
export const MULTICALL_ADDRESS = "0xca11bde05977b3631167028862be2a173976ca11";

export const UNISWAP_V3_SUBGRAPH_CLIENT = new GraphQLClient(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
);

export const ERC20_INTERFACE = new Interface(ERC20_ABI);

export const DXDAO_AVATAR: Readonly<Record<ChainId, string>> = {
    [ChainId.ETHEREUM]: "0x519b70055af55A007110B4Ff99b0eA33071c720a",
    [ChainId.GNOSIS]: "0xe716ec63c5673b3a4732d22909b38d779fa47c3f",
};

export const DXDAO_AVATAR_DXD_VESTING_ADDRESS =
    "0xBd12eBb77eF167a5FF93b7E572b33f2526aE3fd0";
