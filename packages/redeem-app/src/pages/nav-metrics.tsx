import {
    Amount,
    ChainId,
    DXD,
    getTokenBalancesSnapshotAtBlock,
    Token,
    NAV_TOKEN_LIST,
    Currency,
} from "dxd-redemptor-oracle";
import { BigNumber } from "ethers";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
    fetchNAVInformationAtBlock,
    getGnosisChainBlockByTimestamp,
    providerList,
} from "../api";
import { Container } from "../components/Container";
import { Footer } from "../components/Footer";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NumberInput } from "../components/form/NumberInput";
import {
    LiquidityPosition,
    NAVTableSectionContainer,
    TokenPrice,
} from "../components/NAVTableSectionContainer";
import {
    Metric,
    MetricInnerLayout,
    MetricListContainer,
} from "../components/NAVTableSectionContainer/styled";
import { SUBGRAPH_BLOCK_BUFFER } from "../constants";
import { getCurrencyChainId } from "../utils";

type SnapshotParams = Awaited<
    ReturnType<typeof getTokenBalancesSnapshotAtBlock>
>;

const LoadingContainer = styled.div`
    min-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 8px;
    > div[data-role="buttons"] {
        display: flex;
        gap: 8px;
        flex: 1;
    }
`;

const PageLink = styled.a`
    color: #000;
    text-decoration: underline;

    :visited {
        color: #000;
        text-decoration: underline;
    }
`;

const currencyFormatter = new Intl.NumberFormat();

const tokenList = [
    Currency.getNative(ChainId.ETHEREUM),
    Currency.getNative(ChainId.GNOSIS),
    ...NAV_TOKEN_LIST,
].sort((a, b) => {
    const aChainId = getCurrencyChainId(a);
    const bChainId = getCurrencyChainId(b);

    return aChainId - bChainId;
});

