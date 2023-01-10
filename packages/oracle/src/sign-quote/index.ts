import { defaultAbiCoder } from "@ethersproject/abi";
import { hexConcat, joinSignature } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/solidity";
import type { Wallet } from "@ethersproject/wallet";
import { recoverAddress } from "@ethersproject/transactions";
import {
    DOMAIN_SEPARATOR_NAME,
    DOMAIN_SEPARATOR_VERSION,
    EIP712_DOMAIN_TYPE_HASH,
} from "../constants";
import { hashQuote } from "../hash-quote";
import { Quote } from "../types";

/**
 * Returns the EIP712 digest of the quote struct, complete with type information.
 * This digest can be then signed.
 * @param quote The quote struct to get the EIP712 digest of.
 * @param redemptorAddress The address of the redemptor contract. This is the `verifyingContract` in the context of the EIP712 domain.
 * @returns The EIP712 digest of the quote struct complete with type information.
 */
// TODO: does quote redemptor address need to be an input param? We can save hashing
// the domain separator every time by having an oracle-wide init function that initializes
// important data and initialization checks around.
export function quoteEIP712Digest(
    quote: Quote,
    redemptorAddress: string
): string {
    const quoteHash = hashQuote(quote);
    const domainSeparator = keccak256(
        ["bytes"],
        [
            defaultAbiCoder.encode(
                ["bytes32", "bytes32", "bytes32", "uint256", "address"],
                [
                    EIP712_DOMAIN_TYPE_HASH,
                    DOMAIN_SEPARATOR_NAME,
                    DOMAIN_SEPARATOR_VERSION,
                    1,
                    redemptorAddress,
                ]
            ),
        ]
    );
    return keccak256(
        ["bytes"],
        [hexConcat(["0x1901", domainSeparator, quoteHash])]
    );
}

/**
 * Signs an EIP712 encoded quote hash.
 * @param signer The signer that will sign the quote.
 * @param quote The quote to sign.
 * @param redemptorAddress The address of the redemptor contract. This is the `verifyingContract` in the context of the EIP712 domain.
 * @returns The quote's signature.
 */
export function signQuote(
    signer: Wallet,
    quote: Quote,
    redemptorAddress: string
): string {
    const digest = quoteEIP712Digest(quote, redemptorAddress);
    return joinSignature(signer._signingKey().signDigest(digest));
}

/**
 * Verifies a quote signatures and returns the signer.
 * @param quote The original signed quote.
 * @param redemptorAddress The address of the redemptor contract. This is the `verifyingContract` in the context of the EIP712 domain.
 * @param signature The signature to verify and to recover the signer from.
 * @returns The quote's signer.
 */
export function verifyQuoteSignature(
    quote: Quote,
    redemptorAddress: string,
    signature: string
): string {
    const digest = quoteEIP712Digest(quote, redemptorAddress);
    return recoverAddress(digest, signature);
}
