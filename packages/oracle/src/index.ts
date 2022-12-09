import type { Provider } from "@ethersproject/abstract-provider";
import type {
    TypedDataDomain,
    TypedDataSigner,
} from "@ethersproject/abstract-signer";
import type { Wallet } from "ethers";
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
import { Quote } from "./types";
import {
    getNativeCurrencyBalancesAtBlock,
    getTokenBalancesAtBlock,
} from "./utils/balances";
import { getDXDCirculatingSupply } from "./utils/dxd";
import { getUSDPrice, getUSDValue } from "./utils/pricing";

export * from "./types";
export { ChainId } from "./constants";
export * from "./entities";

/**
 *
 * @param block - block number for each chain
 * @param redeemedToken - token to redeem
 * @param redeemedDxd - amount of DXD to redeem
 * @param providerList - a list of providers for each chain
 * @returns
 */
export async function quote(
    block: Record<ChainId, number>,
    redeemedToken: Currency,
    redeemedDxd: Amount<Token>,
    providerList: Record<ChainId, Provider>
): Promise<Quote> {
    const circulatingDXDSupply = await getDXDCirculatingSupply(
        block,
        providerList
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

/**
 *
 * @param signer - signer to sign the quote
 * @param domain - domain to sign the quote. Must include chainId and verifyingContract
 * @param quote - quote to sign
 * @returns
 */
export function signQuote(
    signer: Wallet | TypedDataSigner,
    domain: TypedDataDomain &
        Required<Pick<TypedDataDomain, "chainId" | "verifyingContract">>,
    quote: Quote
): Promise<string> {
    return signer._signTypedData(
        {
            name: "DXD redemptor",
            version: "1",
            ...domain,
        },
        {
            oracleMessage: [
                { name: "redeemedDXD", type: "uint256" },
                { name: "circulatingDXDSupply", type: "uint256" },
                { name: "redeemedToken", type: "address" },
                { name: "redeemedTokenUSDPrice", type: "uint256" },
                { name: "redeemedAmount", type: "uint256" },
                { name: "collateralUSDValue", type: "uint256" },
            ],
        },
        quote
    );
}
