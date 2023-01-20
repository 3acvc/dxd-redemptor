import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { getTokenBalancesSnapshotAtBlock } from "dxd-redemptor-oracle";
import { TokenInfoContainer, NAVTable, NAVTableSection } from "./styled";
import { CurrencyChainLogo } from "../CurrencyChainLogo";
import { DXDAO_ADDRESS_LIST } from "../../constants";

type SnapshotParams = Awaited<
    ReturnType<typeof getTokenBalancesSnapshotAtBlock>
>;

const currencyFormatter = new Intl.NumberFormat();

export function NAVTableSectionContainer({
    rawTokenBalances,
    tokenList,
}: {
    rawTokenBalances: SnapshotParams["rawTokenBalances"];
    tokenList: SnapshotParams["tokenList"];
}) {
    if (rawTokenBalances.length === 0) {
        return null;
    }

    const addressColumns = DXDAO_ADDRESS_LIST;

    return (
        <NAVTableSection>
            <NAVTable>
                <caption>DXdao Net Asset Value (NAV) Tokens</caption>
                <thead>
                    <tr>
                        <th>Asset</th>
                        {addressColumns.map(({ address, label }) => (
                            <th key={address}>
                                <DebankProfileLink
                                    address={address}
                                    label={label}
                                />
                            </th>
                        ))}
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {tokenList.map((token) => {
                        const rowKey = `${token.symbol}-${token.address}`;
                        const tokenSymbol = token.symbol;
                        const tokenBalanceColumns = [] as any[];

                        let total = parseUnits("0", token.decimals);
                        for (const addressColumn of addressColumns) {
                            const columnKey = `${rowKey}-${addressColumn.address}`;

                            const addressHasToken = rawTokenBalances.find(
                                (rawTokenBalance) =>
                                    rawTokenBalance.address.toLowerCase() ===
                                        addressColumn.address.toString() &&
                                    rawTokenBalance.token.address.toLowerCase() ===
                                        token.address.toLowerCase() &&
                                    rawTokenBalance.token.symbol.toLowerCase() ===
                                        token.symbol.toLowerCase()
                            );

                            addressHasToken &&
                                (total = total.add(addressHasToken.amount));

                            tokenBalanceColumns.push(
                                <td key={columnKey}>
                                    {addressHasToken &&
                                        currencyFormatter.format(
                                            parseFloat(
                                                formatUnits(
                                                    addressHasToken.amount || 0,
                                                    token.decimals
                                                )
                                            )
                                        )}
                                </td>
                            );
                        }

                        return (
                            <tr key={rowKey}>
                                <>
                                    <th>
                                        <TokenInfoContainer>
                                            {tokenSymbol}{" "}
                                            <CurrencyChainLogo
                                                currency={token}
                                            />
                                        </TokenInfoContainer>
                                    </th>
                                    {tokenBalanceColumns}
                                    <td>
                                        {currencyFormatter.format(
                                            parseFloat(
                                                formatUnits(
                                                    total || 0,
                                                    token.decimals
                                                )
                                            )
                                        )}
                                    </td>
                                </>
                            </tr>
                        );
                    })}
                </tbody>
            </NAVTable>
        </NAVTableSection>
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
