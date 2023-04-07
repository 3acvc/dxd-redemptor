import { Amount, Currency } from "dxd-redemptor-oracle";
import { useTokenContract } from "hooks/useContract";
import { useEffect, useState } from "react";
import { useProvider } from "wagmi";

/**
 * A hacky implementation of useCurrencyBalance from @uniswap/interface
 * @param userAddress
 * @param token
 * @returns
 */
export function useCurrencyBalance(
  userAddress: string | undefined,
  token: Currency | undefined
) {
  const tokenContract = useTokenContract(token?.address, false);
  const provider = useProvider();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<Amount<Currency> | undefined>();
  const [error, setError] = useState<Error | null>();

  useEffect(() => {
    if (!userAddress || !token || !provider || !tokenContract) {
      return;
    }

    try {
      const getBalancePromise =
        token.symbol !== "ETH"
          ? tokenContract.callStatic.balanceOf(userAddress as any)
          : provider.getBalance(userAddress);

      getBalancePromise
        .then((balance) => {
          setBalance(Amount.fromRawAmount(token, balance));
        })
        .catch((error) => {
          console.log("Error getting the balance", error);
          setError(error);
          setBalance(undefined);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error("Error getting the balance", error);
    }
  }, [userAddress, token, provider, tokenContract]);

  return {
    loading,
    balance,
    error,
  };
}
