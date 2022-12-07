/**
 * A single oracle signer.
 * The oracle verifies that aggregated data is correct and signs it.
 * The oracle recomputes the aggregated data and signs it.
 */
import { getAddress } from "@ethersproject/address";
import { Contract } from "@ethersproject/contracts";
import { NATIVE_ASSET_ADDRESS, TokenAsset } from "./dxdao";
import { ChainId, getProvider } from "./lib/web3";
import { ERC20_ABI } from "./abis/erc20";

/**
 * A map of token to Chainlink oracle aggregator
 */
export const tokenToChainlinkOraclAggregator: Record<string, string> = {
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": "eth-usd.data.eth", // ETH/USD
    "0xae7ab96520de3a18e5e111b5eaab095312d7fe84": "seth-usd.data.eth", // sETH/USD
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "usdc-usd.data.eth", // USDC/USD
    "0x6b175474e89094c44da98b954eedeac495271d0f": "dai-usd.data.eth", // DAI/USD
    "0xdAC17F958D2ee523a2206206994597C13D831ec7": "usdt-usd.data.eth", // USDT/USD
    "0xFe2e637202056d30016725477c5da089Ab0A043A": "usdt-usd.data.eth", // USDT/USD
};

export type TokenAssetWithBalance = TokenAsset & { balance: string };

/**
 * Returns the balances of all tokens in the DXdao treasury on Ethereum and Gnosis Chain, as well as the DXD token contract.
 * @returns
 */
export async function getDXdaoTreasuryAssetsBalances(): Promise<TokenAsset[]> {
    return [];
}

export async function getTokenWithBalanceList(
    chainId: ChainId,
    tokenList: TokenAsset[],
    ownerAddress: string,
    blockNumber?: number
): Promise<TokenAssetWithBalance[]> {
    const tokenWithBalanceList = await Promise.all(
        tokenList.map(async (token) => {
            const provider = getProvider(chainId);

            let balance = "0";

            // Native balance
            if (getAddress(token.address) === NATIVE_ASSET_ADDRESS) {
                balance = (
                    await provider.getBalance(ownerAddress, blockNumber)
                ).toString();
            } else {
                // ERC20 token balance
                const tokenContract = new Contract(
                    token.address,
                    ERC20_ABI,
                    provider
                );
                balance = (
                    await tokenContract.balanceOf(ownerAddress, {
                        blockTag: blockNumber,
                    })
                ).toString();
            }

            return {
                ...token,
                balance,
            };
        })
    );

    return tokenWithBalanceList;
}
