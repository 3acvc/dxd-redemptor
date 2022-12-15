import { EventEmitter } from "events";
import { Provider } from "@ethersproject/abstract-provider";
import { ChainId, DXDAO_AVATAR, DXSWAP_RELAYER } from "../constants";
import { DXD } from "../entities";
import {
    getNativeCurrencyBalanceAtBlockForProvider,
    getTokenBalancesAtBlockForProvider,
} from "../utils/balances";
import { getUSDValue } from "../utils/pricing";
import { getNavTokenList } from "./navTokenList";
import { NAVSnapshotModel } from "./models/NAVSnapshot.model";

interface IndexerServiceParams {
    provider: Provider;
    snapshotModel: typeof NAVSnapshotModel;
    blockIndexDelay?: number;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class IndexerService {
    private provider: Provider;
    private snapshotModel: typeof NAVSnapshotModel;
    private eventQueue: EventEmitter;
    private blockIndexDelay = 100000;

    blockQueue: {
        blockNumber: number;
        retries: number;
    }[] = [];
    private _isProcessing = false;

    constructor({
        provider,
        snapshotModel,
        blockIndexDelay,
    }: IndexerServiceParams) {
        this.provider = provider;
        this.snapshotModel = snapshotModel;
        this.eventQueue = new EventEmitter();
        if (blockIndexDelay) {
            this.blockIndexDelay = blockIndexDelay;
        }
    }

    private async onBlockHandler(blockNumber: number) {
        try {
            await saveSnapshot({
                blockNumber,
                provider: this.provider,
                snapshotModel: this.snapshotModel,
            });
        } catch (error) {
            console.log(`Error processing block (${blockNumber})`, error);
        }
    }

    start() {
        this._isProcessing = true;
        this.eventQueue.on("block", this.onBlockHandler.bind(this));
        // Listen for new blocks and emit them to the event queue after a delay
        // @todo: replace this with a sync check via the subgraph
        this.provider.on("block", async (blockNumber: number) => {
            console.log("New block", blockNumber);
            await wait(this.blockIndexDelay);
            this.eventQueue.emit("block", blockNumber);
        });
    }

    stop() {
        this._isProcessing = false;
        this.provider.removeAllListeners("block");
        this.eventQueue.removeAllListeners("block");
    }

    isProcessing() {
        return this._isProcessing;
    }
}

interface SaveSnapshotParams {
    blockNumber: number;
    provider: Provider;
    snapshotModel: typeof NAVSnapshotModel;
}

/**
 * Save a snapshot of the NAV at a block
 * @param params
 * @returns
 */
export async function saveSnapshot(params: SaveSnapshotParams) {
    const { blockNumber, provider, snapshotModel: SnapshotModel } = params;

    const chainId = (await provider.getNetwork()).chainId as ChainId;

    const tokenList = getNavTokenList().filter(
        (token) => token.chainId === chainId
    );
    // Owner list is DXdao treasury, DXswap relayer and DXD token contract (on mainnet)
    const navAddressList = [DXDAO_AVATAR[chainId], DXSWAP_RELAYER[chainId]];

    // On Mainnet add the DXD token address: it has about $100k USDC and 2500 ETH
    if (chainId === ChainId.ETHEREUM) {
        navAddressList.push(DXD[ChainId.ETHEREUM].address);
    }

    const tokenBalances = await Promise.all(
        navAddressList.map((owner) =>
            getTokenBalancesAtBlockForProvider(
                tokenList.map((token) => ({
                    token,
                    owner,
                })),
                blockNumber,
                provider
            )
        )
    ).then((results) => results.flat());

    const nativeCurrencyBalances = await Promise.all(
        navAddressList.map(async (owner) =>
            getNativeCurrencyBalanceAtBlockForProvider(
                owner,
                blockNumber,
                provider
            )
        )
    );

    // Total USD value of NAV tokens
    const navUSDValue = await getUSDValue(
        [...tokenBalances, ...nativeCurrencyBalances],
        blockNumber
    );

    const navTokenList = [...tokenBalances, ...nativeCurrencyBalances].map(
        (tokenBalance) => ({
            address: tokenBalance.currency.address,
            symbol: tokenBalance.currency.symbol,
            decimals: tokenBalance.currency.decimals,
            balance: tokenBalance.toString(),
        })
    );

    const doc = await new SnapshotModel({
        navUSDValue,
        chainId,
        block: blockNumber,
        navTokenList,
        navAddressList,
    }).save();

    console.log(`Saved snapshot ${doc._id}`);
}
