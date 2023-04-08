import { AnimatePresence } from "framer-motion";
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
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Card, CardInnerWrapper, CardTitle } from "ui/components/Card";
import {
  DXDAO_DXD_IN_HATS_VAULT_AMOUNT,
  DXDAO_UNVESTED_DXD_TO_CONTRIBUTORS,
  fetchNAVInformationAtBlock,
  getLastSyncedBlockNumber,
} from "./api";
import { NumberInput } from "../form/NumberInput";
import {
  LiquidityPosition,
  NAVTableSectionContainer,
  TokenPrice,
} from "../NAVTableSectionContainer";
import { MetricListContainer } from "../NAVTableSectionContainer/styled";
import { DXDAO_ADDRESS_LIST } from "../../constants";
import { getCurrencyChainId } from "utils";
import { Container } from "ui/components/Container";
import { FormGroup } from "components/FormGroup";

import { DXDValueBreakdown } from "./DXDValueBreakdown";
import { currencyFormatter } from "./utils";
import {
  CardInnerWrapperLayout,
  MotionOpacity,
  MotionOpacityLoader,
} from "./styled";
import { MetricCard, MotionMetricLoader } from "./partials";
import Select from "react-select";
import { getStyles } from "components/form/Select";

type AddressOption = typeof DXDAO_ADDRESS_LIST[0];

function AddressListOptions({
  onChange,
  value,
}: {
  value: AddressOption[];
  onChange: (nextOptions: AddressOption[]) => void;
}) {
  const options = useMemo(() => {
    return DXDAO_ADDRESS_LIST;
  }, []);

  return (
    <Select<AddressOption, true>
      value={value}
      options={options}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.address}
      isMulti={true}
      isSearchable={true}
      id="address-list"
      styles={getStyles()}
      components={{
        IndicatorSeparator: () => null,
        DropdownIndicator: () => null,
      }}
      onChange={(nextOptions) => {
        onChange(nextOptions as AddressOption[]);
      }}
      closeMenuOnSelect={false}
    />
  );
}

