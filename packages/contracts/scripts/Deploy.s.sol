// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Redemptor} from "src/Redemptor.sol";

contract Deploy is Script {
    function run(address[] memory _signers) public {
        vm.broadcast();
        new Redemptor(_signers);
    }
}
