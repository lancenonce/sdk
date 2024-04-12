export const DoubleSigValidatorAbi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_validatorAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "NotImplemented",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "signer1",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "signer2",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "proofHash",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bool",
				"name": "valid",
				"type": "bool"
			}
		],
		"name": "SignatureVerification",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint48",
				"name": "validAfter",
				"type": "uint48"
			},
			{
				"indexed": false,
				"internalType": "uint48",
				"name": "validUntil",
				"type": "uint48"
			}
		],
		"name": "Validation",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "disable",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "_data",
				"type": "bytes"
			}
		],
		"name": "enable",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "caller",
				"type": "address"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "validCaller",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "hash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
			}
		],
		"name": "validateSignature",
		"outputs": [
			{
				"internalType": "ValidationData",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "sender",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "nonce",
						"type": "uint256"
					},
					{
						"internalType": "bytes",
						"name": "initCode",
						"type": "bytes"
					},
					{
						"internalType": "bytes",
						"name": "callData",
						"type": "bytes"
					},
					{
						"internalType": "uint256",
						"name": "callGasLimit",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "verificationGasLimit",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "preVerificationGas",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "maxFeePerGas",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "maxPriorityFeePerGas",
						"type": "uint256"
					},
					{
						"internalType": "bytes",
						"name": "paymasterAndData",
						"type": "bytes"
					},
					{
						"internalType": "bytes",
						"name": "signature",
						"type": "bytes"
					}
				],
				"internalType": "struct UserOperation",
				"name": "_userOp",
				"type": "tuple"
			},
			{
				"internalType": "bytes32",
				"name": "_userOpHash",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "missingFunds",
				"type": "uint256"
			}
		],
		"name": "validateUserOp",
		"outputs": [
			{
				"internalType": "ValidationData",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "validator",
		"outputs": [
			{
				"internalType": "contract Validator",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]