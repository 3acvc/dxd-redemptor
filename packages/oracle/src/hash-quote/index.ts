import { keccak256 } from "@ethersproject/solidity";
import { defaultAbiCoder } from "@ethersproject/abi";
import { Quote } from "../types";
import { ORACLE_MESSAGE_TYPE_HASH } from "../constants";

/**
 * Returns the hash of the quote struct, which can then be
 * used to derive an EIP712 signature.
 * @param quote The quote to hash.
 * @returns The quote struct hash.
 */
export function hashQuote(quote: Quote): string {
    return keccak256(
        ["bytes"],
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
                    "uint256",
                ],
                [
                    ORACLE_MESSAGE_TYPE_HASH,
                    quote.redeemedDXD,
                    quote.circulatingDXDSupply,
                    quote.redeemedToken,
                    quote.redeemedTokenUSDPrice,
                    quote.redeemedAmount,
                    quote.collateralUSDValue,
                    quote.deadline,
                ]
            ),
        ]
    );
}
