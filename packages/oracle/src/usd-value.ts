import { formatUnits } from "@ethersproject/units";
import {
    DAI,
    GNO,
    NATIVE_ASSET_ADDRESS,
    STAKEWISE_REWARD_ETH2,
    STAKEWISE_STAKED_ETH2,
    USDC,
    WETH,
    WXDAI,
} from "./dxdao";
import { ChainId } from "./lib/web3";

import { getUniswapV3PoolDataByTokensAtBlock, sortePoolTokens } from "./price";
import { TokenAssetWithBalance } from "./token-balances";

type TokenAssetWithBalanceAndUSDValue = TokenAssetWithBalance & {
    usdValue: string | null;
};

/**
 * Gets the USD value of a token at a specific block number of Uniswp v3.
 * All prices are calculated against USDC on Uniswap v3.
 * If the token is USDC, the USD value is 1:1.
 * If the token is ETH, the USD value is calculated against WETH on Uniswap v3.
 * If the token is sETH2 or rETH2, the USD value is calculated against WETH on Uniswap v3.
 * If the token is XDAI or WXDAI on Gnosis Chain, the USD value is calculated against DAI on Ethereum on Uniswap v3.
 * @param token the token object with balance
 * @param uniswapV3QueryBlockNumber the block number to query the Uniswap v3 pool
 * @param chainId the chain id of the token
 * @returns
 */
export async function getTokenUSDValue(
    token: TokenAssetWithBalance,
    uniswapV3QueryBlockNumber: number,
    chainId: ChainId
): Promise<TokenAssetWithBalanceAndUSDValue> {
    // Zero balance is zero USD value
    if (token.balance === "0") {
        return {
            ...token,
            usdValue: "0",
        };
    }
    // USDC value is 1:1
    if (token.address === USDC[chainId].address) {
        return {
            ...token,
            usdValue: formatUnits(token.balance, USDC[chainId].decimals),
        };
    }

    // Initialize USD value to null (not found)
    let usdValue: string | null = null;
    // Map Gnosis WETH to WETH token on Ethereum
    let tokenAddress = token.address;

    // Speical mapping for ChainId.Ethereum
    if (chainId === ChainId.Ethereum) {
        // Map ETH and StakeWise (sETH2 and rETH2) to WETH token
        // This is because Uniswap v3 does not have a direct sETH2-USDC or rETH2-USDC pool
        if (
            token.address === NATIVE_ASSET_ADDRESS ||
            token.address === STAKEWISE_STAKED_ETH2.address ||
            token.address === STAKEWISE_REWARD_ETH2.address
        ) {
            tokenAddress = WETH[ChainId.Ethereum].address;
        }
    }

    // Special mapping for ChainId.Gnosis
    // All prices on Gnosis are calcualted against USDC on Uniswap v3
    if (chainId === ChainId.Gnosis) {
        // Map XDAI and WXDAI to DAI token on Ethereum
        if (
            token.address === NATIVE_ASSET_ADDRESS ||
            token.address === WXDAI.address
        ) {
            tokenAddress = DAI.address;
        }
        // Map WETH on Gnosis Chain to WETH token on Ethereum
        else if (token.address === WETH[ChainId.Gnosis].address) {
            tokenAddress = WETH[ChainId.Ethereum].address;
        }
        // Map GNO to GNO token on Ethereum
        else if (token.address === GNO[ChainId.Gnosis].address) {
            tokenAddress = GNO[ChainId.Ethereum].address;
        }
    }

    // Sort the token and USDC addresses to match the Uniswap v3 pool
    const [token0Addr, token1Addr] = sortePoolTokens(
        tokenAddress,
        USDC[ChainId.Ethereum].address
    );
    // Fetch the pool data for token0-USDC (or USDC-token0) at the block number
    const { pools } = await getUniswapV3PoolDataByTokensAtBlock(
        token0Addr,
        token1Addr,
        uniswapV3QueryBlockNumber
    );

    // Use the first pool is the lowest fee tier
    const pool = pools?.[0];

    if (!pool) {
        console.log(
            `No pool found for token ${token.symbol} (${tokenAddress})`
        );

        return {
            ...token,
            usdValue,
        };
    }

    const token0PriceFloat = parseFloat(pool.token0Price);

    const tokenBalanceFloat = parseFloat(
        formatUnits(token.balance, token.decimals)
    );

    // Calculate the USD value of the token balance as decimal float
    usdValue = (token0PriceFloat * tokenBalanceFloat).toString();

    return {
        ...token,
        usdValue,
    };
}

/**
 * Gets the USD price of a token at a specific block number of Uniswp v3.
 * @param tokenAddress the token address
 * @param uniswapV3QueryBlockNumber the block number to query the Uniswap v3 pool
 * @returns the USD price of the token. Returns null if the token is not found.
 */
export async function getTokenUSDPrice(
    tokenAddress: string,
    uniswapV3QueryBlockNumber: number
) {
    // Map Gnosis ETH to WETH token on Ethereum
    let tokenAddressToQuery = tokenAddress;
    // Special mapping for ChainId.Ethereum
    if (tokenAddress === NATIVE_ASSET_ADDRESS) {
        // Map ETH and StakeWise (sETH2 and rETH2) to WETH token
        // This is because Uniswap v3 does not have a direct sETH2-USDC or rETH2-USDC pool
        tokenAddressToQuery = WETH[ChainId.Ethereum].address;
    }

    // Sort the token and USDC addresses to match the Uniswap v3 pool
    const [token0Addr, token1Addr] = sortePoolTokens(
        tokenAddressToQuery,
        USDC[ChainId.Ethereum].address
    );
    // Fetch the pool data for token0-USDC (or USDC-token0) at the block number
    const { pools } = await getUniswapV3PoolDataByTokensAtBlock(
        token0Addr,
        token1Addr,
        uniswapV3QueryBlockNumber
    );

    // Use the first pool is the lowest fee tier
    const pool = pools?.[0];

    if (!pool) {
        console.log(`No pool found for token ${tokenAddress}`);

        return null;
    }

    const token0PriceFloat = parseFloat(pool.token0Price);

    return token0PriceFloat;
}
