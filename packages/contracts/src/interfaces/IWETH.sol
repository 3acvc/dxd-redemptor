// solhint-disable compiler-version
pragma solidity ^0.8.17;

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title IWETH
/// @dev A subset interface for WETH. It only exposes the withdraw function.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
interface IWETH {
    function withdraw(uint256 _amount) external;
}
