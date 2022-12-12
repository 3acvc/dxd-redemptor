export const REDEMPTOR_ABI = [
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_signersThreshold",
                type: "uint256",
            },
            {
                internalType: "address[]",
                name: "_initialSigners",
                type: "address[]",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "ETHTransferFailed",
        type: "error",
    },
    {
        inputs: [],
        name: "Forbidden",
        type: "error",
    },
    {
        inputs: [],
        name: "InvalidSigner",
        type: "error",
    },
    {
        inputs: [],
        name: "InvalidSignersThreshold",
        type: "error",
    },
    {
        inputs: [],
        name: "NotEnoughSignatures",
        type: "error",
    },
    {
        inputs: [],
        name: "SignerAlreadyAdded",
        type: "error",
    },
    {
        inputs: [],
        name: "SignerNotAdded",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address[]",
                name: "addedSigners",
                type: "address[]",
            },
        ],
        name: "AddSigners",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "redeemedDXD",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "circulatingDXDSupply",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "redeemedToken",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "redeemedTokenUSDPrice",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "redeemedAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "collateralUSDValue",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bytes[]",
                name: "signatures",
                type: "bytes[]",
            },
        ],
        name: "Redeem",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address[]",
                name: "removedSigners",
                type: "address[]",
            },
        ],
        name: "RemoveSigners",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "signersThreshold",
                type: "uint256",
            },
        ],
        name: "SetSignersThreshold",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "address[]",
                name: "_signers",
                type: "address[]",
            },
        ],
        name: "addSigners",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "domainSeparator",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "isSigner",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "redeemedDXD",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "circulatingDXDSupply",
                        type: "uint256",
                    },
                    {
                        internalType: "address",
                        name: "redeemedToken",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "redeemedTokenUSDPrice",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "redeemedAmount",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "collateralUSDValue",
                        type: "uint256",
                    },
                ],
                internalType: "struct OracleMessage",
                name: "_oracleMessage",
                type: "tuple",
            },
            {
                internalType: "bytes[]",
                name: "_signatures",
                type: "bytes[]",
            },
            {
                internalType: "uint256",
                name: "_permitExpiry",
                type: "uint256",
            },
            {
                internalType: "uint8",
                name: "_permitV",
                type: "uint8",
            },
            {
                internalType: "bytes32",
                name: "_permitR",
                type: "bytes32",
            },
            {
                internalType: "bytes32",
                name: "_permitS",
                type: "bytes32",
            },
        ],
        name: "redeem",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address[]",
                name: "_signers",
                type: "address[]",
            },
        ],
        name: "removeSigners",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint16",
                name: "_signersThreshold",
                type: "uint16",
            },
        ],
        name: "setSignersThreshold",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "signersAmount",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "signersThreshold",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        stateMutability: "payable",
        type: "receive",
    },
] as const;
