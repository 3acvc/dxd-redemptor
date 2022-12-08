import { DXD } from "../../entities/token";
import {
    ChainId,
    DXDAO_AVATAR,
    DXDAO_AVATAR_DXD_VESTING_ADDRESS,
    ERC20_INTERFACE,
    MULTICALL,
} from "../../constants";
import { BigNumber } from "ethers";
import { Amount } from "../../entities/amount";
import { Currency } from "../../entities/currency";

export async function getDXDCirculatingSupply(
    block: Record<ChainId, number>
): Promise<Amount<Currency>> {
    const mainnetDXD = DXD[ChainId.ETHEREUM];
    const mainnetAvatar = DXDAO_AVATAR[ChainId.ETHEREUM];

    const gnosisDXD = DXD[ChainId.GNOSIS];
    const gnosisAvatar = DXDAO_AVATAR[ChainId.GNOSIS];

    const [, mainnetResults] = await MULTICALL[
        ChainId.ETHEREUM
    ].callStatic.aggregate(
        [
            [
                mainnetDXD.address,
                ERC20_INTERFACE.encodeFunctionData("totalSupply", []),
            ],
            [
                mainnetDXD.address,
                ERC20_INTERFACE.encodeFunctionData("balanceOf", [
                    mainnetAvatar,
                ]),
            ],
            [
                mainnetDXD.address,
                ERC20_INTERFACE.encodeFunctionData("balanceOf", [
                    mainnetDXD.address,
                ]),
            ],
            [
                mainnetDXD.address,
                ERC20_INTERFACE.encodeFunctionData("balanceOf", [
                    DXDAO_AVATAR_DXD_VESTING_ADDRESS,
                ]),
            ],
        ],
        { blockTag: block[ChainId.ETHEREUM] }
    );
    const totalSupply: BigNumber = ERC20_INTERFACE.decodeFunctionResult(
        "totalSupply",
        mainnetResults[0]
    )[0];
    const mainnetAvatarBalance: BigNumber =
        ERC20_INTERFACE.decodeFunctionResult("balanceOf", mainnetResults[1])[0];
    const mainnetDXDContractBalance: BigNumber =
        ERC20_INTERFACE.decodeFunctionResult("balanceOf", mainnetResults[2])[0];
    const mainnetVestingContractBalance: BigNumber =
        ERC20_INTERFACE.decodeFunctionResult("balanceOf", mainnetResults[3])[0];

    const [, gnosisResults] = await MULTICALL[
        ChainId.GNOSIS
    ].callStatic.aggregate(
        [
            [
                gnosisDXD.address,
                ERC20_INTERFACE.encodeFunctionData("balanceOf", [gnosisAvatar]),
            ],
            [
                gnosisDXD.address,
                ERC20_INTERFACE.encodeFunctionData("balanceOf", [
                    gnosisDXD.address,
                ]),
            ],
        ],
        { blockTag: block[ChainId.GNOSIS] }
    );
    const gnosisAvatarBalance: BigNumber = ERC20_INTERFACE.decodeFunctionResult(
        "balanceOf",
        gnosisResults[0]
    )[0];
    const gnosisDXDContractBalance: BigNumber =
        ERC20_INTERFACE.decodeFunctionResult("balanceOf", gnosisResults[1])[0];

    return Amount.fromRawAmount(
        DXD[ChainId.ETHEREUM],
        totalSupply.sub(
            mainnetAvatarBalance
                .add(mainnetDXDContractBalance)
                .add(mainnetVestingContractBalance)
                .add(gnosisAvatarBalance)
                .add(gnosisDXDContractBalance)
        )
    );
}
