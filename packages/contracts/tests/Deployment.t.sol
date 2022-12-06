// solhint-disable compiler-version
pragma solidity 0.8.17;

import {BaseTestFixture} from "tests/commons/BaseTestFixture.t.sol";
import {MIN_SIGNERS_THRESHOLD} from "src/Redemptor.sol";
import {RedemptorHarness} from "tests/harnesses/RedemptorHarness.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Deployment test
/// @dev Tests the deployment of the contract.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract Deployment is BaseTestFixture {
    function testSucceedsWithoutInitialSigners() external {
        address[] memory _initialSigners = new address[](0);
        RedemptorHarness redemptorHarness = new RedemptorHarness(
            MIN_SIGNERS_THRESHOLD,
            _initialSigners
        );
        assertEq(redemptorHarness.signersAmount(), 0);
    }

    function testSucceedsWithInitialSigners() external {
        address _signer = address(1234);
        address[] memory _initialSigners = new address[](1);
        _initialSigners[0] = _signer;
        RedemptorHarness redemptorHarness = new RedemptorHarness(
            MIN_SIGNERS_THRESHOLD,
            _initialSigners
        );
        assertTrue(redemptorHarness.isSigner(_signer));
        assertEq(redemptorHarness.signersAmount(), 1);
    }
}
