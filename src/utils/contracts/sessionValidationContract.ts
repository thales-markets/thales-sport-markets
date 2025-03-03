import { ZERO_ADDRESS } from 'constants/network';
import { NetworkId } from 'thales-utils';
import { ContractData } from 'types/viem';
import { Network } from '../../enums/network';

const sessionValidationContract: ContractData = {
    addresses: {
        [NetworkId.OptimismMainnet]: '0x867072511E55479E4c9A8f2C470FbCf3a37De0F7',
        [NetworkId.OptimismSepolia]: ZERO_ADDRESS,
        [NetworkId.Arbitrum]: '0xA530B2bB8894c02fdC0fD97D4B46fe3570Cb8752',
        [Network.Base]: '0x16C9A5AB1f4Ae48329DD5481174336DE52a55bc5',
    },
    abi: [
        {
            inputs: [],
            name: 'ECDSAInvalidSignature',
            type: 'error',
        },
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: 'length',
                    type: 'uint256',
                },
            ],
            name: 'ECDSAInvalidSignatureLength',
            type: 'error',
        },
        {
            inputs: [
                {
                    internalType: 'bytes32',
                    name: 's',
                    type: 'bytes32',
                },
            ],
            name: 'ECDSAInvalidSignatureS',
            type: 'error',
        },
        {
            inputs: [],
            name: 'chainedSpeedMarkets',
            outputs: [
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'creatorContract',
            outputs: [
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_creatorContract',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: '_speedMarketsAMM',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: '_chainedSpeedMarkets',
                    type: 'address',
                },
            ],
            name: 'initialize',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'speedMarketsAMM',
            outputs: [
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    components: [
                        {
                            internalType: 'address',
                            name: 'sender',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'nonce',
                            type: 'uint256',
                        },
                        {
                            internalType: 'bytes',
                            name: 'initCode',
                            type: 'bytes',
                        },
                        {
                            internalType: 'bytes',
                            name: 'callData',
                            type: 'bytes',
                        },
                        {
                            internalType: 'uint256',
                            name: 'callGasLimit',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'verificationGasLimit',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'preVerificationGas',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxFeePerGas',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxPriorityFeePerGas',
                            type: 'uint256',
                        },
                        {
                            internalType: 'bytes',
                            name: 'paymasterAndData',
                            type: 'bytes',
                        },
                        {
                            internalType: 'bytes',
                            name: 'signature',
                            type: 'bytes',
                        },
                    ],
                    internalType: 'struct SessionValidationModule.UserOperation',
                    name: '_op',
                    type: 'tuple',
                },
                {
                    internalType: 'bytes32',
                    name: '_userOpHash',
                    type: 'bytes32',
                },
                {
                    internalType: 'bytes',
                    name: '_sessionKeyData',
                    type: 'bytes',
                },
                {
                    internalType: 'bytes',
                    name: '_sessionKeySignature',
                    type: 'bytes',
                },
            ],
            name: 'validateSessionUserOp',
            outputs: [
                {
                    internalType: 'bool',
                    name: '',
                    type: 'bool',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
    ],
};

export default sessionValidationContract;
