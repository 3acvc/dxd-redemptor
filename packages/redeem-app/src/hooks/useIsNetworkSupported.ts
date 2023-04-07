import { useNetwork } from "wagmi";

export function useIsNetworkSupported() {
    const { chain } = useNetwork();
    const isNetworkSupported =
        chain && chain.unsupported === false ? true : false;
    return {
        isNetworkSupported,
    };
}
