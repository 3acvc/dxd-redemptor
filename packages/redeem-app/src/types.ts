export interface IQuoteResponse {
    quote: {
        redeemedDXD: string;
        circulatingDXDSupply: string;
        redeemedToken: string;
        redeemedTokenUSDPrice: string;
        redeemedAmount: string;
        collateralUSDValue: string;
    };
    signatures: string[];
}
