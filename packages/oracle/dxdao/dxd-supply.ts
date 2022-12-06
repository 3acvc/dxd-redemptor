import { BigNumber } from "ethers";

import { ERC20, ERC20__factory } from "../generated/contracts";
import { ChainId, getProvider } from "../../lib/web3";

import {
  dxdaoDXDVestingAddress,
  dxdaoTreasuryAddressList,
  dxdTokenContractAddressList,
} from "./constants";

/**
 * Returns the circulating supply of DXD tokens.
 *
 * DXD Circulating Supply: totalSupply of: 0xa1d65E8fB6e87b60FECCBc582F7f97804B725521 minus DXD in the following addresses:
 *
 * - DXdao Treasury: 0x519b70055af55A007110B4Ff99b0eA33071c720a
 *
 * - DXD Vesting Contract: 0xBd12eBb77eF167a5FF93b7E572b33f2526aE3fd0
 *
 * - DXD Token: 0xa1d65E8fB6e87b60FECCBc582F7f97804B725521
 *
 * - DXdao holdings on Gnosis Chain: 0xe716ec63c5673b3a4732d22909b38d779fa47c3f
 *
 * @param blockNumber The block number to use for the calculation
 * @returns {Promise<BigNumber>}
 */
export async function getDXDCirculatingSupply(
  blockNumber?: Record<string, number>
): Promise<BigNumber> {
  const dxdTokenContract: Record<ChainId, ERC20> = {
    [ChainId.Ethereum]: ERC20__factory.connect(
      dxdTokenContractAddressList[ChainId.Ethereum],
      getProvider(ChainId.Ethereum)
    ),
    [ChainId.Gnosis]: ERC20__factory.connect(
      dxdTokenContractAddressList[ChainId.Gnosis],
      getProvider(ChainId.Gnosis)
    ),
  };

  // Total supply of DXD tokens
  const dxdTotalSupply = await dxdTokenContract[1].totalSupply({
    blockTag: blockNumber?.[1],
  });

  // Total balance of DXD in the DXdao treasury on Ethereum and Gnosis Chain
  const treasuryDXDBalance: Record<ChainId, BigNumber> = {
    [ChainId.Ethereum]: await dxdTokenContract[ChainId.Ethereum].balanceOf(
      dxdaoTreasuryAddressList[ChainId.Ethereum],
      {
        blockTag: blockNumber?.[1],
      }
    ),
    [ChainId.Gnosis]: await dxdTokenContract[ChainId.Gnosis].balanceOf(
      dxdaoTreasuryAddressList[ChainId.Gnosis],
      {
        blockTag: blockNumber?.[100],
      }
    ),
  };

  // DXD sitting in the DXD vesting contract on Ethereum
  const dxdVestingContractDXDBalance = await dxdTokenContract[
    ChainId.Ethereum
  ].balanceOf(dxdaoDXDVestingAddress, {
    blockTag: blockNumber?.[1],
  });

  // Total balance of DXD in the DXD token contract
  const dxdTokenContractDXDBalance = await dxdTokenContract[
    ChainId.Ethereum
  ].balanceOf(dxdTokenContractAddressList[ChainId.Ethereum], {
    blockTag: blockNumber?.[1],
  });

  // Circulating supply of DXD tokens is the total supply minus the DXD in the treasury, DXD vesting contract, DXD token contract and DXD on Gnosis Chain
  const dxdCirculatingSupply = dxdTotalSupply.sub(
    [
      treasuryDXDBalance[ChainId.Ethereum],
      treasuryDXDBalance[ChainId.Gnosis],
      dxdVestingContractDXDBalance,
      dxdTokenContractDXDBalance,
    ].reduce((a, b) => a.add(b))
  );

  return dxdCirculatingSupply;
}
