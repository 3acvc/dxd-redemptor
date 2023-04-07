import { Amount, Currency } from "dxd-redemptor-oracle";
import { useCallback, useEffect, useState } from "react";
import { SelectBalanceButtonContainer } from "./SelectBalanceButtonContainer";
import { useNetwork } from "wagmi";

import { CurrencyAmountInputInnerWrapper, TokenButton } from "./styled";
import { InputGroup as _InputGroup, NumberInput } from "../form";
import styled from "styled-components";

interface CurrencyAmountInputProps {
  id?: string;
  value?: Amount<Currency>;
  onChange: (tokenAmount: Amount<Currency>) => void;
  /**
   * User's address. If provided, the user's balance will be shown.
   */
  userAddress?: string;
  /**
   * Chain ID. If provided, the user's balance will be shown.
   */
  chainId?: number;
  showNativeCurrency?: boolean;
  disabled?: boolean;
  /**
   * Disable the input field but keep the token selector
   */
  disableInput?: boolean;
  /**
   * Disable the token selector. This can be useful if you want to force the user to use a specific token (e.g. USDC)
   */
  disableTokenSelector?: boolean;
}

export function CurrencyAmountInput({
  value,
  onChange,
  userAddress,
  showNativeCurrency,
  disabled,
  disableInput,
  disableTokenSelector,
}: CurrencyAmountInputProps) {
  const { chain } = useNetwork();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const handleDismissSearch = useCallback(() => {
    setIsSearchModalOpen(false);
  }, [setIsSearchModalOpen]);
  // Track the number value as a string
  const [numberValue, setNumberValue] = useState<string>(
    value?.toString() || "0"
  );
  // // Start with USDC
  // const [currencyAmount, setCurrencyAmount] = useState<Amount<Currency>>(
  //   value || new Amount(USDC[1], '0') // Start with USDC if no value is provided
  // );
  // Close the search modal if the chain changes
  useEffect(() => {
    setIsSearchModalOpen(false);
  }, [chain]);

  // useEffect(() => {
  //   const nextInputValue = value?.toFixed(4) || '0';
  //   if (nextInputValue !== numberValue) {
  //     setNumberValue(nextInputValue);
  //   }
  // }, [value, numberValue]);

  return (
    <CurrencyAmountInputInnerWrapper>
      <InputGroup>
        <TokenButton
          disabled={disabled || disableTokenSelector}
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
        >
          {value?.currency?.symbol}
        </TokenButton>
        <NumberInput
          disabled={disabled || disableInput}
          value={numberValue}
          onUserInput={(nextSellAmount) => {
            setNumberValue(nextSellAmount);
            try {
              const nextCurrencyAmount = new Amount(
                value?.currency as Currency,
                nextSellAmount
              );
              // setCurrencyAmount(nextCurrencyAmount);
              onChange(nextCurrencyAmount);
            } catch (e) {}
          }}
        />
      </InputGroup>
      {userAddress && !disabled && value ? (
        <SelectBalanceButtonContainer
          currency={value?.currency}
          userAddress={userAddress}
          onBalanceSelect={(userBalance) => {
            if (disabled) return;
            const nextCurrencyAmount = userBalance;
            setNumberValue(nextCurrencyAmount.toString());
            // setCurrencyAmount(nextCurrencyAmount);
            onChange(nextCurrencyAmount);
          }}
        />
      ) : null}
    </CurrencyAmountInputInnerWrapper>
  );
}

const InputGroup = styled(_InputGroup)`
  margin-bottom: 8px;
`;
