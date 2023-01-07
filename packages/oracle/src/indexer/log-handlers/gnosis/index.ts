import { Log } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { WebSocketProvider } from "@ethersproject/providers";
import {
    ChainId,
    DXDAO_AVATAR as DXDAO_AVATAR_ADDRESS,
} from "../../../constants";
import { DXD as DXD_TOKEN } from "../../../entities";
import { NAV_TOKEN_LIST } from "../../../entities/token";
import { updateDXDCirculatingSupplySnapshot } from "../../db/dxd-circulating-supply-snapshot";
import { updateTreasuryBalancesSnapshot } from "../../db/treasury-balances-snapshot";
import { addressEqual, decodeERC20TransferLog } from "../utils";

const DXD = DXD_TOKEN[ChainId.GNOSIS];
const DXDAO_AVATAR = DXDAO_AVATAR_ADDRESS[ChainId.GNOSIS];
const TREASURY_TOKENS = NAV_TOKEN_LIST.filter(
    (token) => token.chainId === ChainId.GNOSIS
);

export const handle = async (
    providerList: Record<ChainId, WebSocketProvider>,
    log: Log
) => {
    const erc20Transfer = decodeERC20TransferLog(log);
    if (!erc20Transfer) return;
    const { tokenAddress, from, to, amount } = erc20Transfer;
    if (amount.isZero()) return;

    // handle dxd movements (circulating supply related)
    if (addressEqual(tokenAddress, DXD.address)) {
        let supplyChange = BigNumber.from(0);
        if (
            (addressEqual(from, DXDAO_AVATAR) ||
                addressEqual(from, DXD.address)) &&
            !addressEqual(to, DXDAO_AVATAR) &&
            !addressEqual(to, DXD.address)
        ) {
            // dxd circulating
            supplyChange = supplyChange.add(amount);
        } else if (
            (addressEqual(to, DXDAO_AVATAR) || addressEqual(to, DXD.address)) &&
            !addressEqual(from, DXDAO_AVATAR) &&
            !addressEqual(from, DXD.address)
        ) {
            // dxd out of circulation
            supplyChange = supplyChange.sub(amount);
        }
        await updateDXDCirculatingSupplySnapshot(
            await providerList[ChainId.ETHEREUM].getBlockNumber(),
            supplyChange
        );
        return;
    }

    // handle treasury token movements
    const movedTreasuryToken = TREASURY_TOKENS.find((token) =>
        addressEqual(token.address, tokenAddress)
    );
    if (!!movedTreasuryToken) {
        let balanceChange = BigNumber.from(0);
        if (
            addressEqual(from, DXDAO_AVATAR) &&
            !addressEqual(to, DXDAO_AVATAR)
        ) {
            // tokens sent out form treasury
            balanceChange = balanceChange.sub(amount);
        } else if (
            addressEqual(to, DXDAO_AVATAR) &&
            !addressEqual(from, DXDAO_AVATAR)
        ) {
            // tokens deposited to treasury
            balanceChange = balanceChange.add(amount);
        }
        await updateTreasuryBalancesSnapshot(
            ChainId.GNOSIS,
            log.blockNumber,
            tokenAddress,
            balanceChange
        );
    }
};