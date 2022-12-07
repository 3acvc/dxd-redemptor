import { getAddress } from "@ethersproject/address";

import { ChainId } from "../lib/web3";

/**
 * DXD Contract Address
 */
export const dxdTokenContractAddressList: Readonly<Record<ChainId, string>> = {
    "1": "0xa1d65E8fB6e87b60FECCBc582F7f97804B725521",
    "100": "0xb90d6bec20993be5d72a5ab353343f7a0281f158",
};

/**
 * DXdao treasury address
 */
export const dxdaoTreasuryAddressList: Readonly<Record<ChainId, string>> = {
    "1": "0x519b70055af55A007110B4Ff99b0eA33071c720a",
    "100": "0xe716ec63c5673b3a4732d22909b38d779fa47c3f",
};

/**
 * DXdao DXD vesting contract address
 */
export const dxdaoDXDVestingAddress =
    "0xBd12eBb77eF167a5FF93b7E572b33f2526aE3fd0";

export interface TokenAsset {
    symbol: string;
    name?: string;
    decimals: number;
    address: string;
}

export const NATIVE_ASSET_ADDRESS = getAddress(
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
);

/**
 *
 */
export const STAKEWISE_STAKED_ETH2: Readonly<TokenAsset> = {
    symbol: "sETH2",
    name: "StakeWise Staked ETH2",
    decimals: 18,
    address: getAddress("0xFe2e637202056d30016725477c5da089Ab0A043A"),
};

export const STAKEWISE_REWARD_ETH2: Readonly<TokenAsset> = {
    symbol: "rETH2",
    name: "StakeWise Reward ETH2",
    decimals: 18,
    address: getAddress("0x20bc832ca081b91433ff6c17f85701b6e92486c5"),
};

/**
 * Gnosis Token
 */
export const GNO: Readonly<Record<ChainId, TokenAsset>> = {
    [ChainId.Ethereum]: {
        symbol: "GNO",
        address: getAddress("0x6810e776880c02933d47db1b9fc05908e5386b96"),
        decimals: 18,
    },
    [ChainId.Gnosis]: {
        symbol: "GNO",
        decimals: 18,
        address: getAddress("0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb"),
    },
};

/**
 * USDC Token
 */
export const USDC: Readonly<Record<ChainId, TokenAsset>> = {
    [ChainId.Ethereum]: {
        symbol: "USDC",
        decimals: 6,
        address: getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
    },
    [ChainId.Gnosis]: {
        symbol: "USDC",
        decimals: 6,
        address: getAddress("0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83"),
    },
};

/**
 * WETH Token
 */
export const WETH: Readonly<Record<ChainId, TokenAsset>> = {
    [ChainId.Ethereum]: {
        symbol: "WETH",
        decimals: 18,
        address: getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
    },
    [ChainId.Gnosis]: {
        symbol: "WETH",
        decimals: 18,
        address: getAddress("0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1"),
    },
};

/**
 * Wrapped XDAI Token (only on Gnosis)
 */
export const WXDAI: Readonly<TokenAsset> = {
    symbol: "WXDAI",
    decimals: 18,
    address: getAddress("0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d"),
};

/**
 * DAI Token
 */
export const DAI: Readonly<TokenAsset> = {
    symbol: "DAI",
    decimals: 18,
    address: getAddress("0x6B175474E89094C44Da98b954EedeAC495271d0F"),
};

/**
 * Tokens considered for the net asset value (NAV) calculation
 */
export const navTokenList: Readonly<Record<ChainId, TokenAsset[]>> = {
    [ChainId.Ethereum]: [
        {
            symbol: "ETH",
            decimals: 18,
            address: NATIVE_ASSET_ADDRESS,
        },
        WETH[ChainId.Ethereum],
        // staked ETHs
        {
            symbol: "stETH",
            name: "Lido staked Ether",
            decimals: 18,
            address: getAddress("0xae7ab96520de3a18e5e111b5eaab095312d7fe84"),
        },
        {
            symbol: "rETH",
            name: "Rocket Pool staked Ether",
            decimals: 18,
            address: getAddress("0xae78736cd615f374d3085123a210448e74fc6393"),
        },
        STAKEWISE_STAKED_ETH2,
        STAKEWISE_REWARD_ETH2,
        // Stables
        USDC[ChainId.Ethereum],
        DAI,
        {
            symbol: "USDT",
            decimals: 6,
            address: getAddress("0x4ECaBa5870353805a9F068101A40E0f32ed605C6"),
        },
        {
            symbol: "LUSD",
            decimals: 18,
            address: getAddress("0x5f98805A4E8be255a32880FDeC7F6728C6568bA0"),
        },
        {
            symbol: "sUSD",
            decimals: 18,
            address: getAddress("0x57ab1ec28d129707052df4df418d58a2d46d5f51"),
        },
        // DeFi tokens
        GNO[ChainId.Ethereum],
        {
            symbol: "ENS",
            decimals: 18,
            address: getAddress("0xc18360217d8f7ab5e7c516566761ea12ce7f9d72"),
        },
    ],
    [ChainId.Gnosis]: [
        {
            symbol: "XDAI",
            decimals: 18,
            address: NATIVE_ASSET_ADDRESS,
        },
        WXDAI,
        WETH[ChainId.Gnosis],
        USDC[ChainId.Gnosis],
        GNO[ChainId.Gnosis],
    ],
};
