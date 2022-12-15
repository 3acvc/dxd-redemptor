// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {Redemptor} from "src/Redemptor.sol";
import {OracleMessage} from "src/interfaces/IRedemptor.sol";
import {ECDSA} from "oz/utils/cryptography/ECDSA.sol";

contract GetOracleMessageHash is Script, Redemptor {
    constructor() Redemptor(5_000, new address[](0)) {}

    function run(OracleMessage calldata _oracleMessage) public view {
        console2.logBytes32(_oracleMessageHash(_oracleMessage));
    }
}
