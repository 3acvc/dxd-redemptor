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
import { formatUnits, parseEther } from "ethers/lib/utils.js";
import { isDXDToken } from "./utils";

export const providerList: Record<ChainId, Provider> = {
  [ChainId.ETHEREUM]: new JsonRpcProvider(
    "https://eth-mainnet.g.alchemy.com/v2/EY3WaGaUwnSMBGBXwVzUiAssjPL_zQeM" // @todo move to env
  ),
  [ChainId.GNOSIS]: new JsonRpcProvider("https://rpc.gnosischain.com"),
};

const subgraphEndpointList = {
  [ChainId.ETHEREUM]:
    "https://api.thegraph.com/subgraphs/name/adamazad/dxdao-nav-ethereum-v1-1-0",
  [ChainId.GNOSIS]:
    "https://api.thegraph.com/subgraphs/name/adamazad/dxdao-nav-gnosis-v1-1-0",
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

  const dxdUnderDXdaoControl = rawTokenBalances
    .filter((tokenBalance) => isDXDToken(tokenBalance.token.address))
    .reduce((acc, tokenBalance) => {
      return (
        acc +
        parseFloat(
          formatUnits(tokenBalance.amount, tokenBalance.token.decimals)
        )
      );
    }, 0);

  // Find LP position with DXD token
  const dxdLPPositions = principalList.reduce((acc, principal) => {
    const isAmount0DXD = isDXDToken(principal.amount0.currency.address);
    const isAmount1DXD = isDXDToken(principal.amount1.currency.address);

    if (isAmount0DXD) {
      return acc + parseFloat(principal.amount0.toFixed(6));
    }

    if (isAmount1DXD) {
      return acc + parseFloat(principal.amount1.toFixed(6));
    }

    return acc;
  }, 0);

  return {
    circulatingDXDSupply: new Amount(
      circulatingDXDSupply.currency,
      // Sum DXD under DXdao control, DXD in DXdao's LP positions, DXD in Hats Finance Vault, and DXD to be vested to contributors
      // Then subtract from total DXD supply
      dxdTotalSupply
        .sub(dxdUnderDXdaoControl)
        .sub(dxdLPPositions)
        .minus(DXDAO_DXD_IN_HATS_VAULT_AMOUNT)
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

const GET_SUBGRAPH_STATUS = gql`
  query getSubgraphStatus {
    subgraphStatus(id: "1") {
      id
      isInitialized
      lastSnapshotBlock
    }
  }
`;

/**
 * Get the last synced block number from the subgraph
 */
export async function getLastSyncedBlockNumber(): Promise<{
  [ChainId.ETHEREUM]: number;
  [ChainId.GNOSIS]: number;
}> {
  const client = new GraphQLClient(subgraphEndpointList[ChainId.ETHEREUM]);

  const res = await client.request(GET_SUBGRAPH_STATUS, {});

  const ethereumBlock = parseInt(res.subgraphStatus.lastSnapshotBlock);
  const gnosisBlock = await getGnosisChainBlockByTimestamp(
    (await providerList[ChainId.ETHEREUM].getBlock(ethereumBlock)).timestamp
  );

  return {
    [ChainId.ETHEREUM]: ethereumBlock,
    [ChainId.GNOSIS]: gnosisBlock,
  };
}
