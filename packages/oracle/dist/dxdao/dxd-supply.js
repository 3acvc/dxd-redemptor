import { ERC20__factory } from "../generated/contracts";
import { ChainId, getProvider } from "../lib/web3";
import { dxdaoDXDVestingAddress, dxdaoTreasuryAddressList, dxdTokenContractAddressList, } from "./constants";
export async function getDXDCirculatingSupply(blockNumber) {
    const dxdTokenContract = {
        [ChainId.Ethereum]: ERC20__factory.connect(dxdTokenContractAddressList[ChainId.Ethereum], getProvider(ChainId.Ethereum)),
        [ChainId.Gnosis]: ERC20__factory.connect(dxdTokenContractAddressList[ChainId.Gnosis], getProvider(ChainId.Gnosis)),
    };
    const dxdTotalSupply = await dxdTokenContract[1].totalSupply({
        blockTag: blockNumber?.[1],
    });
    const treasuryDXDBalance = {
        [ChainId.Ethereum]: await dxdTokenContract[ChainId.Ethereum].balanceOf(dxdaoTreasuryAddressList[ChainId.Ethereum], {
            blockTag: blockNumber?.[1],
        }),
        [ChainId.Gnosis]: await dxdTokenContract[ChainId.Gnosis].balanceOf(dxdaoTreasuryAddressList[ChainId.Gnosis], {
            blockTag: blockNumber?.[100],
        }),
    };
    const dxdVestingContractDXDBalance = await dxdTokenContract[ChainId.Ethereum].balanceOf(dxdaoDXDVestingAddress, {
        blockTag: blockNumber?.[1],
    });
    const dxdTokenContractDXDBalance = await dxdTokenContract[ChainId.Ethereum].balanceOf(dxdTokenContractAddressList[ChainId.Ethereum], {
        blockTag: blockNumber?.[1],
    });
    const dxdCirculatingSupply = dxdTotalSupply.sub([
        treasuryDXDBalance[ChainId.Ethereum],
        treasuryDXDBalance[ChainId.Gnosis],
        dxdVestingContractDXDBalance,
        dxdTokenContractDXDBalance,
    ].reduce((a, b) => a.add(b)));
    return dxdCirculatingSupply;
}
