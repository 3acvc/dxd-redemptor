import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import {
  ChainId,
  getTokenBalancesSnapshotAtBlock,
  getUserLiquidityPositions,
  DXSWAP_RELAYER,
  getTokenUSDCPriceViaOracle,
  toPriceableTokenList,
  NAV_TOKEN_LIST,
  Amount,
  DXDAO_AVATAR,
} from "dxd-redemptor-oracle";
import type { LiquidityPosition } from "../NAVTableSectionContainer";
import { GraphQLClient, gql } from "graphql-request";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils.js";

export const providerList: Record<ChainId, Provider> = {
  [ChainId.ETHEREUM]: new JsonRpcProvider(
    "https://eth-mainnet.g.alchemy.com/v2/EY3WaGaUwnSMBGBXwVzUiAssjPL_zQeM" // @todo move to env
  ),
  [ChainId.GNOSIS]: new JsonRpcProvider("https://rpc.gnosischain.com"),
};

const subgraphEndpointList = {
  [ChainId.ETHEREUM]:
    "https://api.thegraph.com/subgraphs/name/adamazad/dxdao-dxd-redemption-ethereum",
  [ChainId.GNOSIS]:
    "https://api.thegraph.com/subgraphs/name/adamazad/dxdao-dxd-redemption-gnosis",
};

const SUBGRAPH_BLOCKS_CLIENT = {
  [ChainId.GNOSIS]: new GraphQLClient(
    "https://api.thegraph.com/subgraphs/name/1hive/xdai-blocks"
  ),
};

/**
 * DXdao DXD in Hats Finance Vault.
 * This should be subtracted from the total DXD
 */
export const DXDAO_DXD_IN_HATS_VAULT_AMOUNT = 790;

/**
 * From Dave's spreadsheet
 */
export const DXDAO_UNVESTED_DXD_TO_CONTRIBUTORS = 3829.744;

/**
 * 1kx ETH debt
 */
export const ONEKX_ETH_DEBT = 835.3;
export const ONEKX_DAI_DEBT = 655_795.8;

export async function fetchNAVInformationAtBlock(
  block: Record<ChainId, number>
) {
  const {
    circulatingDXDSupply,
    dxdTotalSupply,
    tokenList,
    rawTokenBalances,
  } = await getTokenBalancesSnapshotAtBlock(block, subgraphEndpointList);

  // LP positions
  const principalList = [
    ...(
      await getUserLiquidityPositions(
        DXSWAP_RELAYER[ChainId.ETHEREUM],
        block[ChainId.ETHEREUM],
        ChainId.ETHEREUM
      )
    ).map(
      (lp) =>
        ({
          ...lp,
          chainId: ChainId.ETHEREUM,
          user: DXSWAP_RELAYER[ChainId.ETHEREUM],
        } as LiquidityPosition)
    ),
    ...(
      await getUserLiquidityPositions(
        DXSWAP_RELAYER[ChainId.GNOSIS],
        block[ChainId.GNOSIS],
        ChainId.GNOSIS
      )
    ).map(
      (lp) =>
        ({
          ...lp,
          chainId: ChainId.GNOSIS,
          user: DXSWAP_RELAYER[ChainId.GNOSIS],
        } as LiquidityPosition)
    ),
  ];

  // Get token prices
  const tokenPrices = await getTokenUSDCPriceViaOracle(
    toPriceableTokenList(NAV_TOKEN_LIST),
    providerList[ChainId.ETHEREUM],
    block[ChainId.ETHEREUM]
  );

  // Remove 1kx ETH debt
  const rawTokenBalancesWithoutDebt = rawTokenBalances.map((balance, i) => {
    if (
      balance.token.symbol === "ETH" &&
      balance.address.toLowerCase() ===
        DXDAO_AVATAR[ChainId.ETHEREUM].toLowerCase()
    ) {
      return {
        ...balance,
        amount: BigNumber.from(balance.amount)
          .sub(parseEther(ONEKX_ETH_DEBT.toString()))
          .toString(),
      };
    }

    if (
      balance.token.symbol === "DAI" &&
      balance.address.toLowerCase() ===
        DXDAO_AVATAR[ChainId.ETHEREUM].toLowerCase()
    ) {
      return {
        ...balance,
        amount: BigNumber.from(balance.amount)
          .sub(parseEther(ONEKX_DAI_DEBT.toString()))
          .toString(),
      };
    }

    return balance;
  });

  console.log({
    rawTokenBalancesWithoutDebt,
  });

  return {
    circulatingDXDSupply: new Amount(
      circulatingDXDSupply.currency,
      circulatingDXDSupply
        .sub(DXDAO_DXD_IN_HATS_VAULT_AMOUNT)
        .plus(DXDAO_UNVESTED_DXD_TO_CONTRIBUTORS)
    ),
    dxdTotalSupply,
    rawTokenBalances: rawTokenBalancesWithoutDebt,
    tokenList,
    principalList,
    tokenPrices,
  };
}

const GET_BLOCK_BY_TIMESTAMP = gql`
  query getBlockFromTimestamp($timestamp: String!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestamp }
    ) {
      number
    }
  }
`;

export async function getGnosisChainBlockByTimestamp(
  timestamp: number | string
): Promise<number> {
  const res = await SUBGRAPH_BLOCKS_CLIENT[ChainId.GNOSIS].request(
    GET_BLOCK_BY_TIMESTAMP,
    {
      timestamp: timestamp.toString(),
    }
  );
  return parseInt(res.blocks[0].number);
}
