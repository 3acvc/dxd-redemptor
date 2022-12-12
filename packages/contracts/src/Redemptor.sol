// solhint-disable compiler-version
pragma solidity ^0.8.17;

import {ECDSA} from "oz/utils/cryptography/ECDSA.sol";
import {IERC20} from "oz/token/ERC20/IERC20.sol";
import {SafeERC20} from "oz/token/ERC20/utils/SafeERC20.sol";
import {IDXD} from "src/interfaces/IDXD.sol";
import {IWETH} from "src/interfaces/IWETH.sol";
import {IRedemptor, OracleMessage} from "src/interfaces/IRedemptor.sol";

// errors
error InvalidSigner();
error NotEnoughSignatures();
error InvalidSignersThreshold();
error SignerNotAdded();
error SignerAlreadyAdded();
error Forbidden();
error ETHTransferFailed();
error NoSigners();

// constants
uint256 constant MAX_BPS = 10_000;
uint16 constant MIN_SIGNERS_THRESHOLD = 5000;
address constant ZERO_ADDRESS = address(0);
address constant AVATAR_ADDRESS =
    address(0x519b70055af55A007110B4Ff99b0eA33071c720a);
address constant WETH_ADDRESS =
    address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
address constant DXD_ADDRESS =
    address(0xa1d65E8fB6e87b60FECCBc582F7f97804B725521);
address constant ETH = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

