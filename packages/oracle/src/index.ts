import type { Provider } from "@ethersproject/abstract-provider";
import { ChainId, DXDAO_AVATAR } from "./constants";
import { Amount } from "./entities/amount";
import { Currency } from "./entities/currency";
import {
    DAI,
    DXD,
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
import { Quote } from "./types";
import {
    getNativeCurrencyBalancesAtBlock,
    getTokenBalancesAtBlock,
} from "./utils/balances";
import { getDXDCirculatingSupply } from "./utils/dxd";
import { getUSDPrice, getUSDValue } from "./utils/pricing";
export { quoteToEIP712Hash } from "./utils/signing";

export * from "./types";
export { ChainId } from "./constants";
export * from "./entities";

/**
 * Returns the token for a given address
 * @param currenyAddress - address of the token
 */
export function getCurrencyByAddress(currenyAddress: string) {
    const addressLowercase = currenyAddress.toLowerCase();

    switch (addressLowercase) {
        case WETH[ChainId.ETHEREUM].address.toLowerCase():
            return Token.getNativeWrapper(ChainId.ETHEREUM);
        case USDC[ChainId.ETHEREUM].address.toLowerCase():
            return USDC[ChainId.ETHEREUM];
        case DAI.address.toLowerCase():
            return DAI;
        case Currency.ETH.address.toLowerCase():
            return Currency.ETH;
        default:
            throw new Error(`Unsupported token address: ${currenyAddress}`);
    }
}

/**
 *
 * @param block - block number for each chain
 * @param redeemedTokenAddress - token address to redeem DXD for. Valid tokens are ETH, WETH, USDC, DAI
 * @param redeemedDxdWeiAmount - amount of DXD to redeem in wei
 * @param providerList - a list of providers for each chain
 * @returns
 */
export async function getQuote(
    block: Record<ChainId, number>,
    redeemedTokenAddress: string,
    redeemedDxdWeiAmount: string,
    providerList: Record<ChainId, Provider>
): Promise<Quote> {
    const circulatingDXDSupply = await getDXDCirculatingSupply(
        block,
        providerList
    );

    // Reconstruct the redeemed token and DXD amount
    const redeemedToken = getCurrencyByAddress(redeemedTokenAddress);
    const redeemedDxd = Amount.fromRawAmount(
        DXD[ChainId.ETHEREUM],
        redeemedDxdWeiAmount
    );

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
        block,
        providerList
    );
    const nativeCurrencyBalances = await getNativeCurrencyBalancesAtBlock(
        DXDAO_AVATAR,
        block,
        providerList
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
