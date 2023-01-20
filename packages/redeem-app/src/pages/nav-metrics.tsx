import { JsonRpcProvider } from "@ethersproject/providers";
import {
    Amount,
    ChainId,
    DXD,
    getTokenBalancesSnapshotAtBlock,
    Token,
} from "dxd-redemptor-oracle";
import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { Container } from "../components/Container";
import { NAVTableSectionContainer } from "../components/NAVTableSectionContainer";
import {
    HeaderLayout,
    Metric,
    MetricInnerLayout,
} from "../components/NAVTableSectionContainer/styled";
import { SUBGRAPH_BLOCK_BUFFER } from "../constants";

type SnapshotParams = Awaited<
    ReturnType<typeof getTokenBalancesSnapshotAtBlock>
>;

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

export function NAVMetricsPage() {
    const [circulatingDXDSupply, setCirculatingDXDSupply] = useState<
        Amount<Token>
    >(Amount.fromRawAmount<Token>(DXD[ChainId.ETHEREUM], BigNumber.from("0")));
    const [dxdTotalSupply, setDXDTotalSupply] = useState<Amount<Token>>(
        Amount.fromRawAmount<Token>(DXD[ChainId.ETHEREUM], BigNumber.from("0"))
    );
    const [rawTokenBalances, setRawTokenBalances] = useState<
        SnapshotParams["rawTokenBalances"]
    >([]);
    const [tokenList, setTokenList] = useState(
        {} as SnapshotParams["tokenList"]
    );

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

            const {
                circulatingDXDSupply,
                dxdTotalSupply,
                rawTokenBalances,
                tokenList,
            } = await getTokenBalancesSnapshotAtBlock(
                block,
                subgraphEndpointList
            );

            setCirculatingDXDSupply(circulatingDXDSupply);
            setDXDTotalSupply(dxdTotalSupply);
            setRawTokenBalances(rawTokenBalances);
            setTokenList(tokenList);
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

    console.log("rawTokenBalances", rawTokenBalances);

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
            <NAVTableSectionContainer
                rawTokenBalances={rawTokenBalances}
                tokenList={tokenList}
            />
        </Container>
    );
}
