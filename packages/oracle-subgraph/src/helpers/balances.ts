import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Token } from "../../generated/schema";
import { Multicall3 } from "../../generated/templates/NAVToken/Multicall3";

import { ERC20 as ERC20Contract } from "../../generated/Token/ERC20";
import { MULTICALL3_ADDRESS } from "../mappings/constants";

class TokenBalance {
    token: Token;
    balance: BigInt;
    address: Address;

    constructor(token: Token, balance: BigInt, address: Address) {
        this.token = token;
        this.balance = balance;
        this.address = address;
    }
}

export function getTokenBalancesForAddress(
    tokenAddressList: Address[],
    owner: Address
): TokenBalance[] {
    const balances: TokenBalance[] = [];
    // Native token balance
    for (let i = 0; i < tokenAddressList.length; i++) {
        const tokenAddress = tokenAddressList[i];
        const tokenContract = ERC20Contract.bind(tokenAddressList[i]);
        const balance = tokenContract.try_balanceOf(owner);
        const token = Token.load(tokenAddress.toHex());
        if (!balance.reverted) {
            balances.push(
                new TokenBalance(token as Token, balance.value, owner)
            );
        } else {
            log.warning("Failed to get balance for token {} and owner {}", [
                tokenAddress.toHex(),
                owner.toHex(),
            ]);
        }
    }

    return balances;
}

export function getNativeTokenBalanceForAddress(owner: Address): BigInt {
    const multicall3 = Multicall3.bind(MULTICALL3_ADDRESS);
    const rest = multicall3.try_getEthBalance(owner);

    if (rest.reverted) {
        return BigInt.fromI32(0);
    }
    return rest.value;
}
