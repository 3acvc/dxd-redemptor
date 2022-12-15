import Decimal from "decimal.js-light";
import { gql } from "graphql-request";
import { ChainId, UNISWAP_V3_SUBGRAPH_CLIENT } from "../../constants";
import { Amount } from "../../entities/amount";
import { Currency } from "../../entities/currency";
import {
    currencyEquals,
    DAI,
    DXD,
    GNO,
    RETH2,
    SETH2,
    Token,
    USDC,
    WETH,
    WXDAI,
} from "../../entities/token";
import { enforce } from "../invariant";

const getPriceableToken = (currency: Currency): Token => {
    if (currency instanceof Token) return handleToken(currency as Token);
    return handleCurrency(currency);
};

const handleToken = (token: Token): Token => {
    switch (token.chainId) {
        case ChainId.ETHEREUM: {
            // Map StakeWise tokens to WETH token (because Uniswap v3
            // does not have a direct sETH2-USDC or rETH2-USDC pool)
            if (token.equals(SETH2) || token.equals(RETH2))
                return WETH[ChainId.ETHEREUM];
            else return token;
        }
        case ChainId.GNOSIS: {
            if (token.equals(USDC[ChainId.GNOSIS]))
                return USDC[ChainId.ETHEREUM];
            if (token.equals(DXD[ChainId.GNOSIS])) return DXD[ChainId.ETHEREUM];
            if (token.equals(WXDAI)) return DAI;
            if (token.equals(WETH[ChainId.GNOSIS]))
                return WETH[ChainId.ETHEREUM];
            if (token.equals(GNO[ChainId.GNOSIS])) return GNO[ChainId.ETHEREUM];
            else return token;
        }
    }
};

const handleCurrency = (currency: Currency): Token => {
    if (currencyEquals(currency, Currency.getNative(ChainId.ETHEREUM)))
        return handleToken(Token.getNativeWrapper(ChainId.ETHEREUM));
    else if (currencyEquals(currency, Currency.getNative(ChainId.GNOSIS)))
        return handleToken(Token.getNativeWrapper(ChainId.GNOSIS));
    throw new Error("unpriceable token");
};

type UniswapV3SubgraphResponse = {
    [priceableTokenSymbol: string]: { price: string }[];
};

export const getUSDValue = async (
    currencyAmounts: (Amount<Currency> | Amount<Token>)[],
    mainnetBlock: number
): Promise<Amount<Currency>> => {
    const priceableTokens = currencyAmounts.reduce(
        (priceableTokens: Token[], amount) => {
            const priceableToken = getPriceableToken(amount.currency);
            if (priceableTokens.indexOf(priceableToken) < 0)
                priceableTokens.push(priceableToken);
            return priceableTokens;
        },
        []
    );

    const mainnetUsdc = USDC[ChainId.ETHEREUM];
    const query = `query { ${priceableTokens
        .map((priceableToken) => {
            if (priceableToken.equals(mainnetUsdc)) return "";
            const [token0, token1] = mainnetUsdc.sort(priceableToken);
            return `${priceableToken.symbol}: pools(
                    where: { token0: "${token0.address.toLowerCase()}", token1: "${token1.address.toLowerCase()}" }
                    block: { number: ${mainnetBlock} }
                    orderBy: liquidity
                    orderDirection: desc,
                    first: 1
                ) {
                    price: ${
                        token0.equals(mainnetUsdc)
                            ? "token0Price"
                            : "token1Price"
                    }
                }`;
        })
        .join("\n")}\n }`;

    const response =
        await UNISWAP_V3_SUBGRAPH_CLIENT.request<UniswapV3SubgraphResponse>(
            query
        );

    const priceOfPriceableToken: {
        [priceableTokenSymbol: string]: Amount<Token>;
    } = {};
    for (const [priceableTokenSymbol, wrappedPrices] of Object.entries(
        response
    )) {
        // TODO: ABSOLUTELY REMOVE THIS, IT'S JUST FOR TESTING PURPOSES
        if (priceableTokenSymbol === "GNO") {
            priceOfPriceableToken["GNO"] = new Amount(mainnetUsdc, 100);
            continue;
        }
        enforce(
            wrappedPrices.length === 1,
            `no pools to price token ${priceableTokenSymbol}`
        );
        priceOfPriceableToken[priceableTokenSymbol] = new Amount(
            mainnetUsdc,
            wrappedPrices[0].price
        );
    }

    const rawUSDValue = currencyAmounts.reduce(
        (usdValue: Decimal, currencyAmount) => {
            const priceableToken = getPriceableToken(currencyAmount.currency);
            let price = priceOfPriceableToken[priceableToken.symbol];
            if (
                (!price && priceableToken.equals(mainnetUsdc)) ||
                priceableToken.equals(USDC[ChainId.GNOSIS])
            ) {
                price = new Amount(mainnetUsdc, "1");
            }
            enforce(
                !!price,
                `no price of priceable token ${priceableToken.address}`
            );
            return usdValue.plus(currencyAmount.times(price));
        },
        new Decimal(0)
    );

    return new Amount(Currency.USD, rawUSDValue);
};

export const getUSDPrice = async (
    currency: Currency,
    block: number
): Promise<Amount<Currency>> => {
    const priceableToken = getPriceableToken(currency);
    const mainnetUsdc = USDC[ChainId.ETHEREUM];

    const priceableTokenSymbol = priceableToken.symbol;

    // USDC is always 1 USDC
    if (priceableToken.equals(mainnetUsdc)) {
        return new Amount(Currency.USD, 1);
    }

    const [token0, token1] = mainnetUsdc.sort(priceableToken);
    const response =
        await UNISWAP_V3_SUBGRAPH_CLIENT.request<UniswapV3SubgraphResponse>(
            gql`query { ${priceableTokenSymbol}: pools(
                where: { token0: "${token0.address.toLowerCase()}", token1: "${token1.address.toLowerCase()}" }
                block: { number: ${block} }
                orderBy: liquidity
                orderDirection: desc,
                first: 1
            ) {
                price: ${
                    token0.equals(mainnetUsdc) ? "token0Price" : "token1Price"
                }
            }}`
        );

    const wrappedPrices = response[priceableTokenSymbol];
    enforce(
        wrappedPrices.length === 1,
        `no pools to price token ${priceableTokenSymbol}`
    );

    return new Amount(Currency.USD, wrappedPrices[0].price);
};
