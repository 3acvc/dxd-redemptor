import { getAddress } from "@ethersproject/address";
import { gql, GraphQLClient } from "graphql-request";
import memoizee from "memoizee";

/**
 * Sorts Uniswap V3 pool tokens by address
 * @param token0
 * @param token1
 * @returns {string[]}
 */
export function sortePoolTokens(
    token0Address: string,
    token1Address: string
): string[] {
    const token0AddressChecksumed = getAddress(token0Address);
    const token1AddressChecksumed = getAddress(token1Address);

    return token0AddressChecksumed < token1AddressChecksumed
        ? [token0AddressChecksumed, token1AddressChecksumed]
        : [token1AddressChecksumed, token0AddressChecksumed];
}

interface GetUniswapV3PoolDataByTokensAtBlockQuery {
    pools: Array<{
        id: string;
        token0Price: string;
        token1Price: string;
        feeTier: string;
        token0: {
            decimals: string;
            symbol: string;
            address: string;
        };
        token1: {
            decimals: string;
            symbol: string;
            address: string;
        };
    }>;
}

const _getUniswapV3PoolDataByTokensAtBlockQuery = memoizee(
    (token0: string, token1: string, blockNumber: number) => {
        const client = new GraphQLClient(
            "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
        );
        return client.request<GetUniswapV3PoolDataByTokensAtBlockQuery>(
            gql`
                query getUniswapV3PoolDataByTokensAtBlock(
                    $token0: String!
                    $token1: String!
                    $blockNumber: Int!
                ) {
                    pools(
                        where: { token0: $token0, token1: $token1 }
                        block: { number: $blockNumber }
                        orderBy: feeTier
                        orderDirection: asc
                    ) {
                        id
                        token0Price
                        token1Price
                        token0 {
                            address: id
                            decimals
                            symbol
                        }
                        token1 {
                            address: id
                            decimals
                            symbol
                        }
                        feeTier
                    }
                }
            `,
            {
                token0,
                token1,
                blockNumber,
            }
        );
    }
);

/**
 * Gets the Uniswap V3 pool data for a given token pair at a given block
 * @param token0 The address of the first token in the pair
 * @param token1 The address of the second token in the pair
 * @param block The block number to query
 */
export async function getUniswapV3PoolDataByTokensAtBlock(
    token0: string,
    token1: string,
    blockNumber: number
) {
    const [tokenA, tokenB] = sortePoolTokens(token0, token1); // satefy check

    return _getUniswapV3PoolDataByTokensAtBlockQuery(
        tokenA.toLowerCase(),
        tokenB.toLowerCase(),
        blockNumber
    );
}
