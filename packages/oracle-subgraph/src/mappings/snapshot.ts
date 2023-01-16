import { BigInt } from "@graphprotocol/graph-ts";
import {
    DXDCirculatingSupplySnapshot,
    TokenBalance,
    TreasuryBalancesSnapshot,
} from "../../generated/schema";
import {
    getNativeTokenBalanceForAddressAndSum,
    getTokenBalancesForAddressList,
} from "../helpers/balances";
import { getDXDTotalAndCirculatingSupply } from "../helpers/dxd";
import {
    DXD,
    DXdaoAvatar,
    DXdaoNavTokens,
    DXdaoSafes,
    NATIVE_TOKEN_ADDRESS,
    SwaprRelayer,
} from "./constants";

function takeNativeTokenBalanceSnapshot(
    block: BigInt,
    treasuryBalancesSnapshotId: string
): TokenBalance {
    let nativeTokenEntityId =
        block.toString() +
        "/" +
        NATIVE_TOKEN_ADDRESS.toHex() +
        "/" +
        DXdaoAvatar.address().toHex();
    // If a snapshot for this block exists, don't invoke onchain
    let nativeTokenEntity = TokenBalance.load(nativeTokenEntityId);
    if (nativeTokenEntity !== null) {
        return nativeTokenEntity as TokenBalance;
    }
    // treasury ETH balance = avatar + swapr relayer + dxd token contract
    const treasuryNativeTokenBalance = getNativeTokenBalanceForAddressAndSum(
        [DXdaoAvatar.address(), SwaprRelayer.address(), DXD.address()].concat(
            DXdaoSafes.addressList()
        )
    );
    // Native token balance
    const nativeTokenBalanceEntity = new TokenBalance(nativeTokenEntityId);
    nativeTokenBalanceEntity.token = NATIVE_TOKEN_ADDRESS.toHex();
    nativeTokenBalanceEntity.amount = treasuryNativeTokenBalance.toBigDecimal();
    nativeTokenBalanceEntity.snapshot = treasuryBalancesSnapshotId;
    nativeTokenBalanceEntity.address = DXdaoAvatar.address();
    nativeTokenBalanceEntity.save();

    return nativeTokenBalanceEntity;
}

/**
 * Take a treasury balance snapshot of all ERC20 tokens considered NAV tokens
 * @param blockNumber block number
 */
export function takeTreasuryBalanceSnapshot(blockNumber: BigInt): void {
    const navTokenList = DXdaoNavTokens.addressList();

    const erc20TokenBalances = getTokenBalancesForAddressList(
        navTokenList,
        DXdaoSafes.addressList().concat([
            DXdaoAvatar.address(),
            SwaprRelayer.address(),
            DXD.address(),
        ])
    );

    let block = blockNumber.toString();
    let treasuryBalancesSnapshot = TreasuryBalancesSnapshot.load(block);
    if (treasuryBalancesSnapshot === null) {
        treasuryBalancesSnapshot = new TreasuryBalancesSnapshot(block);
    }
    treasuryBalancesSnapshot.blockNumber = blockNumber;
    // Taken native token (xDAI/ETH) balance
    takeNativeTokenBalanceSnapshot(blockNumber, treasuryBalancesSnapshot.id);

    // ERC20 token balances from avatar, swapr relayer and DXD token contract
    for (let i = 0; i < erc20TokenBalances.length; i++) {
        const erc20TokenBalance = erc20TokenBalances[i];
        // Don't save 0 balances
        if (erc20TokenBalance.balance.equals(BigInt.fromI32(0))) {
            continue;
        }
        const tokenBalance = new TokenBalance(
            blockNumber.toString() +
                "/" +
                erc20TokenBalance.token.id +
                "/" +
                erc20TokenBalance.address.toHex()
        );
        tokenBalance.token = erc20TokenBalance.token.id;
        tokenBalance.amount = erc20TokenBalance.balance.toBigDecimal();
        tokenBalance.snapshot = treasuryBalancesSnapshot.id;
        tokenBalance.address = erc20TokenBalance.address;
        tokenBalance.save();
    }

    treasuryBalancesSnapshot.save();
}

/**
 *
 * @param blockNumber
 * @param supplyChange
 */
export function updateDXDCirculatingSupplySnapshot(
    blockNumber: BigInt,
    supplyChange: BigInt
): void {
    let snapshot = DXDCirculatingSupplySnapshot.load(blockNumber.toString());
    if (snapshot == null) {
        snapshot = new DXDCirculatingSupplySnapshot(blockNumber.toString());
        const totalAndCirculatingSupply = getDXDTotalAndCirculatingSupply();
        snapshot.totalSupply = totalAndCirculatingSupply.totalSupply.toBigDecimal();
        snapshot.circulatingSupply = totalAndCirculatingSupply.circulatingSupply.toBigDecimal();
    }
    snapshot.circulatingSupply = snapshot.circulatingSupply.plus(
        supplyChange.toBigDecimal()
    );
    snapshot.save();
}