export default function NAVMetricsPage() {
    const ethBlockNumberFromSearch = new URLSearchParams(
        window.location.search
    ).get("block");
    const fetchInterval = useRef<NodeJS.Timeout>();
    const [block, setBlock] = useState({} as Record<ChainId, number>);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [customEthereumBlock, setCustomEthereumBlock] = useState<
        number | null
    >(ethBlockNumberFromSearch ? parseInt(ethBlockNumberFromSearch) : null);
    const [circulatingDXDSupply, setCirculatingDXDSupply] = useState<
        Amount<Token>
    >(Amount.fromRawAmount<Token>(DXD[ChainId.ETHEREUM], BigNumber.from("0")));
    const [dxdTotalSupply, setDXDTotalSupply] = useState<Amount<Token>>(
        Amount.fromRawAmount<Token>(DXD[ChainId.ETHEREUM], BigNumber.from("0"))
    );
    const [rawTokenBalances, setRawTokenBalances] = useState<
        SnapshotParams["rawTokenBalances"]
    >([]);

    const [navUSD, setNavUSD] = useState(0);
    const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);

    const [loadingPrices, setLoadingPrices] = useState(true);

    const [principalList, setPrincipalList] = useState<LiquidityPosition[]>([]);
    const updateBlock = async (ethereumBlock?: number) => {
        let ethBlockNumber = await providerList[
            ChainId.ETHEREUM
        ].getBlockNumber();
        let gnosisBlockNumber = await providerList[
            ChainId.GNOSIS
        ].getBlockNumber();

        if (ethereumBlock !== undefined && ethereumBlock !== 0) {
            const ethBlockTag = await providerList[ChainId.ETHEREUM].getBlock(
                ethereumBlock
            );
            ethBlockNumber = ethBlockTag.number;
            gnosisBlockNumber = await getGnosisChainBlockByTimestamp(
                ethBlockTag.timestamp
            );
        }

        const block = {
            [ChainId.ETHEREUM]: ethBlockNumber - SUBGRAPH_BLOCK_BUFFER,
            [ChainId.GNOSIS]: gnosisBlockNumber - SUBGRAPH_BLOCK_BUFFER,
        };
        setBlock(block);
    };

    useEffect(() => {
        if (customEthereumBlock !== null && customEthereumBlock !== 0) {
            updateBlock(customEthereumBlock);
            clearInterval(fetchInterval.current);
            return;
        }

        updateBlock().then(() => {
            fetchInterval.current = setInterval(updateBlock, 30000);
        });

        return () => {
            clearInterval(fetchInterval.current);
        };
    }, [customEthereumBlock]);

    useEffect(() => {
        if (
            block[ChainId.ETHEREUM] === undefined &&
            block[ChainId.GNOSIS] === undefined
        ) {
            return;
        }

        fetchNAVInformationAtBlock(block)
            .then(
                async ({
                    circulatingDXDSupply,
                    dxdTotalSupply,
                    rawTokenBalances,
                    principalList,
                    tokenPrices,
                }) => {
                    setCirculatingDXDSupply(circulatingDXDSupply);
                    setDXDTotalSupply(dxdTotalSupply);
                    setRawTokenBalances(rawTokenBalances);
                    setPrincipalList(principalList);
                    setTokenPrices(tokenPrices);
                    setLoadingPrices(false);
                }
            )
            .catch((error) => {
                console.error(`Failed to fetch balances: ${error}`);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [block[ChainId.ETHEREUM], block[ChainId.GNOSIS]]);

    const linkToPage = () => {
        if (block[ChainId.ETHEREUM] !== undefined) {
            const url = new URL(window.location.href);
            url.hash = "";
            url.searchParams.set("block", block[ChainId.ETHEREUM]?.toString());
            return url.toString();
        }
    };

    return (
        <Container>
            <MetricListContainer>
                <Metric>
                    <MetricInnerLayout>
                        <h2>DXD Total Supply</h2>
                        <p>
                            {currencyFormatter.format(
                                parseFloat(dxdTotalSupply.toFixed())
                            )}{" "}
                            DXD
                        </p>
                        <p>
                            From <code>DXD.totalySupply()</code> on Ethereum
                        </p>
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
                <Metric>
                    <MetricInnerLayout>
                        <h2>DXdao NAV Value</h2>
                        <p>${currencyFormatter.format(navUSD)}</p>
                        <p>
                            <strong>
                                DXD price backed by 70% NAV: $
                                {currencyFormatter.format(
                                    (navUSD * 0.7) /
                                        parseFloat(
                                            circulatingDXDSupply.toFixed()
                                        )
                                )}
                            </strong>
                        </p>
                    </MetricInnerLayout>
                </Metric>
                <Metric>
                    <MetricInnerLayout>
                        <h2>Block</h2>
                        <p>
                            {block[ChainId.ETHEREUM]
                                ? block[ChainId.ETHEREUM]
                                : "Loading..."}
                        </p>
                        {/* <Form>
                            <label>Custom Block</label>
                            <NumberInput
                                min={0}
                                value={customEthereumBlock || ""}
                                onChange={(value) => {
                                    setCustomEthereumBlock(
                                        parseInt(value) || 0
                                    );
                                }}
                            />
                        </Form> */}
                        {linkToPage() !== undefined && (
                            <div>
                                <PageLink href={linkToPage()}>
                                    {linkToPage()}
                                </PageLink>
                            </div>
                        )}
                    </MetricInnerLayout>
                </Metric>
            </MetricListContainer>
            {!loadingPrices ? (
                <NAVTableSectionContainer
                    tokenPrices={tokenPrices}
                    rawTokenBalances={rawTokenBalances}
                    tokenList={tokenList}
                    liquidityPositions={principalList}
                    onNAVUSDValueChange={(value) => setNavUSD(value)}
                />
            ) : (
                <LoadingContainer>Loading...</LoadingContainer>
            )}
            <Footer />
        </Container>
    );
}
