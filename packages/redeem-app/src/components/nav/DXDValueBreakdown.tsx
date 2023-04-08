import { getStyles } from "components/form/Select";
import { AnimatePresence } from "framer-motion";
import { Amount, Token } from "dxd-redemptor-oracle";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { CardTitle } from "ui/components/Card";
import {
  CardInnerWrapperLayout,
  MotionOpacity,
  MotionOpacityLoader,
} from "./styled";
import { currencyFormatter } from "./utils";
import { TokenPrice } from "components/NAVTableSectionContainer";
import { formatUnits } from "ethers/lib/utils.js";

type PercentageOption = {
  label: string;
  value: number;
};

const navPercentageOptions = [0.01, 0.06, 0.08, 0.12, 0.8, 0.9, 1].map(
  (value) => ({
    label: `${value * 100}%`,
    value,
  })
);

export function DXDValueBreakdown({
  navUSD: initialNavUSD,
  isLoadingPrices,
  circulatingDXDSupply,
  tokenPrices,
}: {
  navUSD: number;
  circulatingDXDSupply: Amount<Token>;
  isLoadingPrices: boolean;
  tokenPrices: TokenPrice[];
}) {
  const [navUSD, setNavUSD] = useState(initialNavUSD);
  const [totalNavPercentage, setTotalNavPercentage] = useState(1);
  const [dxdUSDPriceBackedByNAV, setDXDUSDPriceBackedByNAV] = useState(0);

  const ethUSDPrice = useMemo(() => {
    return tokenPrices.find((tokenPrice) => tokenPrice.token.symbol === "WETH")
      ?.usdPrice;
  }, [tokenPrices]);

  // NAV/ETH price
  const navWETHPrice = useMemo(() => {
    if (!ethUSDPrice) return 0;
    const ethUSDPriceFloat = parseFloat(formatUnits(ethUSDPrice, 18));
    return navUSD / ethUSDPriceFloat;
  }, [ethUSDPrice, navUSD]);

  // DXD/ETH price
  const dxdWETHPrice = useMemo(() => {
    if (!ethUSDPrice) return 0;
    const ethUSDPriceFloat = parseFloat(formatUnits(ethUSDPrice, 18));
    return dxdUSDPriceBackedByNAV / ethUSDPriceFloat;
  }, [ethUSDPrice, dxdUSDPriceBackedByNAV]);

  useEffect(() => {
    const nexNAVUSD = totalNavPercentage * initialNavUSD;
    setNavUSD(nexNAVUSD);
    setDXDUSDPriceBackedByNAV(
      nexNAVUSD / parseFloat(circulatingDXDSupply.toFixed())
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNavUSD, circulatingDXDSupply]);

  return (
    <CardInnerWrapperLayout>
      <CardTitle>DXD Value</CardTitle>
      <AnimatePresence mode="wait">
        {isLoadingPrices === true ? (
          <MotionOpacityLoader key="dxd-price-calc-loader" />
        ) : (
          <MotionOpacity key="dxd-price-calc">
            <CardInnerWrapperLayout>
              <div>
                <label>NAV Allocation</label>
                <Select<PercentageOption, false>
                  isMulti={false}
                  isClearable={false}
                  styles={getStyles({
                    fontSize: 12,
                  })}
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  options={navPercentageOptions}
                  value={
                    navPercentageOptions.find(
                      (option) => option.value === totalNavPercentage
                    ) || navPercentageOptions[0]
                  }
                  onChange={(option) => {
                    const nextTotalNavPercentage = option?.value as number;
                    setTotalNavPercentage(nextTotalNavPercentage);
                    setNavUSD(nextTotalNavPercentage * initialNavUSD);
                    setDXDUSDPriceBackedByNAV(
                      (nextTotalNavPercentage * initialNavUSD) /
                        parseFloat(circulatingDXDSupply.toFixed())
                    );
                  }}
                />
              </div>
              <div>
                <strong>NAV at {totalNavPercentage * 100}% </strong>
              </div>
              <div>
                <span>${currencyFormatter.format(navUSD)}</span> /{" "}
                <span>{currencyFormatter.format(navWETHPrice)} ETH</span>
              </div>
              <div>
                <strong>
                  DXD price backed by {totalNavPercentage * 100}% NAV allocation
                </strong>
              </div>
              <div>
                <span>${currencyFormatter.format(dxdUSDPriceBackedByNAV)}</span>{" "}
                / <span>{currencyFormatter.format(dxdWETHPrice)} ETH</span>
              </div>
            </CardInnerWrapperLayout>
          </MotionOpacity>
        )}
      </AnimatePresence>
    </CardInnerWrapperLayout>
  );
}
