import type { Provider } from "@ethersproject/abstract-provider";
import type { ChainId } from "./constants";

export interface Quote {
    redeemedDXD: string;
    circulatingDXDSupply: string;
    redeemedToken: string;
    redeemedTokenUSDPrice: string;
    redeemedAmount: string;
    collateralUSDValue: string;
    deadline: string;
}

export interface GetQuoteParams {
    block: Record<ChainId, number>;
    redeemedTokenAddress: string;
    redeemedDxdWeiAmount: string;
    providerList: Record<ChainId, Provider>;
    subgraphEndpointList: Record<ChainId, string>;
    deadline?: number;
}
