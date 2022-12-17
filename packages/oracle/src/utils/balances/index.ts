import { Provider } from "@ethersproject/abstract-provider";
import { ChainId, ERC20_INTERFACE } from "../../constants";

import { Amount } from "../../entities/amount";
import { Currency } from "../../entities/currency";
import { Token } from "../../entities/token";
import { getMulticallContract } from "../contracts";
import { enforce } from "../invariant";

export interface BalanceRequest {
    token: Token;
    owner: string;
}

interface IndexedRequest {
    request: [string, string];
    index: number;
}

export const getTokenBalancesAtBlock = async (
    requests: BalanceRequest[],
    block: { [key in ChainId]: number },
    providerList: Record<ChainId, Provider>
): Promise<Amount<Token>[]> => {
    // Multicall contract
    const multicallContract = getMulticallContract(providerList);
    // group requests by chains
    const requestsByChain = requests.reduce(
        (
            accumulator: Record<ChainId, IndexedRequest[]>,
            { token, owner },
            i
        ) => {
            accumulator[token.chainId].push({
                index: i,
                request: [
                    token.address,
                    ERC20_INTERFACE.encodeFunctionData("balanceOf", [owner]),
                ],
            });
            return accumulator;
        },
        { [ChainId.ETHEREUM]: [], [ChainId.GNOSIS]: [] }
    );

    const results = new Array<Amount<Token>>(requests.length);
    for (const [rawChainId, requestsInChain] of Object.entries(
        requestsByChain
    )) {
        const chainId = rawChainId as unknown as ChainId;
        const blockTag = block[chainId];
        enforce(!!blockTag, `no block tag specified for chain id ${chainId}`);
        const [, resultsInChain] = await multicallContract[
            chainId
        ].callStatic.aggregate(
            requestsInChain.map((request) => request.request),
            { blockTag }
        );
        for (let i = 0; i < resultsInChain.length; i++) {
            const resultInChain = resultsInChain[i];
            const originalRequest = requestsInChain[i];
            results[originalRequest.index] = Amount.fromRawAmount(
                requests[originalRequest.index].token,
                ERC20_INTERFACE.decodeFunctionResult(
                    "balanceOf",
                    resultInChain
                )[0]
            );
        }
    }
    return results;
};

/**
 * Get native currency balances at a block
 * @param owner - owner of the native currency
 * @param block - block number for each chain
 * @param providerList - a list of providers for each chain
 * @returns
 */
export const getNativeCurrencyBalancesAtBlock = async (
    owner: Record<ChainId, string>,
    block: { [key in ChainId]: number },
    providerList: Record<ChainId, Provider>
): Promise<Amount<Currency>[]> => {
    const results: Amount<Currency>[] = [];
    for (const [rawChainId, provider] of Object.entries(providerList)) {
        const chainId = rawChainId as unknown as ChainId;
        const blockTag = block[chainId];
        enforce(!!blockTag, `no block tag specified for chain id ${chainId}`);
        const resultInChain = await provider.getBalance(
            owner[chainId],
            blockTag
        );
        const nativeCurrency = Currency.getNative(chainId);
        enforce(!!nativeCurrency, `no native currency for chain id ${chainId}`);
        results.push(Amount.fromRawAmount(nativeCurrency, resultInChain));
    }
    return results;
};
