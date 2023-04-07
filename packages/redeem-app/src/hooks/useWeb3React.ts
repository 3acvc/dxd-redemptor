import { useAccount, useNetwork, useProvider, useSigner } from "wagmi";
import { useIsNetworkSupported } from './useIsNetworkSupported';

/**
 * An alias for wagmi hooks, until the migration is complete
 */
export function useWeb3React() {

  const { isNetworkSupported } = useIsNetworkSupported();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const { address: account } = useAccount();

  return {
    chainId: chain?.id,
    isNetworkSupported,
    account,
    provider,
    signer
  }
}