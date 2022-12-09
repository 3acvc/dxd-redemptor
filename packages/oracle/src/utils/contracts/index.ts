import { Provider } from "@ethersproject/abstract-provider";
import { Contract } from "ethers";
import { ChainId, MULTICALL_ADDRESS } from "../../constants";
import { MULTICALL_ABI } from "../../abis/multicall";

/**
 * Get the Multicall contract for a given chain id
 * @param providerList - A list of providers for each chain id
 * @returns
 */
export function getMulticallContract(
    providerList: Record<ChainId, Provider>
): Record<ChainId, Contract> {
    return {
        [ChainId.ETHEREUM]: new Contract(
            MULTICALL_ADDRESS,
            MULTICALL_ABI,
            providerList[ChainId.ETHEREUM]
        ),
        [ChainId.GNOSIS]: new Contract(
            MULTICALL_ADDRESS,
            MULTICALL_ABI,
            providerList[ChainId.GNOSIS]
        ),
    };
}
