import { Address } from "@graphprotocol/graph-ts";

export function addressEqual(a: Address, b: Address): boolean {
    return a.toHexString().toLowerCase() == b.toHexString().toLowerCase()
}