import type { Provider } from "@ethersproject/abstract-provider";
import type { Signer } from "@ethersproject/abstract-signer";
import { DXDRedemptor } from "../generated/contracts";
export declare enum ChainId {
    Ethereum = 1,
    Gnosis = 100
}
export declare function getProvider(chainId?: ChainId): Provider;
export declare function getProviderList(): Record<string, Provider>;
export declare function getDXDRedemptorContract(address: string, signerOrProvider: Signer | Provider): DXDRedemptor;
