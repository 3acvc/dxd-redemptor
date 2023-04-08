import { ChainId } from "./constants";
import { Amount } from "./entities";
import { DAI, DPI, USDC, WBTC, WETH, WXDAI } from "./entities/token";

// These assets are hardcoded
export const NAV_ASSETS = [
  // Swapr on Ethereum
  // DXD + ETH
  new Amount(WETH[ChainId.ETHEREUM], 23.06),

  // DAI + ETH
  new Amount(WETH[ChainId.ETHEREUM], 249.43),
  new Amount(DAI, 385_680),
  // Swapr Gnosis
  // WETH + xDai
  new Amount(WETH[ChainId.GNOSIS], 951.34),
  new Amount(WXDAI, 1_470_617),
  // WETH + WBTC
  new Amount(WBTC[ChainId.GNOSIS], 5.297),
  new Amount(WETH[ChainId.GNOSIS], 71.41),
  // USDC + xDai
  new Amount(USDC[ChainId.GNOSIS], 233_724),
  new Amount(WXDAI, 233_741),
  // WETH + DPI
  new Amount(DPI[ChainId.GNOSIS], 870.284),
  new Amount(WETH[ChainId.GNOSIS], 45.06),
];
