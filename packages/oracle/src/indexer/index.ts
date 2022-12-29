import { Filter } from "@ethersproject/abstract-provider";
import { WebSocketProvider } from "@ethersproject/providers";
import { ChainId, ERC20_TRANSFER_SIGHASH } from "../constants";
import { initializeDXDCirculatingSupplySnapshot } from "./db/dxd-circulating-supply-snapshot";
import { initializeTreasuryBalancesSnapshot } from "./db/treasury-balances-snapshot";
import { LOG_HANDLERS } from "./log-handlers";

export const startIndexing = async (
    providerList: Record<ChainId, WebSocketProvider>
) => {
    const blocks: Record<ChainId, number> = {
        [ChainId.ETHEREUM]: 0,
        [ChainId.GNOSIS]: 0,
    };
    for (const [rawChainId, provider] of Object.entries(providerList)) {
        blocks[parseInt(rawChainId) as ChainId] =
            await provider.getBlockNumber();
    }

    // fetch and save initial dxd supply and treasury snapshots
    await Promise.all([
        initializeDXDCirculatingSupplySnapshot(blocks, providerList),
        initializeTreasuryBalancesSnapshot(blocks, providerList),
    ]);

    // listen for updates
    for (const [rawChainId, provider] of Object.entries(providerList)) {
        const chainId = parseInt(rawChainId) as ChainId;
        const handle = LOG_HANDLERS[chainId];
        provider.on(
            {
                topics: [ERC20_TRANSFER_SIGHASH],
                fromBlock: blocks[chainId],
            } as Filter,
            (log) => {
                handle(providerList, log);
            }
        );
    }
};
