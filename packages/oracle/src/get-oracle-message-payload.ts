import { parseEther, formatEther } from "@ethersproject/units";
import {
    dxdaoTreasuryAddressList,
    getDXDCirculatingSupply,
    navTokenList,
} from "./dxdao";
import { ChainId } from "./lib/web3";

import {
    getTokenWithBalanceList,
    TokenAssetWithBalance,
} from "./token-balances";
import { getTokenUSDPrice, getTokenUSDValue } from "./usd-value";

export interface OracleMessageStruct {
    redeemedDXD: string;
    circulatingDXDSupply: string;
    redeemedToken: string;
    redeemedTokenUSDPrice: string;
    redeemedAmount: string;
    collateralUSDValue: string;
}

type OracleMessageStructUserInput = Pick<
    OracleMessageStruct,
    "redeemedToken" | "redeemedDXD"
>;

// Format the number to currency
const currencyFormat = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});
// Format the number to decimal
const numberFormat = Intl.NumberFormat("en-US", {
    style: "decimal",
});

/**
 * Gets the oracle message for the DXDRedemptor contract at specified block number.
 * @param blockNumber
 */
export async function getOracleMessagePayload(
    blockNumber: Record<string, number>,
    userInput: OracleMessageStructUserInput
): Promise<OracleMessageStruct> {
    const circulatingDXDSupply = await getDXDCirculatingSupply(blockNumber);

    // lock the block number
    const results: OracleMessageStruct = {
        // Use the user input for the redeemed DXD and token
        redeemedDXD: userInput.redeemedDXD,
        redeemedToken: userInput.redeemedToken,
        // Computed values
        circulatingDXDSupply: circulatingDXDSupply.toString(),
        redeemedTokenUSDPrice: "0",
        collateralUSDValue: "0",
        redeemedAmount: "0",
    };

    // Fetch the treausry token balances for each chain
    const tokenBalanceList: Record<ChainId, TokenAssetWithBalance[]> = {
        [ChainId.Ethereum]: await getTokenWithBalanceList(
            ChainId.Ethereum,
            navTokenList[ChainId.Ethereum],
            dxdaoTreasuryAddressList[ChainId.Ethereum],
            blockNumber[ChainId.Ethereum]
        ),
        [ChainId.Gnosis]: await getTokenWithBalanceList(
            ChainId.Gnosis,
            navTokenList[ChainId.Gnosis],
            dxdaoTreasuryAddressList[ChainId.Gnosis],
            blockNumber[ChainId.Gnosis]
        ),
    };

    // For each Ethereum token, get the USDC value from Uniswap v3
    // Each token, has certain rules to get the USDC value
    const tokenBalanceWithUSDValueListEthereum = await Promise.all(
        tokenBalanceList[ChainId.Ethereum].map((token) =>
            getTokenUSDValue(
                token,
                blockNumber[ChainId.Ethereum],
                ChainId.Ethereum
            )
        )
    );

    const tokenBalanceWithUSDValueListGnosis = await Promise.all(
        tokenBalanceList[ChainId.Gnosis].map(async (token) =>
            getTokenUSDValue(
                token,
                blockNumber[ChainId.Ethereum],
                ChainId.Gnosis
            )
        )
    );

    // Total usd value of NAV tokens
    const totalNAVTokensUSDValue = [
        ...tokenBalanceWithUSDValueListEthereum,
        ...tokenBalanceWithUSDValueListGnosis,
    ].reduce((acc, token) => {
        if (token.usdValue) {
            return acc + parseFloat(token.usdValue);
        }
        return acc;
    }, 0);

    // Calculate the price of DXD according to the NAV tokens
    const dxdTokenPriceUSDBN = parseEther(
        totalNAVTokensUSDValue.toFixed(2)
    ).div(circulatingDXDSupply);

    const userDXDAmount = parseFloat(
        formatEther(await userInput.redeemedToken.toString())
    );

    // Calculate the price of DXD according to the NAV tokens
    const dxdTokenPriceUSDFloat = dxdTokenPriceUSDBN.toNumber();
    // // Calculate the collateral (DXD amount) value in USD of the user
    const userDXDAmountUSDValueFloat = dxdTokenPriceUSDFloat * userDXDAmount;

    // Apend the results
    results.collateralUSDValue = parseEther(
        userDXDAmountUSDValueFloat.toString()
    ).toString();

    // Get the USDC price of the redeemed token
    const redeemedTokenUSDPriceFloat = await getTokenUSDPrice(
        await userInput.redeemedToken,
        blockNumber[ChainId.Ethereum]
    );

    // The amount of x token that the user will receive based on the USD value of their DXD amount
    let redeemedAmountFloat = 0;

    if (redeemedTokenUSDPriceFloat) {
        results.redeemedTokenUSDPrice = redeemedTokenUSDPriceFloat?.toString();
        // Calculate the redeemed amount in terms of the user's DXD value
        redeemedAmountFloat =
            userDXDAmountUSDValueFloat / redeemedTokenUSDPriceFloat;

        results.redeemedAmount = parseEther(
            redeemedAmountFloat.toString()
        ).toString();
    }

    console.log({
        dxdTokenPriceUSDFloat: currencyFormat.format(dxdTokenPriceUSDFloat),
        totalNAVTokensUSDValue: currencyFormat.format(totalNAVTokensUSDValue),
        dxdTokenPriceUSD: currencyFormat.format(dxdTokenPriceUSDFloat),
        dxdCirculatingSupply: numberFormat.format(
            parseFloat(formatEther(circulatingDXDSupply))
        ),
        redeemedTokenUSDPrice: currencyFormat.format(
            redeemedTokenUSDPriceFloat ?? 0
        ),
        redeemedAmount: currencyFormat.format(redeemedAmountFloat),
    });

    return results;
}
