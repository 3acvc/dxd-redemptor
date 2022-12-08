import { ChainId, ERC20_INTERFACE, MULTICALL, PROVIDER } from "../../constants";
import { Amount } from "../../entities/amount";
import { Currency } from "../../entities/currency";
import { Token } from "../../entities/token";
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
    block: { [key in ChainId]: number }
): Promise<Amount<Token>[]> => {
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
        const [, resultsInChain] = await MULTICALL[
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

export const getNativeCurrencyBalancesAtBlock = async (
    owner: Record<ChainId, string>,
    block: { [key in ChainId]: number }
): Promise<Amount<Currency>[]> => {
    const results: Amount<Currency>[] = [];
    for (const [rawChainId, provider] of Object.entries(PROVIDER)) {
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
