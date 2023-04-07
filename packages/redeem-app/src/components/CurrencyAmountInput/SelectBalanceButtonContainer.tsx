import { Amount, Currency } from "dxd-redemptor-oracle";
import { utils } from "ethers";
import { TextButton } from "ui/components/Button";
import { useCurrencyBalance } from "tokens/hooks";

const { formatUnits } = utils;

const numberFormatter = new Intl.NumberFormat();

export function SelectBalanceButtonContainer({
  userAddress,
  currency,
  onBalanceSelect,
}: {
  currency: Currency;
  userAddress: string;
  onBalanceSelect: (balance: Amount<Currency>) => void;
}) {
  const { balance, loading, error } = useCurrencyBalance(userAddress, currency);

  if (loading && !balance) {
    return (
      <TextButton type="button" disabled alignRight>
        Loading ...
      </TextButton>
    );
  }

  if (error || !balance) {
    return null;
  }

  return (
    <TextButton
      type="button"
      alignRight
      onClick={() => onBalanceSelect(balance)}
    >
      Balance:{" "}
      {numberFormatter.format(
        parseFloat(formatUnits(balance.toRawAmount(), currency.decimals))
      )}
    </TextButton>
  );
}
