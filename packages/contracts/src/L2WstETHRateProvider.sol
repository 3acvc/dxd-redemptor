// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {IXReceiver} from "@connext/interfaces/core/IXReceiver.sol";

/**
 * @title WstethRateProvider
 * @notice Example destination contract that stores a wstETH rate and only allows source to update it.
 */
contract L2WstETHRateProvider is IXReceiver {
  // The Connext contract on this domain
  address public immutable connext =
    address(0x5bB83e95f63217CDa6aE3D181BA580Ef377D2109);

  // The domain ID where the source contract is deployed
  uint32 public immutable originDomain = 6648936; // Domain ID for Ethereum

  // The address of the source contract
  address public immutable source =
    address(0xb9f49Cd587d0a607901d4dC577b0b49aF520f3d1);

  uint256 private _rate;

  /** @notice A modifier for authenticated calls.
   * This is an important security consideration. If the target contract
   * function should be authenticated, it must check three things:
   *    1) The originating call comes from the expected origin domain.
   *    2) The originating call comes from the expected source contract.
   *    3) The call to this contract comes from Connext.
   */
  modifier onlySource(address _originSender, uint32 _origin) {
    require(
      _origin == originDomain &&
        _originSender == source &&
        msg.sender == connext,
      "Expected original caller to be source contract on origin domain and this to be called by Connext"
    );
    _;
  }

  /** @notice Authenticated receiver function.
   * @param _callData Calldata containing the new rate.
   */
  function xReceive(
    bytes32 _transferId,
    uint256 _amount,
    address _asset,
    address _originSender,
    uint32 _origin,
    bytes memory _callData
  ) external onlySource(_originSender, _origin) returns (bytes memory) {
    // Unpack the _callData
    uint256 newRate = abi.decode(_callData, (uint256));
    _updateRate(newRate);
  }

  /**
   * @notice Internal function to update the rate.
   * @param newRate The new rate.
   */
  function _updateRate(uint256 newRate) internal {
    _rate = newRate;
  }

  /** @notice Public function to get the current rate.
   * @return The current rate.
   */
  function getRate() public view returns (uint256) {
    return _rate;
  }
}
