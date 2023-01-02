// solhint-disable compiler-version
pragma solidity 0.8.17;

import {BaseTestFixture} from "tests/commons/BaseTestFixture.t.sol";
import {AVATAR_ADDRESS} from "src/Redemptor.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Deployment test
/// @dev Tests the deployment of the contract.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract MinimumSigners is BaseTestFixture {
    function testNoRounding() external {
        vm.prank(redemptorHarness.owner());
        redemptorHarness.setSignersThreshold(5_000);
        assertEq(redemptorHarness.exposedMinimumSigners(10), 5);
        assertEq(redemptorHarness.exposedMinimumSigners(4), 2);
    }

    function testRoundingUp() external {
        vm.prank(redemptorHarness.owner());
        redemptorHarness.setSignersThreshold(5_000);
        assertEq(redemptorHarness.exposedMinimumSigners(1), 1);
        assertEq(redemptorHarness.exposedMinimumSigners(3), 2);
        assertEq(redemptorHarness.exposedMinimumSigners(7), 4);
    }
}
