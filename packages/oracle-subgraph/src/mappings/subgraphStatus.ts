import { BigInt } from "@graphprotocol/graph-ts";
import { SubgraphStatus } from "../../generated/schema";

export function updateSubgraphStatus(blockNumber: BigInt): void {
    let subgraphStatus = SubgraphStatus.load("1");

    if (subgraphStatus === null) {
        subgraphStatus = new SubgraphStatus("1");
    }
    subgraphStatus.lastSnapshotBlock = blockNumber;
    subgraphStatus.save();
}
