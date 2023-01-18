import { ChainId } from "./constants";
import { Amount } from "./entities";
import { DAI, DPI, USDC, WBTC, WETH, WXDAI } from "./entities/token";

// These assets are hardcoded
export const NAV_ASSETS = [
    // Swapr on Ethereum
    new Amount(WETH[ChainId.ETHEREUM], 23.059 + 244.38), // WETH LP positions on Swapr,
    new Amount(DAI, 385_680), // DAI LP positions on Swapr 1
    // Swapr Gnosis
    new Amount(WETH[ChainId.GNOSIS], 932.955 + 70.944 + 45.077), // WETH LP positions on Swapr,
    new Amount(WBTC[ChainId.GNOSIS], 5.297),
    new Amount(WXDAI, 1_470_617 + 233_741),
    new Amount(USDC[ChainId.GNOSIS], 233_724),
    new Amount(DPI[ChainId.GNOSIS], 870.284),
];