bytes32 constant ORACLE_MESSAGE_TYPE_HASH = keccak256(
    "OracleMessage(uint256 redeemedDXD,uint256 circulatingDXDSupply,address redeemedToken,uint256 redeemedTokenUSDPrice,uint256 redeemedAmount,uint256 collateralUSDValue)"
);

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Redemptor
/// @dev A contract that carries out DXD redemptions depending on external price feeds.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract Redemptor is IRedemptor {
    using SafeERC20 for IERC20;

    bytes32 public immutable domainSeparator;
    uint256 public signersThreshold;
    uint256 public signersAmount;
    mapping(address => bool) public isSigner;

    event AddSigners(address[] addedSigners);
    event RemoveSigners(address[] removedSigners);
    event SetSignersThreshold(uint256 signersThreshold);
    event Redeem(
        uint256 redeemedDXD,
        uint256 circulatingDXDSupply,
        address redeemedToken,
        uint256 redeemedTokenUSDPrice,
        uint256 redeemedAmount,
        uint256 collateralUSDValue,
        bytes[] signatures
    );

    constructor(uint256 _signersThreshold, address[] memory _initialSigners) {
        _addSigners(_initialSigners);
        _validateSignersThreshold(_signersThreshold);
        // TODO: this can be computed offchain to save gas
        domainSeparator = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("DXD redemptor")),
                keccak256(bytes("1")),
                uint256(1),
                address(this)
            )
        );
        signersThreshold = _signersThreshold;
    }

    function addSigners(address[] memory _signers) external override {
        if (msg.sender != AVATAR_ADDRESS) revert Forbidden();
        _addSigners(_signers);
        emit AddSigners(_signers);
    }

    function removeSigners(address[] memory _signers) external override {
        if (msg.sender != AVATAR_ADDRESS) revert Forbidden();
        uint16 _signersLength = uint16(_signers.length);
        for (uint256 _i = 0; _i < _signersLength; _i++) {
            address _signer = _signers[_i];
            if (_signer == ZERO_ADDRESS) revert InvalidSigner();
            if (!isSigner[_signer]) revert SignerNotAdded();
            isSigner[_signer] = false;
        }
        unchecked {
            signersAmount -= _signersLength;
        }
        emit RemoveSigners(_signers);
    }

    function setSignersThreshold(uint16 _signersThreshold) external override {
        if (msg.sender != AVATAR_ADDRESS) revert Forbidden();
        _validateSignersThreshold(_signersThreshold);
        signersThreshold = _signersThreshold;
        emit SetSignersThreshold(_signersThreshold);
    }

    function redeem(
        OracleMessage calldata _oracleMessage,
        bytes[] calldata _signatures,
        uint256 _permitExpiry,
        uint8 _permitV,
        bytes32 _permitR,
        bytes32 _permitS
    ) external override {
        uint256 _signaturesLength = _signatures.length;
        if (_signaturesLength < _minimumSigners(signersAmount)) {
            revert NotEnoughSignatures();
        }

        bytes32 _digest = ECDSA.toTypedDataHash(
            domainSeparator, _oracleMessageHash(_oracleMessage)
        );
        for (uint256 _i = 0; _i < _signaturesLength; _i++) {
            address _signer = ECDSA.recover(_digest, _signatures[_i]);
            if (!isSigner[_signer]) revert InvalidSigner();
        }

        // avoid reentrancy by burning the tokens now
        IDXD(DXD_ADDRESS).permit(
            msg.sender,
            address(this),
            // TODO: investigate this nonce param, is it ok if it's constant 1?
            1,
            _permitExpiry,
            true,
            _permitV,
            _permitR,
            _permitS
        );
        IERC20(DXD_ADDRESS).safeTransferFrom(
            msg.sender, address(this), _oracleMessage.redeemedDXD
        );
        IDXD(DXD_ADDRESS).burn(_oracleMessage.redeemedDXD);

        emit Redeem(
            _oracleMessage.redeemedDXD,
            _oracleMessage.circulatingDXDSupply,
            _oracleMessage.redeemedToken,
            _oracleMessage.redeemedTokenUSDPrice,
            _oracleMessage.redeemedAmount,
            _oracleMessage.collateralUSDValue,
            _signatures
            );

        if (_oracleMessage.redeemedToken == ETH) {
            IERC20(WETH_ADDRESS).safeTransferFrom(
                AVATAR_ADDRESS, address(this), _oracleMessage.redeemedAmount
            );
            IWETH(WETH_ADDRESS).withdraw(_oracleMessage.redeemedAmount);
            bool _success;
            uint256 _redeemedAmount = _oracleMessage.redeemedAmount;
            // solhint-disable-next-line no-inline-assembly
            assembly {
                // solidity also gets us the return data, while this discards
                // it since we don't care as long as the call succeeds. this is cheaper
                _success := call(gas(), caller(), _redeemedAmount, 0, 0, 0, 0)
            }
            if (!_success) revert ETHTransferFailed();
        } else {
            IERC20(_oracleMessage.redeemedToken).safeTransferFrom(
                AVATAR_ADDRESS, msg.sender, _oracleMessage.redeemedAmount
            );
        }
    }

    function _addSigners(address[] memory _signers) internal {
        uint256 _signersLength = _signers.length;
        for (uint256 _i = 0; _i < _signersLength; _i++) {
            address _signer = _signers[_i];
            if (_signer == ZERO_ADDRESS) revert InvalidSigner();
            if (isSigner[_signer]) revert SignerAlreadyAdded();
            isSigner[_signer] = true;
        }
        unchecked {
            signersAmount += _signersLength;
        }
    }

    function _validateSignersThreshold(uint256 _threshold) internal pure {
        if (_threshold < MIN_SIGNERS_THRESHOLD) {
            revert InvalidSignersThreshold();
        }
    }

    function _minimumSigners(uint256 _totalSigners)
        internal
        view
        returns (uint256)
    {
        if (_totalSigners == 0) revert NoSigners();
        unchecked {
            uint256 _numerator = _totalSigners * signersThreshold; // gas optimization
            uint256 _minimum = _numerator / MAX_BPS;
            if (_numerator % MAX_BPS > 0) _minimum++;
            return _minimum;
        }
    }

    function _oracleMessageHash(OracleMessage calldata _oracleMessage)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encode(
                ORACLE_MESSAGE_TYPE_HASH,
                _oracleMessage.redeemedDXD,
                _oracleMessage.circulatingDXDSupply,
                _oracleMessage.redeemedToken,
                _oracleMessage.redeemedTokenUSDPrice,
                _oracleMessage.redeemedAmount,
                _oracleMessage.collateralUSDValue
            )
        );
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}
}
