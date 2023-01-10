import { Address, log, dataSource, BigInt } from "@graphprotocol/graph-ts";
import {
    DXDCirculatingSupplySnapshot,
    SubgraphStatus,
    Token,
    TreasuryBalancesSnapshot,
    TokenBalance,
} from "../../generated/schema";
import { ERC20 as ERC20Contract } from "../../generated/Token/ERC20";
import { NewCallProposal } from "../../generated/Token/ENSScheme";
import { NAVToken as NAVTokenTemplate } from "../../generated/templates";
import {
    getNativeTokenBalanceForAddress,
    getTokenBalancesForAddress,
} from "../helpers/balances";
import {
    DXD,
    DXdao,
    MAINNET,
    NATIVE_TOKEN_ADDRESS,
    SwaprRelayer,
} from "./constants";
import { getDXDTotalAndCirculatingSupply } from "../helpers/dxd";
import { saveTreasuryBalanceSnapshot } from "./snapshot";

// Dummy
export function handleNoopTransfer(): void {
    // Do nothing
}

// This handler is called by block handlers
export function initSubgraph(blockNumber: BigInt): void {
    let subgraphStatus = SubgraphStatus.load("1");
    if (subgraphStatus !== null) {
        log.debug("Registery already initialized", []);
        return;
    }

    log.debug("Initializing token registry, network: {}", [
        dataSource.network(),
    ]);
    // Initialize subgraph status
    subgraphStatus = new SubgraphStatus("1");
    subgraphStatus.isInitialized = true;
    subgraphStatus.lastSnapshotBlock = blockNumber;
    subgraphStatus.save();

    createNativeTokenEntity();
    createOrReturnTokenEntity(DXD.getAddress());
    for (let i = 0; i < DXdao.navTokenAddressList().length; i++) {
        createOrReturnTokenEntity(DXdao.navTokenAddressList()[i]);
    }
    initializeDXDCirculatingSupplySnapshot(blockNumber);
    initializeTreasuryBalancesSnapshot(blockNumber);

    // Create token trackers for DXD and NAV tokens
    // NAVTokenTemplate.create(DXD.getAddress());
    for (let i = 0; i < DXdao.navTokenAddressList().length; i++) {
        NAVTokenTemplate.create(DXdao.navTokenAddressList()[i] as Address);
    }
}

// export function handleInitSubgraph(event: ethereum.Event): void {
//     return initSubgraph(event.block.number);
// }

export function handleInitSubgraph(event: NewCallProposal): void {
    return initSubgraph(event.block.number);
}

export function createNativeTokenEntity(): void {
    // Create Ether token
    let nativeToken = Token.load(NATIVE_TOKEN_ADDRESS.toHex());
    if (nativeToken != null) {
        log.warning("Native token already in registry", []);
        return;
    }
    nativeToken = new Token(NATIVE_TOKEN_ADDRESS.toHex());
    if (dataSource.network() === MAINNET) {
        nativeToken.name = "Ether";
        nativeToken.symbol = "ETH";
    } else {
        nativeToken.name = "xDAI";
        nativeToken.symbol = "xDAI";
    }
    nativeToken.decimals = 18;
    nativeToken.save();
}

export function createOrReturnTokenEntity(contractAddress: Address): Token {
    // Persist token data if it doesn't already exist
    let token = Token.load(contractAddress.toHex());
    if (token !== null) {
        log.warning("Token {} already in registry", [contractAddress.toHex()]);
        return token;
    }
    let tokenContract = ERC20Contract.bind(contractAddress);
    token = new Token(contractAddress.toHex());
    token.name = tokenContract.name();
    token.symbol = tokenContract.symbol();
    token.decimals = tokenContract.decimals();
    token.save();
    return token;
}

export function initializeDXDCirculatingSupplySnapshot(
    blockNumber: BigInt
): void {
    const totalAndCirculatingSupply = getDXDTotalAndCirculatingSupply();
    let snapshot = new DXDCirculatingSupplySnapshot(blockNumber.toString());
    snapshot.totalSupply = totalAndCirculatingSupply.totalSupply.toBigDecimal();
    snapshot.circulatingSupply = totalAndCirculatingSupply.circulatingSupply.toBigDecimal();
    snapshot.save();
}

export function initializeTreasuryBalancesSnapshot(blockNumber: BigInt): void {
    saveTreasuryBalanceSnapshot(blockNumber);
}
