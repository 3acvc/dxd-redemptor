import type { Provider } from "@ethersproject/abstract-provider";
import type { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Redemptor, Redemptor__factory } from "../generated/contracts";

/**
 * ChainId enum
 */
export enum ChainId {
    Ethereum = 1,
    Gnosis = 100,
}

/**
 * Gets a provider
 * @param chainId
 * @returns
 */
export function getProvider(chainId: ChainId = ChainId.Ethereum): Provider {
    if (chainId === ChainId.Gnosis) {
        if (!process.env.JSON_RPC_PROVIDER_GNOSIS) {
            throw new Error("JSON_RPC_PROVIDER_GNOSIS is not defined");
        }

        return new JsonRpcProvider(process.env.JSON_RPC_PROVIDER_GNOSIS);
    }

    if (!process.env.JSON_RPC_PROVIDER_ETHEREUM) {
        throw new Error("JSON_RPC_PROVIDER_ETHEREUM is not defined");
    }

    return new JsonRpcProvider(process.env.JSON_RPC_PROVIDER_ETHEREUM);
}

/**
 * Returns Provider list
 * @returns
 */
export function getProviderList(): Record<string, Provider> {
    // lock the block number
    return {
        [ChainId.Ethereum]: getProvider(ChainId.Ethereum),
        [ChainId.Gnosis]: getProvider(ChainId.Gnosis),
    };
}

/**
 * Gets the DXDRedemptor contract
 * @param address The address of the contract
 * @param signerOrProvider The signer or provider
 */
export function getDXDRedemptorContract(
    address: string,
    signerOrProvider: Signer | Provider
): Redemptor {
    return Redemptor__factory.connect(address, signerOrProvider);
}
