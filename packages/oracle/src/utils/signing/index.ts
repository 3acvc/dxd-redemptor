import { defaultAbiCoder } from "@ethersproject/abi";
import { keccak256 } from "@ethersproject/solidity";
import { ORACLE_MESSAGE_TYPE_HASH } from "../../constants";
import { Quote } from "../../types";

/**
 * Hashes a quote
 * @param quote the quote to hash
 * @returns the hash of the quote
 */
export function quoteToEIP712Hash(quote: Quote): string {
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
