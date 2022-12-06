import { ChainId } from "../lib/web3";
export declare const dxdTokenContractAddressList: Readonly<Record<ChainId, string>>;
export declare const dxdaoTreasuryAddressList: Readonly<Record<ChainId, string>>;
export declare const dxdaoDXDVestingAddress = "0xBd12eBb77eF167a5FF93b7E572b33f2526aE3fd0";
export interface TokenAsset {
    symbol: string;
    name?: string;
    decimals: number;
    address: string;
}
export declare const NATIVE_ASSET_ADDRESS: string;
export declare const STAKEWISE_STAKED_ETH2: Readonly<TokenAsset>;
export declare const STAKEWISE_REWARD_ETH2: Readonly<TokenAsset>;
export declare const GNO: Readonly<Record<ChainId, TokenAsset>>;
export declare const USDC: Readonly<Record<ChainId, TokenAsset>>;
export declare const WETH: Readonly<Record<ChainId, TokenAsset>>;
export declare const WXDAI: Readonly<TokenAsset>;
export declare const DAI: Readonly<TokenAsset>;
export declare const navTokenList: Readonly<Record<ChainId, TokenAsset[]>>;
