import { BigInt } from "@graphprotocol/graph-ts";
import { TokenBalance, TreasuryBalancesSnapshot } from "../../generated/schema";
import {
    getNativeTokenBalanceForAddress,
    getTokenBalancesForAddress,
} from "../helpers/balances";
import { DXD, DXdao, NATIVE_TOKEN_ADDRESS, SwaprRelayer } from "./constants";

export function saveTreasuryBalanceSnapshot(blockNumber: BigInt): void {
    // treasury ETH balance = avatar + swapr relayer + dxd token contract
    const treasuryNativeTokenBalance = getNativeTokenBalanceForAddress(
        DXdao.avatarAddress()
    )
        .plus(getNativeTokenBalanceForAddress(SwaprRelayer.getAddress()))
        .plus(getNativeTokenBalanceForAddress(DXD.getAddress()));

    const erc20TokenBalances = getTokenBalancesForAddress(
        DXdao.navTokenAddressList(),
        DXdao.avatarAddress()
    )
        .concat(
            getTokenBalancesForAddress(
                DXdao.navTokenAddressList(),
                SwaprRelayer.getAddress()
            )
        )
        .concat(
            getTokenBalancesForAddress(
                DXdao.navTokenAddressList(),
                DXD.getAddress() // Because this has USDC
            )
        );

    const treasuryBalancesSnapshot = new TreasuryBalancesSnapshot(
        blockNumber.toString()
    );
    // treasuryBalancesSnapshot.balances = [];
    treasuryBalancesSnapshot.blockNumber = blockNumber;

    // Native token balance
    const nativeTokenBalanceEntity = new TokenBalance(
        blockNumber.toString() +
            "/" +
            NATIVE_TOKEN_ADDRESS.toHex() +
            "/" +
            DXdao.avatarAddress().toHex()
    );
    nativeTokenBalanceEntity.token = NATIVE_TOKEN_ADDRESS.toHex();
    nativeTokenBalanceEntity.amount = treasuryNativeTokenBalance.toBigDecimal();
    nativeTokenBalanceEntity.snapshot = treasuryBalancesSnapshot.id;
    nativeTokenBalanceEntity.address = DXdao.avatarAddress();
    nativeTokenBalanceEntity.save();

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
