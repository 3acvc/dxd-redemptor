import { ChainId, DXDAO_AVATAR } from "./constants";
import { Amount } from "./entities/amount";
import { Currency } from "./entities/currency";
import {
    DAI,
    ENS,
    GNO,
    LUSD,
    RETH,
    RETH2,
    SETH2,
    STETH,
    SUSD,
    Token,
    USDC,
    USDT,
    WETH,
    WXDAI,
} from "./entities/token";
import {
    getNativeCurrencyBalancesAtBlock,
    getTokenBalancesAtBlock,
} from "./utils/balances";
import { getDXDCirculatingSupply } from "./utils/dxd";
import { getUSDPrice, getUSDValue } from "./utils/pricing";

export interface Quote {
    redeemedDXD: string;
    circulatingDXDSupply: string;
    redeemedToken: string;
    redeemedTokenUSDPrice: string;
    redeemedAmount: string;
    collateralUSDValue: string;
}

export async function quote(
    block: Record<ChainId, number>,
    redeemedToken: Token,
    redeemedDxd: Amount<Token>
): Promise<Quote> {
    const circulatingDXDSupply = await getDXDCirculatingSupply(block);

    const tokenBalances = await getTokenBalancesAtBlock(
        [
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
        ].map((token) => ({
            token,
            owner: DXDAO_AVATAR[token.chainId],
        })),
        block
    );
    const nativeCurrencyBalances = await getNativeCurrencyBalancesAtBlock(
        DXDAO_AVATAR,
        block
    );

    const navUSDValue = await getUSDValue(
        [...tokenBalances, ...nativeCurrencyBalances],
        block[ChainId.ETHEREUM]
    );
    // TODO: apply whatever discount is appropriate
    const discountedNAVUSDValue = new Amount(
        Currency.USD,
        navUSDValue.times("0.7")
    );
    const dxdTokenPrice = discountedNAVUSDValue.dividedBy(circulatingDXDSupply);
    const redeemedUSD = redeemedDxd.times(dxdTokenPrice);

    const redeemedTokenUSDPrice = await getUSDPrice(
        redeemedToken,
        block[ChainId.ETHEREUM]
    );
    const redeemedAmount = redeemedUSD.dividedBy(redeemedTokenUSDPrice);

    return {
        redeemedDXD: redeemedDxd.toRawAmount().toString(),
        circulatingDXDSupply: circulatingDXDSupply.toRawAmount().toString(),
        collateralUSDValue: discountedNAVUSDValue.toRawAmount().toString(),
        redeemedToken: redeemedToken.address,
        redeemedTokenUSDPrice: redeemedTokenUSDPrice.toRawAmount().toString(),
        redeemedAmount: new Amount(redeemedToken, redeemedAmount)
            .toRawAmount()
            .toString(),
    };
}
