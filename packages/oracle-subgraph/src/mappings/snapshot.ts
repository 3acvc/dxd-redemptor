import { BigInt } from "@graphprotocol/graph-ts";
import {
    DXDCirculatingSupplySnapshot,
    TokenBalance,
    TreasuryBalancesSnapshot,
} from "../../generated/schema";
import {
    getNativeTokenBalanceForAddress,
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
): void {
    const addressList = [
        DXdaoAvatar.address(),
        SwaprRelayer.address(),
        DXD.address(),
    ].concat(DXdaoSafes.addressList());

    for (let i = 0; i < addressList.length; i++) {
        const address = addressList[i];
        const addressBalance = getNativeTokenBalanceForAddress(
            address
        )
        if (addressBalance.equals(BigInt.fromI32(0))) {
            continue;
        }
        let nativeTokenEntityId =
            block.toString() +
            "/" +
            NATIVE_TOKEN_ADDRESS.toHex() +
            "/" +
            address.toHex();
        // treasury ETH balance = avatar + swapr relayer + dxd token contract
        // Native token balance
        const tokenBalanceForAddressEntity = new TokenBalance(
            nativeTokenEntityId
        );
        tokenBalanceForAddressEntity.token = NATIVE_TOKEN_ADDRESS.toHex();
        tokenBalanceForAddressEntity.amount = addressBalance.toBigDecimal();
        tokenBalanceForAddressEntity.snapshot = treasuryBalancesSnapshotId;
        tokenBalanceForAddressEntity.address = address;
        tokenBalanceForAddressEntity.save();
    }
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
    if (treasuryBalancesSnapshot == null) {
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
