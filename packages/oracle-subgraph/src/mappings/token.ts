import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/templates/NAVToken/ERC20";
import { Token } from "../../generated/schema";
import {
    DXD,
    DXdaoAvatar,
    DXDAO_AVATAR_DXD_VESTING_ADDRESS,
    SwaprRelayer,
} from "./constants";
import { addressEqual } from "../helpers/token";
import {
    updateDXDCirculatingSupplySnapshot,
    takeTreasuryBalanceSnapshot,
} from "./snapshot";
import { updateSubgraphStatus } from "./subgraphStatus";

// Handle DXD movements (dxd circulating supply)
export function handleDXDTrasnfer(event: Transfer): void {
    const from = event.params.from;
    const to = event.params.to;
    const amount = event.params.value;
    const blockNumber = event.block.number;

    let supplyChange = BigInt.fromI32(0);
    if (
        (addressEqual(from, DXdaoAvatar.address()) ||
            addressEqual(from, DXD.address()) ||
            addressEqual(from, DXDAO_AVATAR_DXD_VESTING_ADDRESS)) &&
        !addressEqual(to, DXdaoAvatar.address()) &&
        !addressEqual(to, DXD.address()) &&
        !addressEqual(to, DXDAO_AVATAR_DXD_VESTING_ADDRESS)
    ) {
        // dxd circulating
        supplyChange = supplyChange.plus(amount);
    } else if (
        (addressEqual(to, DXdaoAvatar.address()) ||
            addressEqual(to, DXD.address()) ||
            addressEqual(to, DXDAO_AVATAR_DXD_VESTING_ADDRESS)) &&
        !addressEqual(from, DXdaoAvatar.address()) &&
        !addressEqual(from, DXD.address()) &&
        !addressEqual(from, DXDAO_AVATAR_DXD_VESTING_ADDRESS)
    ) {
        // dxd out of circulation
        supplyChange = supplyChange.minus(amount);
    }
    updateDXDCirculatingSupplySnapshot(blockNumber, supplyChange);
    updateSubgraphStatus(blockNumber);
    return;
}

export function handleTransfer(event: Transfer): void {
    const token = Token.load(event.address.toHex());
    if (token == null) return;

    const from = event.params.from;
    const to = event.params.to;
    const blockNumber = event.block.number;

    const treasuryAddressList = [
        DXdaoAvatar.address(),
        SwaprRelayer.address(),
        DXD.address(),
    ];

    const isFromTreasury = treasuryAddressList.includes(from);
    const isToTreasury = treasuryAddressList.includes(to);

    if (isFromTreasury || isToTreasury) {
        takeTreasuryBalanceSnapshot(blockNumber);
        updateSubgraphStatus(blockNumber);
    }
}
