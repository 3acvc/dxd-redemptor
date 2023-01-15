import { BigNumber } from "@ethersproject/bignumber";
import { GraphQLClient, gql } from "graphql-request";
import { DXD, NAV_TOKEN_LIST, Token } from "../../entities/token";
import { Amount } from "../../entities";
import { ChainId } from "../../constants";
import { enforce } from "../invariant";

export interface TreasuryBalancesSnapshotsTokenBalance {
    address: string;
    amount: string;
    token: {
        adress: string;
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
            adress: id
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

const findToken = (tokenAddress: string, chainId: ChainId) =>
    NAV_TOKEN_LIST.find(
        (token) =>
            token.address.toLowerCase() === tokenAddress.toLowerCase() &&
            token.chainId === chainId
    );

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
    tokenBalances: Amount<Token>[];
}> {
    const responseList = {} as Record<ChainId, NAVSnapshotResponse>;

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
    const treasuryBalances = [
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
    const tokenBalances = treasuryBalances.reduce((acc, balance) => {
        const token = findToken(balance.token.adress, balance.token.chainId);
        if (!token) return acc;

        const tokenId = `${token.chainId}-${token.address.toLowerCase()}`;
        let amount = BigNumber.from(balance.amount);

        if (tokenBalances[tokenId]) {
            console.log({
                tokenId,
                amount: tokenBalances[tokenId].toRawAmount(),
            });

            amount = amount.add(tokenBalances[tokenId].toRawAmount());
        }

        acc[tokenId] = Amount.fromRawAmount(token, amount);

        return acc;
    }, {} as Record<string, Amount<Token>>);

    return {
        dxdTotalSupply,
        circulatingDXDSupply,
        tokenBalances: Object.values(tokenBalances),
    };
}
