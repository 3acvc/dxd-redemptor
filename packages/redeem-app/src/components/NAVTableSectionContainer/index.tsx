import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import {
  ChainId,
  type getUserLiquidityPositions,
  type getTokenBalancesSnapshotAtBlock,
  Amount,
  type getTokenUSDCPriceViaOracle,
  getPriceableToken,
} from "dxd-redemptor-oracle";
import { TokenInfoContainer, NAVTable } from "./styled";
import { CurrencyChainLogo } from "../CurrencyChainLogo";
import { DXDAO_ADDRESS_LIST } from "../../constants";
import { getCurrencyChainId } from "../../utils";

type SnapshotParams = Awaited<
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

const currencyFormatter = new Intl.NumberFormat();

function findTokenAmounrInLiquidityPositions(
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

export function NAVTableSectionContainer({
  rawTokenBalances,
  tokenList,
  liquidityPositions,
  tokenPrices,
  onNAVUSDValueChange,
  onTotalETHChange,
  onTotalDXDChange,
  addressList: addressColumns,
}: {
  rawTokenBalances: SnapshotParams["rawTokenBalances"];
  tokenList: SnapshotParams["tokenList"];
  liquidityPositions: LiquidityPosition[];
  tokenPrices: TokenPrice[];
  onNAVUSDValueChange?: (value: number) => void;
  onTotalETHChange?: (amount: number, value: number) => void;
  onTotalDXDChange?: (amount: number, value: number) => void;
  addressList: typeof DXDAO_ADDRESS_LIST;
}) {
  if (rawTokenBalances.length === 0) {
    return null;
  }

  let usdValue = 0;
  let totalETHAmount = 0;
  let totalETHValue = 0;
  let totalDXD = 0;

  return (
    <NAVTable>
      <caption></caption>
      <thead>
        <tr>
          <th>Asset</th>
          {addressColumns.map(({ address, label }) => (
            <th key={address}>
              <DebankProfileLink address={address} label={label} />
            </th>
          ))}
          <th>Total</th>
          <th>Price</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {tokenList.map((token, index) => {
          const isLastToken = index === tokenList.length - 1;
          const priceableToken = getPriceableToken(token);
          const rowKey = `${token.symbol}-${token.address}`;
          const tokenSymbol = token.symbol;
          const tokenBalanceColumns = [] as any[];

          let tokenTotal = parseUnits("0", token.decimals);

          for (const addressColumn of addressColumns) {
            const columnKey = `${rowKey}-${addressColumn.address}`;
            let addressTotal = parseUnits("0", token.decimals);

            const addressHasToken = rawTokenBalances.find(
              (rawTokenBalance) =>
                rawTokenBalance.address.toLowerCase() ===
                  addressColumn.address.toLowerCase() &&
                rawTokenBalance.token.address.toLowerCase() ===
                  token.address.toLowerCase() &&
                rawTokenBalance.token.symbol.toLowerCase() ===
                  token.symbol.toLowerCase()
            );

            const addressLPAmount = findTokenAmounrInLiquidityPositions(
              liquidityPositions,
              token,
              addressColumn.address
            );

            if (addressHasToken) {
              addressTotal = addressTotal.add(addressHasToken.amount);
              tokenTotal = tokenTotal.add(addressHasToken.amount);
            }
            if (addressLPAmount) {
              addressTotal = addressTotal.add(addressLPAmount.toRawAmount());
              tokenTotal = tokenTotal.add(addressLPAmount.toRawAmount());
            }

            tokenBalanceColumns.push(
              <td key={columnKey}>
                {!addressTotal.eq(0) &&
                  currencyFormatter.format(
                    parseFloat(formatUnits(addressTotal, token.decimals))
                  )}
              </td>
            );
          }

          // Add token price column
          let tokenPriceUSDC = tokenPrices.find((tokenPrice) => {
            return (
              tokenPrice.token.address.toLowerCase() ===
              priceableToken.address.toLowerCase()
            );
          })?.usdPrice;

          if (!tokenPriceUSDC && priceableToken.symbol === "USDC") {
            tokenPriceUSDC = parseUnits("1", 18);
          }

          const tokenPriceUSDCFloat = parseFloat(
            formatUnits(tokenPriceUSDC || 0, 18)
          );

          const tokenTotalFloat = parseFloat(
            formatUnits(tokenTotal || 0, token.decimals)
          );

          const tokenTotalValueFloat = tokenPriceUSDCFloat * tokenTotalFloat;

          usdValue += tokenTotalValueFloat;

          if (
            ["eth", "steth", "weth", "reth", "reth2", "seth"].includes(
              tokenSymbol.toLowerCase()
            )
          ) {
            totalETHAmount += tokenTotalFloat;
            totalETHValue += tokenTotalValueFloat;
          }

          if (tokenSymbol.toLowerCase() === "dxd") {
            totalDXD += tokenTotalFloat;
          }

          if (isLastToken) {
            onNAVUSDValueChange?.(usdValue);
            onTotalETHChange?.(totalETHAmount, totalETHValue);
            onTotalDXDChange?.(totalDXD, 0); // DXD value is not calculated
          }
          return (
            <tr key={rowKey}>
              <>
                <th>
                  <TokenInfoContainer>
                    {tokenSymbol} <CurrencyChainLogo currency={token} />
                  </TokenInfoContainer>
                </th>
                {tokenBalanceColumns}
                <td>{currencyFormatter.format(tokenTotalFloat)}</td>
                <td>
                  {tokenPriceUSDC ? (
                    <>
                      $
                      {currencyFormatter.format(
                        parseFloat(formatUnits(tokenPriceUSDC))
                      )}
                    </>
                  ) : (
                    <span>...</span>
                  )}
                </td>
                <td>$ {currencyFormatter.format(tokenTotalValueFloat)}</td>
              </>
            </tr>
          );
        })}
      </tbody>
    </NAVTable>
  );
}

function DebankProfileLink({
  address,
  label,
}: {
  address: string;
  label: string;
}) {
  return (
    <a
      href={`https://debank.com/profile/${address}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}
