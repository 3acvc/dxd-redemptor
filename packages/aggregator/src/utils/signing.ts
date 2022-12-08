import { defaultAbiCoder } from "@ethersproject/abi";
import { keccak256 } from "@ethersproject/solidity";
import { Quote } from "dxd-redemptor-oracle";

const TYPE_HASH = keccak256(
    ["string"],
    [
        "OracleMessage(uint256 redeemedDXD,uint256 circulatingDXDSupply,address redeemedToken,uint256 redeemedTokenUSDPrice,uint256 redeemedAmount,uint256 collateralUSDValue)",
    ]
);

export const quoteToEIP712Hash = (quote: Quote): string => {
    return keccak256(
        ["string"],
        [
            defaultAbiCoder.encode(
                [
                    "bytes32",
                    "uint256",
                    "uint256",
                    "address",
                    "uint256",
                    "uint256",
                    "uint256",
                ],
                [
                    TYPE_HASH,
                    quote.redeemedDXD,
                    quote.circulatingDXDSupply,
                    quote.redeemedToken,
                    quote.redeemedTokenUSDPrice,
                    quote.redeemedAmount,
                    quote.collateralUSDValue,
                ]
            ),
        ]
    );
};
