import { ChainId, SWAPR_SUBGRAPH_CLIENT } from "../../constants";

// get all minst and burns to get principal amounts
const MINTS_AND_BURNS_QUERY = `
    query events($userAddress: Bytes!, $pairAddress: Bytes!, $blockNumber: Int!) {
    mints(where: { to: $userAddress, pair: $pairAddress }, block: { number: $blockNumber }) {
      amountUSD
      amount0
      amount1
      timestamp
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
    burns(where: { sender: $userAddress, pair: $pairAddress }, block: { number: $blockNumber }) {
      amountUSD
      amount0
      amount1
      timestamp
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
  `;

interface SwaprBurnsAndMintsResponse {
    mints: {
        amountUSD: string;
        amount0: string;
        amount1: string;
        timestamp: string;
        pair: {
            token0: {
                id: string;
            };
            token1: {
                id: string;
            };
        };
    }[];
    burns: SwaprBurnsAndMintsResponse["mints"];
}

/**
 * Get the principal amount for a user in a pair
 * @param userAddress
 * @param pairAddress
 * @returns
 */
export async function getPrincipalForUserPerPair(
    userAddress: string,
    pairAddress: string,
    blockNumber: number,
    chainId: ChainId
): Promise<{ amount0: number; amount1: number }> {
    let amount0 = 0;
    let amount1 = 0;

    const response = await SWAPR_SUBGRAPH_CLIENT[
        chainId
    ].request<SwaprBurnsAndMintsResponse>(MINTS_AND_BURNS_QUERY, {
        blockNumber,
        userAddress,
        pairAddress,
    });

    for (const mint of response.mints) {
        amount0 += parseFloat(mint.amount0);
        amount1 += parseFloat(mint.amount1);
    }

    for (const burn of response.burns) {
        amount0 -= parseFloat(burn.amount0);
        amount1 -= parseFloat(burn.amount1);
    }

    return { amount0, amount1 };
}
