import {
    Address,
    log,
    dataSource,
    BigInt,
    ethereum,
} from "@graphprotocol/graph-ts";
import {
    DXDCirculatingSupplySnapshot,
    SubgraphStatus,
    Token,
} from "../../generated/schema";
import { ERC20 as ERC20Contract } from "../../generated/Token/ERC20";
import { NewCallProposal } from "../../generated/Token/ENSScheme";
import { NAVToken as NAVTokenTemplate } from "../../generated/templates";
import {
    DXD,
    DXdaoNavTokens,
    MAINNET,
    NATIVE_TOKEN_ADDRESS,
    XDAI,
    SNAPSHOT_FREQUENCY,
    ZERO,
} from "./constants";
import { getDXDTotalAndCirculatingSupply } from "../helpers/dxd";
import { takeTreasuryBalanceSnapshot } from "./snapshot";

export function handleBlock(block: ethereum.Block): void {
    let subgraphStatus = SubgraphStatus.load("1");

    if (subgraphStatus == null) {
        return initSubgraph(block.number);
    }

    if (block.number.mod(SNAPSHOT_FREQUENCY).equals(ZERO)) {
        return takeTreasuryBalanceSnapshot(block.number);
    }
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
    // Create NAV token entities in postgres
    createNativeTokenEntity();
    createOrReturnTokenEntity(DXD.address());

    const navTokenList = DXdaoNavTokens.addressList();

    for (let i = 0; i < navTokenList.length; i++) {
        createOrReturnTokenEntity(navTokenList[i]);
    }
    initializeDXDCirculatingSupplySnapshot(blockNumber);
    initializeTreasuryBalancesSnapshot(blockNumber);

    // Create token trackers for DXD and NAV tokens
    // NAVTokenTemplate.create(DXD.getAddress());
    for (let i = 0; i < navTokenList.length; i++) {
        NAVTokenTemplate.create(navTokenList[i]);
    }
}

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
    let network = dataSource.network() as string;
    if (network == MAINNET) {
        nativeToken.name = "Ether";
        nativeToken.symbol = "ETH";
    }
    if (network == XDAI) {
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
    takeTreasuryBalanceSnapshot(blockNumber);
}
