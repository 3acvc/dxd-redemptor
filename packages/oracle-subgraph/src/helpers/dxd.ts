import { BigInt, dataSource } from "@graphprotocol/graph-ts";
import { ERC20 as ERC20Contract } from "../../generated/Token/ERC20";
import { DXD, DXdao, DXDAO_AVATAR_DXD_VESTING_ADDRESS, MAINNET } from "../mappings/constants";


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
    let dxdContract = ERC20Contract.bind(DXD.getAddress());
    let totalSupply = dxdContract.totalSupply();
    let avatarBalance = dxdContract.balanceOf(DXdao.avatarAddress());
    let dxdContractBalance = dxdContract.balanceOf(dxdContract._address);

    // Mainet vesting contract
    let mainnetVestingContractBalance = BigInt.fromI32(0);
    if (dataSource.network() === MAINNET) {
        mainnetVestingContractBalance = dxdContract.balanceOf(
            DXDAO_AVATAR_DXD_VESTING_ADDRESS
        );
    }

    // circulating supply = total supply - avatar balance - DXD contract balance - vesting contract balance
    let circulatingSupply = totalSupply
        .minus(avatarBalance)
        .minus(dxdContractBalance)
        .minus(mainnetVestingContractBalance);

    return new DXDTotalAndCirculatingSupply(totalSupply, circulatingSupply);
}
