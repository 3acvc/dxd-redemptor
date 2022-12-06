import { getAddress } from "@ethersproject/address";
import { GNO as gcGNO, DAI as swaprDAI, USDC as swaprUSDC, WETH as swaprWETH, WXDAI as swaprWXDAI, USDT, } from "@swapr/sdk";
import { ChainId } from "../lib/web3";
export const dxdTokenContractAddressList = {
    "1": "0xa1d65E8fB6e87b60FECCBc582F7f97804B725521",
    "100": "0xb90d6bec20993be5d72a5ab353343f7a0281f158",
};
export const dxdaoTreasuryAddressList = {
    "1": "0x519b70055af55A007110B4Ff99b0eA33071c720a",
    "100": "0xe716ec63c5673b3a4732d22909b38d779fa47c3f",
};
export const dxdaoDXDVestingAddress = "0xBd12eBb77eF167a5FF93b7E572b33f2526aE3fd0";
export const NATIVE_ASSET_ADDRESS = getAddress("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE");
export const STAKEWISE_STAKED_ETH2 = {
    symbol: "sETH2",
    name: "StakeWise Staked ETH2",
    decimals: 18,
    address: getAddress("0xFe2e637202056d30016725477c5da089Ab0A043A"),
};
export const STAKEWISE_REWARD_ETH2 = {
    symbol: "rETH2",
    name: "StakeWise Reward ETH2",
    decimals: 18,
    address: getAddress("0x20bc832ca081b91433ff6c17f85701b6e92486c5"),
};
export const GNO = {
    [ChainId.Ethereum]: {
        symbol: "GNO",
        address: getAddress("0x6810e776880c02933d47db1b9fc05908e5386b96"),
        decimals: 18,
    },
    [ChainId.Gnosis]: {
        symbol: gcGNO.symbol || "GNO",
        decimals: gcGNO.decimals,
        address: getAddress(gcGNO.address),
    },
};
export const USDC = {
    [ChainId.Ethereum]: {
        symbol: swaprUSDC[ChainId.Ethereum].symbol || "USDC",
        decimals: swaprUSDC[ChainId.Ethereum].decimals,
        address: getAddress(swaprUSDC[ChainId.Ethereum].address),
    },
    [ChainId.Gnosis]: {
        symbol: swaprUSDC[ChainId.Gnosis].symbol || "USDC",
        decimals: swaprUSDC[ChainId.Gnosis].decimals,
        address: getAddress(swaprUSDC[ChainId.Gnosis].address),
    },
};
export const WETH = {
    [ChainId.Ethereum]: {
        symbol: swaprWETH[ChainId.Ethereum].symbol || "WETH",
        decimals: swaprWETH[ChainId.Ethereum].decimals,
        address: getAddress(swaprWETH[ChainId.Ethereum].address),
    },
    [ChainId.Gnosis]: {
        symbol: swaprWETH[ChainId.Gnosis].symbol || "WETH",
        decimals: swaprWETH[ChainId.Gnosis].decimals,
        address: getAddress(swaprWETH[ChainId.Gnosis].address),
    },
};
export const WXDAI = {
    symbol: swaprWXDAI[ChainId.Gnosis].symbol || "Wrapped XDAI",
    decimals: swaprWXDAI[ChainId.Gnosis].decimals,
    address: getAddress(swaprWXDAI[ChainId.Gnosis].address),
};
export const DAI = {
    symbol: swaprDAI[ChainId.Ethereum].symbol || "DAI",
    decimals: swaprDAI[ChainId.Ethereum].decimals,
    address: getAddress(swaprDAI[ChainId.Ethereum].address),
};
export const navTokenList = {
    [ChainId.Ethereum]: [
        {
            symbol: "ETH",
            decimals: 18,
            address: NATIVE_ASSET_ADDRESS,
        },
        WETH[ChainId.Ethereum],
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
        USDC[ChainId.Ethereum],
        DAI,
        {
            symbol: USDT[ChainId.Ethereum].symbol || "USDT",
            decimals: USDT[ChainId.Ethereum].decimals,
            address: getAddress(USDT[ChainId.Ethereum].address),
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
