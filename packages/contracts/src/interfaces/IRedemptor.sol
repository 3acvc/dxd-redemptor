// solhint-disable compiler-version
pragma solidity ^0.8.17;

struct OracleMessage {
    uint256 redeemedDXD;
    uint256 circulatingDXDSupply;
    address redeemedToken;
    uint256 redeemedTokenUSDPrice;
    uint256 redeemedAmount;
    uint256 collateralUSDValue;
}

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title IRedemptor
/// @dev A simple interface for the redemptor contract.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
interface IRedemptor {
    function addSigners(address[] memory _signers) external;

    function removeSigners(address[] memory _signers) external;

    function setSignersThreshold(uint16 _signersThreshold) external;

    function redeem(
        OracleMessage calldata _oracleMessage,
        bytes[] calldata _signatures,
        uint256 _permitNonce,
        uint256 _permitExpiry,
        uint8 _permitV,
        bytes32 _permitR,
        bytes32 _permitS
    ) external;
}
