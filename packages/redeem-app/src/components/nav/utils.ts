import { ChainId, Currency, DXD } from "dxd-redemptor-oracle";

export const currencyFormatter = new Intl.NumberFormat();

export function isDXDToken(tokenInstanceOrAddress: string | Currency) {
  let tokenAddress =
    typeof tokenInstanceOrAddress === "string"
      ? tokenInstanceOrAddress
      : tokenInstanceOrAddress.address;

  const isDXDEthereum =
    tokenAddress.toLowerCase() === DXD[ChainId.ETHEREUM].address.toLowerCase();
  const isDXDGnosis =
    tokenAddress.toLowerCase() === DXD[ChainId.GNOSIS].address.toLowerCase();

  return isDXDEthereum || isDXDGnosis;
}
