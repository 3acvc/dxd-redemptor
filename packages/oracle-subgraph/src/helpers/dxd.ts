import { BigInt } from "@graphprotocol/graph-ts";
import { ERC20 as ERC20Contract } from "../../generated/Token/ERC20";
import {
    DXD,
    DXdaoAvatar,
    DXdaoSafes,
    DXDAO_AVATAR_DXD_VESTING_ADDRESS,
} from "../mappings/constants";
import { getTokenBalancesForAddressList } from "./balances";

class DXDTotalAndCirculatingSupply {
    totalSupply: BigInt;
    circulatingSupply: BigInt;

    constructor(totalSupply: BigInt, circulatingSupply: BigInt) {
        this.totalSupply = totalSupply;
        this.circulatingSupply = circulatingSupply;
    }
}

/**
 * Get the total and circulating supply of DXD
 * @param blockNumber the block number
 * @returns
 */
export function getDXDTotalAndCirculatingSupply(): DXDTotalAndCirculatingSupply {
    const dxdContract = ERC20Contract.bind(DXD.address());
    const totalSupply = dxdContract.totalSupply();

    const dxdBalancesInSafes = getTokenBalancesForAddressList(
        [DXD.address()],
        DXdaoSafes.addressList().concat([
            DXdaoAvatar.address(),
            DXDAO_AVATAR_DXD_VESTING_ADDRESS,
            dxdContract._address,
        ])
    );

    let avatar_dxdVesting_safes_dxdContract_Balance = BigInt.fromI32(0);

    for (let i = 0; i < dxdBalancesInSafes.length; i++) {
        avatar_dxdVesting_safes_dxdContract_Balance = avatar_dxdVesting_safes_dxdContract_Balance.plus(
            dxdBalancesInSafes[i].balance
        );
    }

    // circulating supply = total supply - avatar balance - DXD contract balance - vesting contract balance - safes
    const circulatingSupply = totalSupply.minus(
        avatar_dxdVesting_safes_dxdContract_Balance
    );

    return new DXDTotalAndCirculatingSupply(totalSupply, circulatingSupply);
}
