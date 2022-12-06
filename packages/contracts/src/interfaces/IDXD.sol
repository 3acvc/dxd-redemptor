// solhint-disable compiler-version
pragma solidity ^0.8.17;

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title IDXD
/// @dev A simple interface that represents the mainnet DXD contract.
/// Has permit and burn functions.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
interface IDXD {
    function burn(uint256 _amount) external;

    function permit(
        address holder,
        address spender,
        uint256 nonce,
        uint256 expiry,
        bool allowed,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}
