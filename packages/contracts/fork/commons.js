import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname } from "path";

export const PORT = 8545;
export const MNEMONIC =
  "test test test test test test test test test test test junk";
export const DERIVATION_PATH = "m/44'/60'/0'/0/0";
export const DXDAO_MAINNET_AVATAR =
  "0x519b70055af55A007110B4Ff99b0eA33071c720a";
export const DXD_MAINNET = "0xa1d65E8fB6e87b60FECCBc582F7f97804B725521";
export const REDEMPTOR_CONTRACT = "0xAa02DffF49475F9759295A9525987686d2de47b2"; // address is deterministic in fork
export const USDC_MAINNET = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
export const WETH_MAINNET = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export const USDT_MAINNET = "0xdac17f958d2ee523a2206206994597c13d831ec7";

const importMetaUrlPath = fileURLToPath(import.meta.url);
export const __dirname = dirname(importMetaUrlPath);
export const require = createRequire(importMetaUrlPath);
