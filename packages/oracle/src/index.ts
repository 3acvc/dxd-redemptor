import { formatUnits } from "@ethersproject/units";
import { ChainId, QUOTE_BLOCK_DEADLINE } from "./constants";
import { Amount } from "./entities/amount";
import { Currency } from "./entities/currency";
import { DAI, DXD, Token, USDC, WETH } from "./entities/token";
import { GetQuoteParams, Quote } from "./types";
import { enforce } from "./utils/invariant";
import { getPriceableToken, getUSDValueTWAP } from "./utils/pricing";
import { getTokenBalancesSnapshotAtBlock } from "./utils/subgraph";
export { quoteToEIP712Hash } from "./utils/signing";

export * from "./types";
export {
    ChainId,
    DXDAO_AVATAR,
    DXSWAP_RELAYER,
    NATIVE_TOKEN_ADDRESS,
    SWAPR_SUBGRAPH_CLIENT,
} from "./constants";
export * from "./entities";
export { hashQuote } from "./hash-quote";
export { signQuote, verifyQuoteSignature } from "./sign-quote";
export { getTokenBalancesSnapshotAtBlock } from "./utils/subgraph";
export { getUserLiquidityPositions } from "./utils/liquidity-positions";
export {
    toPriceableTokenList,
    getPriceableToken,
    getTokenUSDCPriceViaOracle,
} from "./utils/pricing";
export { NAV_TOKEN_LIST } from "./entities/token";
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
 * Returns a quote for the given parameters
 * @param block - block number for each chain
 * @param redeemedTokenAddress - token address to redeem DXD for. Valid tokens are ETH, WETH, USDC, DAI
 * @param redeemedDxdWeiAmount - amount of DXD to redeem in wei
 * @param providerList - a list of providers for each chain
 * @param subgraphEndpointList - a list of subgraph endpoints for each chain
 * @param deadline - deadline for the quote
 * @returns
 */
export async function getQuote({
    block,
    redeemedTokenAddress,
    redeemedDxdWeiAmount,
    providerList,
    subgraphEndpointList,
    deadline,
}: GetQuoteParams): Promise<Quote> {
    // Reconstruct the redeemed token and DXD amount
    const redeemedToken = getCurrencyByAddress(redeemedTokenAddress);
    const redeemedDxd = Amount.fromRawAmount(
        DXD[ChainId.ETHEREUM],
        redeemedDxdWeiAmount
    );

    const {
        circulatingDXDSupply,
        tokenBalances,
    } = await getTokenBalancesSnapshotAtBlock(block, subgraphEndpointList);

    const [navUSDValue, tokenPriceList] = await getUSDValueTWAP(
        tokenBalances,
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