export function NAVMetricsContainer() {
  const ethBlockNumberFromSearch = new URLSearchParams(
    window.location.search
  ).get("block");
  const fetchInterval = useRef<NodeJS.Timeout>();
  const [block, setBlock] = useState({} as Record<ChainId, number>);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [customEthereumBlock, setCustomEthereumBlock] = useState<number | null>(
    ethBlockNumberFromSearch ? parseInt(ethBlockNumberFromSearch) : null
  );
  // DXD total supply from the API
  const [circulatingDXDSupplyAPI, setCirculatingDXDSupplyAPI] = useState<
    Amount<Token>
  >(Amount.fromRawAmount<Token>(DXD[ChainId.ETHEREUM], BigNumber.from("0")));
  // DXD total supply from the API
  const [circulatingDXDCustomValue, setCirculatingDXDSupplyCustomValue] =
    useState<string>("");
  // DXD total supply from the API
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
  const [addressList, setAddressList] =
    useState<AddressOption[]>(DXDAO_ADDRESS_LIST);

  const [totalETHAmount, setTotalETHAmount] = useState(0);
  const [totalETHAmountValue, setTotalETHAmountValue] = useState(0);
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [principalList, setPrincipalList] = useState<LiquidityPosition[]>([]);

  const updateBlock = async (ethereumBlock?: number) => {
    const syncedBlocks = await getLastSyncedBlockNumber();
    setBlock(syncedBlocks);
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
          setCirculatingDXDSupplyAPI(circulatingDXDSupply);
          setCirculatingDXDSupply(circulatingDXDSupply); // Initial value is the same as the API value
          setDXDTotalSupply(dxdTotalSupply);
          setRawTokenBalances(rawTokenBalances);
          setPrincipalList(principalList);
          setTokenPrices(tokenPrices);
          setIsLoadingPrices(false);
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
    <Container $maxWidth="1400px">
      <MetricListContainer
        $mdColumns={2}
        $lgColumns={4}
        $mdRows={2}
        $lgRows={1}
      >
        <MetricCard>
          <CardInnerWrapperLayout>
            <CardTitle>Total Supply</CardTitle>
            <AnimatePresence mode="wait">
              {isLoadingPrices === true ? (
                <MotionMetricLoader key="ts-loader" />
              ) : (
                <MotionOpacity key="dxd-total-supply">
                  <CardInnerWrapperLayout>
                    <span>
                      {currencyFormatter.format(
                        parseFloat(dxdTotalSupply.toFixed())
                      )}{" "}
                      DXD
                    </span>
                    <small>
                      <code>DXD.totalSupply()</code> on Ethereum
                    </small>
                  </CardInnerWrapperLayout>
                </MotionOpacity>
              )}
            </AnimatePresence>
          </CardInnerWrapperLayout>
        </MetricCard>
        <MetricCard>
          <CardInnerWrapperLayout>
            <CardTitle>Circulating Supply</CardTitle>
            <AnimatePresence mode="wait">
              {isLoadingPrices === true ? (
                <MotionMetricLoader key="nav-loader" />
              ) : (
                <MotionOpacity key="nav-table">
                  <CardInnerWrapperLayout>
                    <span>
                      {currencyFormatter.format(
                        parseFloat(circulatingDXDSupplyAPI.toFixed())
                      )}{" "}
                      DXD
                    </span>
                    <small>
                      <code>Total supply - DXD supply under DXdao control</code>
                    </small>
                    <small>
                      <strong>Hats Finance Vault*</strong>{" "}
                      <span>
                        -
                        {currencyFormatter.format(
                          DXDAO_DXD_IN_HATS_VAULT_AMOUNT
                        )}
                      </span>
                    </small>
                    <small>
                      <strong>Unvested DXD to Contributors*</strong>{" "}
                      <span>
                        +
                        {currencyFormatter.format(
                          DXDAO_UNVESTED_DXD_TO_CONTRIBUTORS
                        )}
                      </span>
                    </small>
                    <small>* Manually calculated</small>
                  </CardInnerWrapperLayout>
                </MotionOpacity>
              )}
            </AnimatePresence>
          </CardInnerWrapperLayout>
        </MetricCard>
        <MetricCard>
          <CardInnerWrapperLayout>
            <CardTitle>NAV</CardTitle>
            <AnimatePresence mode="wait">
              {isLoadingPrices === true ? (
                <MotionMetricLoader key="nav-loader" />
              ) : (
                <MotionOpacity key="nav-table">
                  <CardInnerWrapperLayout>
                    <div>
                      <span>${currencyFormatter.format(navUSD)}</span>
                    </div>
                    <small>
                      <strong>ETH (+ LSDs)</strong>
                      <span>
                        {" "}
                        {currencyFormatter.format(
                          parseFloat(totalETHAmount.toFixed())
                        )}
                      </span>
                    </small>
                    <small>
                      <strong>ETH (+ LSDs) value</strong>
                      <span>
                        {" "}
                        $
                        {currencyFormatter.format(
                          parseFloat(totalETHAmountValue.toFixed())
                        )}
                      </span>
                    </small>
                  </CardInnerWrapperLayout>
                </MotionOpacity>
              )}
            </AnimatePresence>
          </CardInnerWrapperLayout>
        </MetricCard>
        <MetricCard>
          <CardInnerWrapperLayout>
            <CardTitle>Block</CardTitle>
            <AnimatePresence mode="wait">
              {isLoadingPrices === false && block[ChainId.ETHEREUM] ? (
                <MotionOpacity key="nav-table">
                  <span>{block[ChainId.ETHEREUM]}</span>
                  {linkToPage() !== undefined && (
                    <div>
                      <PageLink href={linkToPage()}>{linkToPage()}</PageLink>
                    </div>
                  )}
                </MotionOpacity>
              ) : (
                <MotionMetricLoader key="block-loader" />
              )}
            </AnimatePresence>
          </CardInnerWrapperLayout>
        </MetricCard>
      </MetricListContainer>
      <MetricListContainer
        $mdColumns={1}
        $mdRows={3}
        $lgColumns={".98fr 2fr .98fr"} // don't ask me why, but it works
        $lgRows={1}
      >
        <MetricCard>
          <CardInnerWrapperLayout>
            <CardTitle>Custom Circulating Supply</CardTitle>
            <label>Custom circulating supply (overrides the API value)</label>
            <FormGroup>
              <NumberInput
                placeholder="Custom Circulating supply"
                value={circulatingDXDCustomValue}
                onUserInput={(nextCustomDXDCirculatingSupplyFloat) => {
                  // Always update the local state
                  setCirculatingDXDSupplyCustomValue(
                    nextCustomDXDCirculatingSupplyFloat
                  );
                  // Use the API value if the user input is empty
                  if (nextCustomDXDCirculatingSupplyFloat.trim() === "") {
                    setCirculatingDXDSupply(circulatingDXDSupplyAPI);
                    return;
                  }
                  // Use the user input value otherwise
                  setCirculatingDXDSupply(
                    new Amount<Token>(
                      DXD[ChainId.ETHEREUM],
                      nextCustomDXDCirculatingSupplyFloat.trim() === ""
                        ? 0
                        : nextCustomDXDCirculatingSupplyFloat
                    )
                  );
                }}
              />
            </FormGroup>
          </CardInnerWrapperLayout>
        </MetricCard>
        <MetricCard>
          <CardInnerWrapperLayout>
            <CardTitle>Address List</CardTitle>
            <FormGroup>
              <AddressListOptions
                value={addressList}
                onChange={(nextAddressList) => {
                  setAddressList(nextAddressList);
                }}
              />
            </FormGroup>
          </CardInnerWrapperLayout>
        </MetricCard>
        <MetricCard>
          <DXDValueBreakdown
            isLoadingPrices={isLoadingPrices}
            circulatingDXDSupply={circulatingDXDSupply}
            navUSD={navUSD}
          />
        </MetricCard>
      </MetricListContainer>
      <Card>
        <CardInnerWrapper $minHeight="500px">
          <CardTitle>Assets</CardTitle>
          <AnimatePresence mode="wait">
            {isLoadingPrices === true ? (
              <MotionOpacityLoader key="nav-table-loader" />
            ) : (
              <MotionOpacity key="nav-table">
                <NAVTableSectionContainer
                  addressList={addressList}
                  tokenPrices={tokenPrices}
                  rawTokenBalances={rawTokenBalances}
                  tokenList={tokenList}
                  liquidityPositions={principalList}
                  onNAVUSDValueChange={(value) => setNavUSD(value)}
                  onTotalETHChange={(
                    nextTotalETHAmount,
                    nextTotalETHAmountValue
                  ) => {
                    setTotalETHAmount(nextTotalETHAmount);
                    setTotalETHAmountValue(nextTotalETHAmountValue);
                  }}
                />
              </MotionOpacity>
            )}
          </AnimatePresence>
        </CardInnerWrapper>
      </Card>
    </Container>
  );
}

type SnapshotParams = Awaited<
  ReturnType<typeof getTokenBalancesSnapshotAtBlock>
>;

const PageLink = styled.a`
  color: #fff;
  text-decoration: underline;
  :visited {
    color: #fff;
    text-decoration: underline;
  }
`;

const tokenList = [
  Currency.getNative(ChainId.ETHEREUM),
  Currency.getNative(ChainId.GNOSIS),
  ...NAV_TOKEN_LIST,
  // Add DXD
  DXD[ChainId.ETHEREUM],
  DXD[ChainId.GNOSIS],
]
  .sort((a, b) => {
    const aChainId = getCurrencyChainId(a);
    const bChainId = getCurrencyChainId(b);

    return aChainId - bChainId;
  }) // Remove ENS + SWPR from the NAV
  .filter((token) => token.symbol !== "ENS" && token.symbol !== "SWPR");
