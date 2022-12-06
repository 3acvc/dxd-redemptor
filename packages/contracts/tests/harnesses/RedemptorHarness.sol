// solhint-disable compiler-version
pragma solidity 0.8.17;

import {Redemptor} from "src/Redemptor.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Redemptor harness
/// @dev A harness contract to expose internal functions of the redemptor, making them testable.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract RedemptorHarness is Redemptor {
    constructor(uint256 _signersThreshold, address[] memory _signers)
        Redemptor(_signersThreshold, _signers)
    {}

    function exposedMinimumSigners(uint256 _totalSigners)
        external
        view
        returns (uint256)
    {
        return _minimumSigners(_totalSigners);
    }
}
