import { BigDecimal, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'

import { Transfer } from '../../generated/templates/NAVToken/ERC20'
import { Token, TransferEvent } from '../../generated/schema'
import { toDecimal, ONE, ZERO } from '../helpers/number'
import { DXD, DXdao, DXDAO_AVATAR_DXD_VESTING_ADDRESS } from './registery'
import { addressEqual } from '../helpers/token'

// import {
//   decreaseAccountBalance,
//   getOrCreateAccount,
//   increaseAccountBalance,
//   saveAccountBalanceSnapshot,
// } from './account'

export function handleTransfer(event: Transfer): void {
  let tokenAddress = event.address
  let from = event.params.from
  let to = event.params.to
  let amount = event.params.value
  let blockNumber = event.block.number
  let token = Token.load(event.address.toHex())
  // Handle DXD movements (dxd circulating supply)
  if (tokenAddress === DXD.getAddress()) {

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
        // await updateDXDCirculatingSupplySnapshot(log.blockNumber, supplyChange);
        return;
    }

  // if (token != null) {
  //   let amount = toDecimal(event.params.value, token.decimals)

  //     handleTransferEvent(token, amount, event.params.from, event.params.to, event)
  // }
}
