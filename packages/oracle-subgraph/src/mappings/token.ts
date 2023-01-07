import { BigInt, log } from "@graphprotocol/graph-ts";

import { Transfer } from "../../generated/templates/NAVToken/ERC20";
import { DXDCirculatingSupplySnapshot, Token } from "../../generated/schema";
import {
    DXD,
    DXdao,
    DXDAO_AVATAR_DXD_VESTING_ADDRESS,
    SwaprRelayer,
} from "./constants";
import { addressEqual } from "../helpers/token";
import { getDXDTotalAndCirculatingSupply } from "../helpers/dxd";

import { saveTreasuryBalanceSnapshot } from "./snapshot";

// import {
//   decreaseAccountBalance,
//   getOrCreateAccount,
//   increaseAccountBalance,
//   saveAccountBalanceSnapshot,
// } from './account'

// Handle DXD movements (dxd circulating supply)
export function handleDXDTrasnfer(event: Transfer): void {
    const from = event.params.from;
    const to = event.params.to;
    const amount = event.params.value;
    const blockNumber = event.block.number;

    let supplyChange = BigInt.fromI32(0);
    if (
        (addressEqual(from, DXdao.avatarAddress()) ||
            addressEqual(from, DXD.getAddress()) ||
            addressEqual(from, DXDAO_AVATAR_DXD_VESTING_ADDRESS)) &&
        !addressEqual(to, DXdao.avatarAddress()) &&
        !addressEqual(to, DXD.getAddress()) &&
        !addressEqual(to, DXDAO_AVATAR_DXD_VESTING_ADDRESS)
    ) {
        // dxd circulating
        supplyChange = supplyChange.plus(amount);
    } else if (
        (addressEqual(to, DXdao.avatarAddress()) ||
            addressEqual(to, DXD.getAddress()) ||
            addressEqual(to, DXDAO_AVATAR_DXD_VESTING_ADDRESS)) &&
        !addressEqual(from, DXdao.avatarAddress()) &&
        !addressEqual(from, DXD.getAddress()) &&
        !addressEqual(from, DXDAO_AVATAR_DXD_VESTING_ADDRESS)
    ) {
        // dxd out of circulation
        supplyChange = supplyChange.minus(amount);
    }
    updateDXDCirculatingSupplySnapshot(blockNumber, supplyChange);
    return;
}

export function handleTransfer(event: Transfer): void {
    const token = Token.load(event.address.toHex());
    if (token == null) return;

    const from = event.params.from;
    const to = event.params.to;
    const amount = event.params.value;
    const blockNumber = event.block.number;

    let balanceChange = BigInt.fromI32(0);

    const treasuryAddressList = [
        DXdao.avatarAddress(),
        SwaprRelayer.getAddress(),
        DXD.getAddress(),
    ];

    // if (addressEqual(from, DXdao.avatarAddress()) && !addressEqual(to, DXdao.avatarAddress())) {
    //     // tokens sent out form treasury
    //     balanceChange = balanceChange.minus(amount);
    // } else if (
    //     addressEqual(to, DXdao.avatarAddress()) &&
    //     !addressEqual(from, DXdao.avatarAddress())
    // ) {
    //     // tokens deposited to treasury
    //     balanceChange = balanceChange.add(amount);
    // }

    const isFromTreasury = treasuryAddressList.includes(from);
    const isToTreasury = treasuryAddressList.includes(to);

    log.debug("isFromTreasury: {}, isToTreasury: {}", [
        isFromTreasury.toString(),
        isToTreasury.toString(),
    ]);

    if (isFromTreasury || isToTreasury) {
        saveTreasuryBalanceSnapshot(blockNumber);
    }
}

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
