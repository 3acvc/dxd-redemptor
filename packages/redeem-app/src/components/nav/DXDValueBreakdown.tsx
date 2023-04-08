import { getStyles } from "components/form/Select";
import { AnimatePresence } from "framer-motion";
import { Amount, Token } from "dxd-redemptor-oracle";
import { useEffect, useState } from "react";
import Select from "react-select";
import { CardTitle } from "ui/components/Card";
import {
  CardInnerWrapperLayout,
  MotionOpacity,
  MotionOpacityLoader,
} from "./styled";
import { currencyFormatter } from "./utils";

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
}: {
  navUSD: number;
  circulatingDXDSupply: Amount<Token>;
  isLoadingPrices: boolean;
}) {
  const [navUSD, setNavUSD] = useState(initialNavUSD);
  const [totalNavPercentage, setTotalNavPercentage] = useState(1);
  const [dxdUSDPriceBackedByNAV, setDXDUSDPriceBackedByNAV] = useState(0);

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
              <small>
                <strong>NAV at {totalNavPercentage * 100}% </strong>
              </small>
              <small>
                <span>${currencyFormatter.format(navUSD)}</span>
              </small>
              <small>
                <strong>
                  DXD price backed by {totalNavPercentage * 100}% NAV allocation
                </strong>
              </small>
              <small>
                <span>${currencyFormatter.format(dxdUSDPriceBackedByNAV)}</span>
              </small>
            </CardInnerWrapperLayout>
          </MotionOpacity>
        )}
      </AnimatePresence>
    </CardInnerWrapperLayout>
  );
}
