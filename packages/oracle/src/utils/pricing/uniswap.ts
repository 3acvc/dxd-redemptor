import { Provider } from "@ethersproject/abstract-provider";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import type { StaticOracle } from "@mean-finance/uniswap-v3-oracle/typechained/";
import type { Token } from "../../entities";
import { RETH2, SETH2, USDC, WETH } from "../../entities/token";
import { ChainId } from "../../constants";
import { parseEther, parseUnits } from "@ethersproject/units";
import { getMulticallContractForProvider } from "../contracts";
import { STATIC_ORACLE_ABI } from "../../abis/staticOracle";

const STATIC_ORACLE_ADDRESS = "0xB210CE856631EeEB767eFa666EC7C1C57738d438";
const TWAP_PERIOD = 1000;

interface TokenPrice {
    token: Token;
    /**
     * Price of token against WETH
     */
    wethPrice: BigNumber;
    /**
     * Price of token against USDC (scaled to 18 decimals)
     */
    usdPrice: BigNumber;
}

/**
 * Returns the token list prices against WETH pools on Uniswapv3 using Oracle
 * @param tokenList list of tokens to get price for
 * @param provider provider to use for price calculation
 * @param block block number to use for price calculation
 * @param twapPeriod time period for TWAP calculation
 * @returns token price map. The key is the token address and the value is the price against WETH.
 */
async function getPriceAgainstWETH(
    tokenList: Token[],
    provider: Provider,
    block: number,
    twapPeriod = TWAP_PERIOD
): Promise<Record<string, BigNumber>> {
    const tokenPriceMap: Record<string, BigNumber> = {};
    const multicallContract = getMulticallContractForProvider(provider);
    const staticOralceInterface = Contract.getInterface(
        STATIC_ORACLE_ABI
    ) as StaticOracle["interface"];

    const calls = tokenList.map((token) => ({
        target: STATIC_ORACLE_ADDRESS,
        callData: staticOralceInterface.encodeFunctionData(
            "quoteAllAvailablePoolsWithTimePeriod",
            [
                parseUnits("1", token.decimals),
                token.address,
                WETH[ChainId.ETHEREUM].address,
                twapPeriod,
            ]
        ),
    }));

    const mcResults = (await multicallContract.callStatic.tryAggregate(
        false,
        calls,
        {
            blockTag: block,
        }
    )) as { success: boolean; returnData: string }[];

    for (let i = 0; i < mcResults.length; i++) {
        const results = mcResults[i];

        if (results.success) {
            const [wethPriceTWAPBN] =
                staticOralceInterface.decodeFunctionResult(
                    "quoteAllAvailablePoolsWithTimePeriod",
                    results.returnData
                );
            tokenPriceMap[tokenList[i].address] = wethPriceTWAPBN;
        }
    }

    return tokenPriceMap;
}

/**
 * Get token price against USDC via Uniswap V3 Oracle
 * @param tokenList list of tokens to get price for
 * @param provider provider to use for price calculation
 * @param block block number to use for price calculation
 * @param twapPeriod time period for TWAP calculation
 * @returns token price map. The key is the token address and the value is the price against WETH.
 */
export async function getTokenUSDCPriceViaOracle(
    tokenList: Token[],
    provider: Provider,
    block: number,
    twapPeriod = TWAP_PERIOD
): Promise<TokenPrice[]> {
    const hasNonEthereumToken =
        tokenList.find((token) => token.chainId !== ChainId.ETHEREUM) !==
        undefined;

    if (hasNonEthereumToken) {
        throw new Error("Only Ethereum tokens are supported");
    }

    const tokenPriceList: TokenPrice[] = [];

    const staticOralce = new Contract(
        STATIC_ORACLE_ADDRESS,
        STATIC_ORACLE_ABI,
        provider
    ) as StaticOracle;

    // get the pool address of WETH against USDC
    const [_wethPriceTWAPBN] =
        await staticOralce.callStatic.quoteAllAvailablePoolsWithTimePeriod(
            parseEther("1"),
            WETH[ChainId.ETHEREUM].address,
            USDC[ChainId.ETHEREUM].address,
            twapPeriod,
            {
                blockTag: block,
            }
        );

    // Scale the price to 18 decimals
    const wethUSDCPrice = _wethPriceTWAPBN.mul(
        10 ** (18 - USDC[ChainId.ETHEREUM].decimals)
    );

    const tokenPriceAgainstWETHList = await getPriceAgainstWETH(
        tokenList.filter(
            (t) =>
                !t.equals(WETH[ChainId.ETHEREUM]) &&
                !t.equals(USDC[ChainId.ETHEREUM])
        ), // remove WETH and USDC from the list
        provider,
        block
    );

    for (const token of tokenList) {
        // if the token is WETH, return the price against USDC
        if (token.equals(WETH[ChainId.ETHEREUM])) {
            tokenPriceList.push({
                token,
                usdPrice: wethUSDCPrice,
                wethPrice: parseEther("1"), // 1 WETH = 1 WETH 😤
            });
        }
        // Stakewise reward token has a direct pool against
        else if (token.equals(RETH2)) {
            const [_RETH2_SETH2PriceTWAP] =
                await staticOralce.callStatic.quoteAllAvailablePoolsWithTimePeriod(
                    parseEther("1"),
                    RETH2.address,
                    SETH2.address,
                    twapPeriod,
                    {
                        blockTag: block,
                    }
                );

            const tokenWETHPrice = tokenPriceAgainstWETHList[SETH2.address]
                .mul(_RETH2_SETH2PriceTWAP)
                .div(parseEther("1"));

            const tokenUSDCPrice = tokenWETHPrice
                .mul(wethUSDCPrice)
                .div(parseEther("1"));

            tokenPriceList.push({
                token,
                wethPrice: tokenWETHPrice,
                usdPrice: tokenUSDCPrice,
            });
        }
        //  Token exists in TOKEN/WETH price list
        else if (tokenPriceAgainstWETHList[token.address]) {
            const tokenWETHPrice = tokenPriceAgainstWETHList[token.address];
            // const divBase = 10 ** (18 - token.decimals);
            const tokenUSDCPrice = tokenWETHPrice
                .mul(wethUSDCPrice)
                .div(parseUnits("1"));

            tokenPriceList.push({
                token,
                wethPrice: tokenWETHPrice,
                usdPrice: tokenUSDCPrice,
            });
        }
    }

    return tokenPriceList;
}
