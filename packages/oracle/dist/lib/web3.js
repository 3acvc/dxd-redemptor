import { JsonRpcProvider } from "@ethersproject/providers";
import { DXDRedemptor__factory } from "../generated/contracts";
export var ChainId;
(function (ChainId) {
    ChainId[ChainId["Ethereum"] = 1] = "Ethereum";
    ChainId[ChainId["Gnosis"] = 100] = "Gnosis";
})(ChainId || (ChainId = {}));
export function getProvider(chainId = ChainId.Ethereum) {
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
export function getProviderList() {
    return {
        [ChainId.Ethereum]: getProvider(ChainId.Ethereum),
        [ChainId.Gnosis]: getProvider(ChainId.Gnosis),
    };
}
export function getDXDRedemptorContract(address, signerOrProvider) {
    return DXDRedemptor__factory.connect(address, signerOrProvider);
}
