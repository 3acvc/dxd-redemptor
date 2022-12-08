// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {Redemptor} from "src/Redemptor.sol";

contract Deploy is Script {
    function run(uint256 _signersThreshold, address[] memory _signers) public {
        vm.broadcast();
        Redemptor _redemptor = new Redemptor(_signersThreshold, _signers);
        console2.log("Redemptor deployed at address", address(_redemptor));
    }
}
