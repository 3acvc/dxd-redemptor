import { BigNumber } from "@ethersproject/bignumber";
import { GraphQLClient, gql } from "graphql-request";
import { DXD, NAV_TOKEN_LIST, Token } from "../../entities/token";
import { Amount, Currency } from "../../entities";
import { ChainId, NATIVE_TOKEN_ADDRESS } from "../../constants";
import { enforce } from "../invariant";

import { NAV_ASSETS } from "../../nav";

export interface TreasuryBalancesSnapshotsTokenBalance {
    address: string;
    amount: string;
    token: {
        address: string;
        symbol: string;
        decimals: number;
    };
}

export interface NAVSnapshotResponse {
    treasuryBalancesSnapshots: {
        blockNumber: string;
        balances: TreasuryBalancesSnapshotsTokenBalance[];
    }[];
    dxdcirculatingSupplySnapshots: {
        id: string;
        totalSupply: string;
        circulatingSupply: string;
    }[];
}

function buildSubgraphQuery(block: number): string {
    return gql`
    query {
      dxdcirculatingSupplySnapshots(
        block: { number: ${block} }
        orderBy: id
        orderDirection: desc
        first: 1
      ) {
        id
        totalSupply
        circulatingSupply
      }
      treasuryBalancesSnapshots(
        block: { number: ${block} }
        orderBy: blockNumber
        orderDirection: desc
        first: 1
      ) {
        blockNumber
        balances {
        address
        amount
        token {
            address: id
            symbol
            decimals
          }
        }
      }
    }
    `;
}

const addChainIdToToken = (
    balances: TreasuryBalancesSnapshotsTokenBalance[],
    chainId: ChainId
) =>
    balances.map((balance) => ({
        ...balance,
        token: {
            ...balance.token,
            chainId,
        },
    }));

function findToken(tokenAddress: string, chainId: ChainId) {
    tokenAddress = tokenAddress.toLowerCase();

    // Handle native tokens
    if (tokenAddress === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
        return Token.getNative(chainId);
    }

    return NAV_TOKEN_LIST.find(
        (token) =>
            token.address.toLowerCase() === tokenAddress &&
            token.chainId === chainId
    );
}

/**
 * Get token balances snapshot at block from subgraph
 * @param block - block number for each chain
 * @param subgraphEndpointList - subgraph endpoint for each chain
 * @returns
 */
export async function getTokenBalancesSnapshotAtBlock(
    block: { [key in ChainId]: number },
    subgraphEndpointList: Record<ChainId, string>
): Promise<{
    dxdTotalSupply: Amount<Token>;
    circulatingDXDSupply: Amount<Token>;
    tokenBalances: Amount<Token | Currency>[];
    rawTokenBalances: TreasuryBalancesSnapshotsTokenBalance[];
    tokenList: Currency[];
}> {
    const responseList = {} as Record<ChainId, NAVSnapshotResponse>;
    const tokenList = {} as Record<string, Currency>;

    for (const [rawChainId, subgraphEndpoint] of Object.entries(
        subgraphEndpointList
    )) {
        const chainId = rawChainId as unknown as ChainId;
        const blockTag = block[chainId];
        enforce(!!blockTag, `no block tag specified for chain id ${chainId}`);
        const graphqlClient = new GraphQLClient(subgraphEndpoint);
        responseList[chainId] =
            await graphqlClient.request<NAVSnapshotResponse>(
                buildSubgraphQuery(blockTag)
            );
    }

    // Total supply is from Ethereum chain
    const dxdTotalSupply = Amount.fromRawAmount(
        DXD[ChainId.ETHEREUM],
        responseList[ChainId.ETHEREUM].dxdcirculatingSupplySnapshots[0]
            .totalSupply
    );

    // Circulating supply is from Ethereum chain + Gnosis chain
    const circulatingDXDSupply = Amount.fromRawAmount(
        DXD[ChainId.ETHEREUM],
        BigNumber.from(
            responseList[ChainId.ETHEREUM].dxdcirculatingSupplySnapshots[0]
                .circulatingSupply
        ).add(
            responseList[ChainId.GNOSIS].dxdcirculatingSupplySnapshots[0]
                .circulatingSupply
        )
    );

    // Treasury balances are from Ethereum chain
    const rawTokenBalances = [
        ...addChainIdToToken(
            responseList[ChainId.ETHEREUM].treasuryBalancesSnapshots[0]
                .balances,
            ChainId.ETHEREUM
        ),
        ...addChainIdToToken(
            responseList[ChainId.GNOSIS].treasuryBalancesSnapshots[0].balances,
            ChainId.GNOSIS
        ),
    ];

    // Aggregate token balances from all NAV addresses
    const tokenBalances = rawTokenBalances.reduce((acc, balance) => {
        const token = findToken(balance.token.address, balance.token.chainId);
        if (!token) return acc;

        const tokenId = `${
            balance.token.chainId
        }-${token.address.toLowerCase()}`;

        // Add token to token list
        if (!tokenList[tokenId]) {
            tokenList[tokenId] = token;
        }

        let amount = BigNumber.from(balance.amount);

        if (acc[tokenId]) {
            amount = amount.add(acc[tokenId].toRawAmount());
        }

        acc[tokenId] = Amount.fromRawAmount(token, amount);

        return acc;
    }, {} as Record<string, Amount<Token | Currency>>);

    // Append NAV assets from custom list
    NAV_ASSETS.forEach((amount) => {
        const tokenId = `${
            amount.currency.chainId
        }-${amount.currency.address.toLowerCase()}`;

        if (tokenBalances[tokenId]) {
            tokenBalances[tokenId] = new Amount(
                amount.currency,
                tokenBalances[tokenId].add(amount)
            );
        } else {
            tokenBalances[tokenId] = amount;
        }
    });

    return {
        dxdTotalSupply,
        circulatingDXDSupply,
        tokenBalances: Object.values(tokenBalances),
        rawTokenBalances,
        tokenList: Object.values(tokenList),
    };
}
