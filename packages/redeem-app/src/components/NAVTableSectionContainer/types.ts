import type { ChainId, getTokenBalancesSnapshotAtBlock, getTokenUSDCPriceViaOracle, getUserLiquidityPositions } from "dxd-redemptor-oracle";

export type SnapshotParams = Awaited<
  ReturnType<typeof getTokenBalancesSnapshotAtBlock>
>;

export type TokenPrice = Awaited<
  ReturnType<typeof getTokenUSDCPriceViaOracle>
>[number];

export type LiquidityPosition = Awaited<
  ReturnType<typeof getUserLiquidityPositions>
>[number] & {
  user: string;
  chainId: ChainId;
};
