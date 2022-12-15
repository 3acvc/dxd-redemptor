import { ChainId } from "../constants";
import {
    WETH,
    DAI,
    ENS,
    GNO,
    LUSD,
    RETH,
    RETH2,
    STETH,
    SETH2,
    USDC,
    USDT,
    SUSD,
    WXDAI,
} from "../entities/token";

export function getNavTokenList() {
    return [
        // ethereum
        WETH[ChainId.ETHEREUM],
        STETH,
        RETH,
        SETH2,
        RETH2,
        USDC[ChainId.ETHEREUM],
        DAI,
        USDT,
        LUSD,
        SUSD,
        GNO[ChainId.ETHEREUM],
        ENS,
        // gnosis
        WXDAI,
        WETH[ChainId.GNOSIS],
        USDC[ChainId.GNOSIS],
        GNO[ChainId.GNOSIS],
    ];
}
