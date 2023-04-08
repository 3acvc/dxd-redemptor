import { Amount } from "dxd-redemptor-oracle";
import { getCurrencyChainId } from "utils";
import { LiquidityPosition, SnapshotParams } from "./types";

export function findTokenAmounrInLiquidityPositions(
  liquidityPositions: LiquidityPosition[],
  token: SnapshotParams["tokenList"][number],
  owner: string
) {
  const tokenAddress = token.address.toLowerCase();
  const tokenChainId = getCurrencyChainId(token);

  let tokenAmount = new Amount(token, "0");
  for (const liquidityPosition of liquidityPositions) {
    if (
      liquidityPosition.chainId !== tokenChainId ||
      liquidityPosition.user.toLowerCase() !== owner.toLowerCase()
    ) {
      continue;
    }
    if (
      liquidityPosition.amount0.currency.address.toLowerCase() === tokenAddress
    ) {
      tokenAmount = new Amount(
        token,
        tokenAmount.add(liquidityPosition.amount0.toString())
      );
    }
    if (
      liquidityPosition.amount1.currency.address.toLowerCase() === tokenAddress
    ) {
      tokenAmount = new Amount(
        token,
        tokenAmount.add(liquidityPosition.amount1.toString())
      );
    }
  }

  return tokenAmount;
}
