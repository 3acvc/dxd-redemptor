import { gql } from "graphql-request";

export const getUniswapV3PoolDataByTokensAtBlockQuery = gql`
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
`;
