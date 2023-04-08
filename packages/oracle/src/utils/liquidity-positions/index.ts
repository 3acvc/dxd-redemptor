import Decimal from "decimal.js-light";
import { ChainId, SWAPR_SUBGRAPH_CLIENT } from "../../constants";
import { Amount, Token } from "../../entities";
import { DXD, NAV_TOKEN_LIST } from "../../entities/token";
import { enforce } from "../invariant";
import { gql } from "graphql-request";

const USER_LIQUIDIY_POSITIONS_QUERY = gql`
  query userLiquidityPositions($userAddress: Bytes!, $blockNumber: Int!) {
    user(id: $userAddress, block: { number: $blockNumber }) {
      liquidityPositions {
        liquidityTokenBalance
        pair {
          address: id
          token0 {
            address: id
            symbol
          }
          token1 {
            address: id
            symbol
          }
          totalSupply
          reserve0
          reserve1
        }
      }
    }
  }
`;
interface SwaprBurnsAndMintsResponse {
  user: {
    liquidityPositions: {
      liquidityTokenBalance: string;
      pair: {
        address: string;
        token0: {
          address: string;
          symbol: string;
        };
        token1: {
          address: string;
          symbol: string;
        };
        totalSupply: string;
        reserve0: string;
        reserve1: string;
      };
    }[];
  };
}

const SUBGRAPH_TOKENS = [
  ...NAV_TOKEN_LIST,
  DXD[ChainId.ETHEREUM],
  DXD[ChainId.GNOSIS],
];

/**
 * Get the principal amount for a user in a pair
 * @param userAddress
 * @param pairAddress
 * @returns
 */
export async function getUserLiquidityPositions(
  userAddress: string,
  blockNumber: number,
  chainId: ChainId
): Promise<
  {
    pair: string;
    amount0: Amount<Token>;
    amount1: Amount<Token>;
  }[]
> {
  const response = await SWAPR_SUBGRAPH_CLIENT[
    chainId
  ].request<SwaprBurnsAndMintsResponse>(USER_LIQUIDIY_POSITIONS_QUERY, {
    userAddress: userAddress.toLowerCase(),
    blockNumber,
  });

  return response.user.liquidityPositions.map((liquidityPosition) => {
    const token0 = SUBGRAPH_TOKENS.find(
      (token) =>
        token.address.toLowerCase() ===
        liquidityPosition.pair.token0.address.toLowerCase()
    );
    const token1 = SUBGRAPH_TOKENS.find(
      (token) =>
        token.address.toLowerCase() ===
        liquidityPosition.pair.token1.address.toLowerCase()
    );

    enforce(
      !!token0,
      `token0 (${liquidityPosition.pair.token0.address}) not found in SUBGRAPH_TOKENS`
    );
    enforce(
      !!token1,
      `token1 (${liquidityPosition.pair.token1.address}) not found in SUBGRAPH_TOKENS`
    );

    const liquidityTokenBalance = new Decimal(
      liquidityPosition.liquidityTokenBalance
    );
    const totalSupply = new Decimal(liquidityPosition.pair.totalSupply);
    const reserve0 = new Decimal(liquidityPosition.pair.reserve0);
    const reserve1 = new Decimal(liquidityPosition.pair.reserve1);

    const poolShare = liquidityTokenBalance.div(totalSupply);

    const amount0Share = poolShare.mul(reserve0);
    const amount1Share = poolShare.mul(reserve1);

    return {
      pair: liquidityPosition.pair.address,
      amount0: new Amount(token0, amount0Share),
      amount1: new Amount(token1, amount1Share),
    };
  });
}
