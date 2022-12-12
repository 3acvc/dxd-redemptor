import { utils } from "ethers";
import styled from "styled-components";
import { IQuoteResponse } from "../types";
import { USDC, DAI, ETH, WETH } from "../utils/tokens";

interface QuoteResponseProps {
    quoteResponse: IQuoteResponse;
}

const Box = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
`;

export function QuoteResponse({ quoteResponse }: QuoteResponseProps) {
    const tokenSymol = [USDC, DAI, ETH, WETH].find(
        (token) =>
            token.address.toLowerCase() ===
            quoteResponse.quote.redeemedToken.toLowerCase()
    )?.symbol;

    return (
        <Box>
            <h4>Quote</h4>
            <p>
                <strong>Redeem Amount:</strong>
                <br />
                <span>
                    {utils.formatUnits(
                        quoteResponse.quote.redeemedAmount,
                        utils.getAddress(quoteResponse.quote.redeemedToken) ===
                            utils.getAddress(USDC.address)
                            ? 6
                            : 18
                    )}{" "}
                    {tokenSymol}
                </span>
            </p>
            <p>
                <strong>NAV USDC value:</strong>
                <br />
                <span>
                    ${utils.formatUnits(quoteResponse.quote.collateralUSDValue)}
                </span>
            </p>
            <p>
                <strong> Redeemed Token ({tokenSymol}) USD Price:</strong>
                <br />
                <span>
                    $
                    {utils.formatUnits(
                        quoteResponse.quote.redeemedTokenUSDPrice
                    )}
                </span>
            </p>
            <p>
                <strong> DXD Circulating Supply</strong>
                <br />
                <span>
                    {utils.formatUnits(
                        quoteResponse.quote.circulatingDXDSupply
                    )}
                </span>
            </p>
        </Box>
    );
}
