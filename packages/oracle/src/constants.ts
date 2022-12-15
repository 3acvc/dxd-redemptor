import { Interface } from "@ethersproject/abi";
import { keccak256 } from "@ethersproject/solidity";
import { GraphQLClient } from "graphql-request";
import { ERC20_ABI } from "./abis/erc20";

export enum ChainId {
    ETHEREUM = 1,
    GNOSIS = 100,
}

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

export const SWAPR_SUBGRAPH_CLIENT: Readonly<Record<ChainId, GraphQLClient>> = {
    [ChainId.ETHEREUM]: new GraphQLClient(
        "https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-mainnet-v2"
    ),
    [ChainId.GNOSIS]: new GraphQLClient(
        "https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-xdai-v2"
    ),
};

export const ERC20_INTERFACE = new Interface(ERC20_ABI);

export const DXDAO_AVATAR: Readonly<Record<ChainId, string>> = {
    [ChainId.ETHEREUM]: "0x519b70055af55A007110B4Ff99b0eA33071c720a",
    [ChainId.GNOSIS]: "0xe716ec63c5673b3a4732d22909b38d779fa47c3f",
};

/**
 * DXswap relayer addresses. Same for all networks.
 */
export const DXSWAP_RELAYER: Readonly<Record<ChainId, string>> = {
    [ChainId.ETHEREUM]: "0xc088e949b9643d5c47a188084579b8d19b1b1112",
    [ChainId.GNOSIS]: "0x3921d59090810C1d52807cD8ca1Ea2289E1F89e6",
};

export const DXDAO_AVATAR_DXD_VESTING_ADDRESS =
    "0xBd12eBb77eF167a5FF93b7E572b33f2526aE3fd0";

export const ORACLE_MESSAGE_TYPE_HASH = keccak256(
    ["string"],
    [
        "OracleMessage(uint256 redeemedDXD,uint256 circulatingDXDSupply,address redeemedToken,uint256 redeemedTokenUSDPrice,uint256 redeemedAmount,uint256 collateralUSDValue,uint256 deadline)",
    ]
);

export const EIP712_DOMAIN_TYPE_HASH = keccak256(
    ["string"],
    [
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)",
    ]
);

export const DOMAIN_SEPARATOR_NAME = keccak256(["string"], ["DXD redemptor"]);

export const DOMAIN_SEPARATOR_VERSION = keccak256(["string"], ["1"]);
