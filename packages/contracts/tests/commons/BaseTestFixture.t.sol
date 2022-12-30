// solhint-disable compiler-version
pragma solidity 0.8.17;

import {Test} from "forge-std/Test.sol";
import {ERC20PresetMinterPauser} from
    "oz/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import {WETH9} from "src/external/WETH9.sol";
import {
    DXD_ADDRESS, WETH_ADDRESS, MIN_SIGNERS_THRESHOLD
} from "src/Redemptor.sol";
import {RedemptorHarness} from "tests/harnesses/RedemptorHarness.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Base test fixture
/// @dev A contract that acts as a base text fixture.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
abstract contract BaseTestFixture is Test {
    RedemptorHarness internal redemptorHarness;

    function setUp() external {
        bool _forked = _handleFork();
        if (!_forked) {
            vm.etch(
                DXD_ADDRESS,
                address(new ERC20PresetMinterPauser("DXdao", "DXD")).code
            );
            vm.etch(WETH_ADDRESS, address(new WETH9()).code);
        }
        address[] memory _initialSigners = new address[](0);
        redemptorHarness =
            new RedemptorHarness(address(1234), MIN_SIGNERS_THRESHOLD, _initialSigners);
    }

    function _handleFork() private returns (bool) {
        try vm.envString("RPC_ENDPOINT") returns (string memory _forkUrl) {
            vm.createSelectFork(_forkUrl);
            return true;
        } catch {
            return false;
        }
    }
}
