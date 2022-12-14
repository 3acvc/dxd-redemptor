import type { Provider } from "@ethersproject/abstract-provider";
import { formatUnits } from "@ethersproject/units";
import { ChainId, DXDAO_AVATAR, QUOTE_BLOCK_DEADLINE } from "./constants";
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
import { enforce } from "./utils/invariant";
import { getPriceableToken, getUSDValueTWAP } from "./utils/pricing";
export { quoteToEIP712Hash } from "./utils/signing";

export * from "./types";
export { ChainId } from "./constants";
export * from "./entities";
export { hashQuote } from "./hash-quote";
export { signQuote, verifyQuoteSignature } from "./sign-quote";

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
 * @param deadline - deadline for the quote
 * @returns
 */
export async function getQuote(
    block: Record<ChainId, number>,
    redeemedTokenAddress: string,
    redeemedDxdWeiAmount: string,
    providerList: Record<ChainId, Provider>,
    deadline?: number
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

    const [navUSDValue, tokenPriceList] = await getUSDValueTWAP(
        [...tokenBalances, ...nativeCurrencyBalances],
        providerList[ChainId.ETHEREUM],
        block[ChainId.ETHEREUM]
    );
    // TODO: apply whatever discount is appropriate
    const discountedNAVUSDValue = new Amount(
        Currency.USD,
        navUSDValue.times("0.7")
    );
    const dxdTokenPrice = discountedNAVUSDValue.dividedBy(circulatingDXDSupply);
    const redeemedUSD = redeemedDxd.times(dxdTokenPrice);

    // From the TWAP price list, find the price of redeem token
    const _redeemedTokenPrice = tokenPriceList.find((tokenPrice) =>
        tokenPrice.token.equals(getPriceableToken(redeemedToken))
    );

    enforce(
        !!_redeemedTokenPrice,
        "redeemed token not found in TWAP price list"
    );

    const redeemedTokenUSDPrice = new Amount(
        Currency.USD,
        formatUnits(_redeemedTokenPrice.usdPrice, Currency.USD.decimals)
    );
    const redeemedAmount = redeemedUSD.dividedBy(redeemedTokenUSDPrice);

    // TODO: add a way to set the deadline
    deadline =
        deadline ||
        (await providerList[ChainId.ETHEREUM].getBlock("pending")).number +
            QUOTE_BLOCK_DEADLINE;

    return {
        redeemedDXD: redeemedDxd.toRawAmount().toString(),
        circulatingDXDSupply: circulatingDXDSupply.toRawAmount().toString(),
        collateralUSDValue: discountedNAVUSDValue.toRawAmount().toString(),
        redeemedToken: redeemedToken.address,
        redeemedTokenUSDPrice: redeemedTokenUSDPrice.toRawAmount().toString(),
        redeemedAmount: new Amount(redeemedToken, redeemedAmount)
            .toRawAmount()
            .toString(),
        deadline: deadline.toString(),
    };
}
