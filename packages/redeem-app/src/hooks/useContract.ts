import { useContract } from "wagmi";
import { useWeb3React } from "./useWeb3React";
import { ERC20_ABI } from "abis/erc20";

/**
 * Returns a contract instance of the ERC20 token with the given address
 * @param tokenAddress Address of the ERC20 token
 * @param withSignerIfPossible Whether to return a contract with a signer if possible. Defaults to true
 * @returns
 */
export function useTokenContract(
  tokenAddress?: string,
  withSignerIfPossible = true
) {
  const { signer, provider } = useWeb3React();

  return useContract({
    abi: ERC20_ABI,
    address: tokenAddress,
    signerOrProvider: withSignerIfPossible ? signer : provider,
  });
}
