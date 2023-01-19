import { JsonRpcProvider } from "@ethersproject/providers";
import {
    Amount,
    ChainId,
    DXD,
    getTokenBalancesSnapshotAtBlock,
    Token,
} from "dxd-redemptor-oracle";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils.js";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Container } from "../components/Container";

const HeaderLayout = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
`;

const Metric = styled.div`
    background-color: #fff;
    border: 1px solid #000;
    border-radius: 3px;
    padding: 10px;
    text-align: center;
`;

const MetricInnerLayout = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
`;

const NAVTableSection = styled.div`
    background-color: #fff;
    margin-bottom: 15px;
`;
const SUBGRAPH_BLOCK_BUFFER = 10;

function getAddressLabel(address: string) {
    return {
        "0x519b70055af55a007110b4ff99b0ea33071c720a": "DXdao Avatar (Ethereum)",
        "0xe716ec63c5673b3a4732d22909b38d779fa47c3f": "DXdao Avatar (Gnosis)",
        "0xc088e949b9643d5c47a188084579b8d19b1b1112":
            "Swapr Relayer (Ethereum)",
        "0xa1d65e8fb6e87b60feccbc582f7f97804b725521":
            "DXD Token Contract (Ethereum)",
        "0x9467dcfd4519287e3878c018c02f5670465a9003": "DXdao Multichain Safe",
        "0x00ce8162527da8bd59056e2a54c3726886cba676": "DXvoice Guild Safe",
        "0x22f3bb8defb1b9a6c18da5e1496cd1b15fc79d70": "Operations Guild Safe",
        "0x3921d59090810c1d52807cd8ca1ea2289e1f89e6": "Swapr Relayer (Gnosis)",
        "0x76a48becad072b90761859bd2c517a7395775103": "Swapr Guild Safe",
        "0x975e8af284fcfee19326a26908b45bd2fce1cef0": "Carrot Guild Safe",
    }[address.toLowerCase()];
}

function getExplorerLink(chainId: ChainId, address: string) {
    return {
        [ChainId.ETHEREUM]: `https://etherscan.io/address/${address}`,
        [ChainId.GNOSIS]: `https://gnosisscan.io/address/${address}`,
    }[chainId];
}

const CHAIN_NAME: Record<ChainId, string> = {
    [ChainId.ETHEREUM]: "Ethereum",
    [ChainId.GNOSIS]: "Gnosis Chain",
};

const providerList = {
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

const currencyFormatter = new Intl.NumberFormat();

function NAVTableSectionContainer({
    rawTokenBalances,
}: {
    rawTokenBalances: Awaited<
        ReturnType<typeof getTokenBalancesSnapshotAtBlock>
    >["rawTokenBalances"];
}) {
    if (rawTokenBalances.length === 0) {
        return null;
    }

    return (
        <NAVTableSection>
            <h1>DXdao Net Asset Value (NAV) Tokens</h1>
            <table>
                <thead>
                    <tr>
                        <th>Chain</th>
                        <th>Address Name</th>
                        <th>Address</th>
                        <th>Token</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {rawTokenBalances.map((rawTokenBalance) => {
                        const chainId = (rawTokenBalance.token as any).chainId;

                        return (
                            <tr key={rawTokenBalance.amount}>
                                <td>
                                    {
                                        CHAIN_NAME[
                                            chainId as keyof typeof CHAIN_NAME
                                        ]
                                    }
                                </td>
                                <td>
                                    {getAddressLabel(rawTokenBalance.address)}
                                </td>
                                <td>
                                    <a
                                        href={getExplorerLink(
                                            chainId,
                                            rawTokenBalance.address
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="View on Explorer"
                                    >
                                        {rawTokenBalance.address}
                                    </a>
                                </td>
                                <td>{rawTokenBalance.token.symbol}</td>
                                <td>
                                    {currencyFormatter.format(
                                        parseFloat(
                                            formatUnits(
                                                rawTokenBalance.amount,
                                                rawTokenBalance.token.decimals
                                            )
                                        )
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </NAVTableSection>
    );
}

export function NAVMetricsPage() {
    const [circulatingDXDSupply, setCirculatingDXDSupply] = useState<
        Amount<Token>
    >(Amount.fromRawAmount<Token>(DXD[ChainId.ETHEREUM], BigNumber.from("0")));
    const [dxdTotalSupply, setDXDTotalSupply] = useState<Amount<Token>>(
        Amount.fromRawAmount<Token>(DXD[ChainId.ETHEREUM], BigNumber.from("0"))
    );
    const [rawTokenBalances, setRawTokenBalances] = useState<
        Awaited<
            ReturnType<typeof getTokenBalancesSnapshotAtBlock>
        >["rawTokenBalances"]
    >([]);

    const fetchAndUpdateBalances = async () => {
        try {
            const block = {
                [ChainId.ETHEREUM]:
                    (await providerList[ChainId.ETHEREUM].getBlockNumber()) -
                    SUBGRAPH_BLOCK_BUFFER,
                [ChainId.GNOSIS]:
                    (await providerList[ChainId.GNOSIS].getBlockNumber()) -
                    SUBGRAPH_BLOCK_BUFFER,
            };

            const { circulatingDXDSupply, dxdTotalSupply, rawTokenBalances } =
                await getTokenBalancesSnapshotAtBlock(
                    block,
                    subgraphEndpointList
                );

            setCirculatingDXDSupply(circulatingDXDSupply);
            setDXDTotalSupply(dxdTotalSupply);
            setRawTokenBalances(rawTokenBalances);
        } catch (error) {
            console.log(`Failed to fetch balances: ${error}`);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        fetchAndUpdateBalances().then(() => {
            interval = setInterval(fetchAndUpdateBalances, 30000);
        });

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <Container>
            <HeaderLayout>
                <Metric>
                    <MetricInnerLayout>
                        <h2>DXD Total Supply</h2>
                        <p>
                            {currencyFormatter.format(
                                parseFloat(dxdTotalSupply.toFixed())
                            )}{" "}
                            DXD
                        </p>
                        <p>Total DXD supply (`DXD.totalySupply`) on Ethereum</p>
                    </MetricInnerLayout>
                </Metric>
                <Metric>
                    <MetricInnerLayout>
                        <h2>Circulating DXD Supply</h2>
                        <p>
                            {currencyFormatter.format(
                                parseFloat(circulatingDXDSupply.toFixed())
                            )}{" "}
                            DXD
                        </p>
                        <p>
                            DXD outside of DXdao Treasury, Guilds, Gnosis Safes
                            and DXD contract
                        </p>
                    </MetricInnerLayout>
                </Metric>
            </HeaderLayout>
            <NAVTableSectionContainer rawTokenBalances={rawTokenBalances} />
        </Container>
    );
}
