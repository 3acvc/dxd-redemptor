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

const importMetaUrlPath = fileURLToPath(import.meta.url);
export const __dirname = dirname(importMetaUrlPath);
export const require = createRequire(importMetaUrlPath);
