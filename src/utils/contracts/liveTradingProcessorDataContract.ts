import { TBD_ADDRESS } from 'constants/network';
import { Network } from 'enums/network';
import { ContractData } from 'types/viem';

const liveTradingProcessorDataContract: ContractData = {
    addresses: {
        [Network.OptimismMainnet]: TBD_ADDRESS,
        [Network.Arbitrum]: TBD_ADDRESS,
        [Network.Base]: TBD_ADDRESS,
        [Network.OptimismSepolia]: '0xE7fB0a3Cb69dC503464147A6836df7E69023E09C',
    },
    abi: [
        {
            inputs: [],
            name: 'InvalidInitialization',
            type: 'error',
        },
        {
            inputs: [],
            name: 'NotInitializing',
            type: 'error',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint64',
                    name: 'version',
                    type: 'uint64',
                },
            ],
            name: 'Initialized',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'liveTradingProcessor',
                    type: 'address',
                },
            ],
            name: 'LiveTradingProcessorChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'oldOwner',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'newOwner',
                    type: 'address',
                },
            ],
            name: 'OwnerChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'newOwner',
                    type: 'address',
                },
            ],
            name: 'OwnerNominated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'bool',
                    name: 'isPaused',
                    type: 'bool',
                },
            ],
            name: 'PauseChanged',
            type: 'event',
        },
        {
            inputs: [],
            name: 'acceptOwnership',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: 'user',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: '_batchSize',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: '_maxSize',
                    type: 'uint256',
                },
            ],
            name: 'getLatestRequestsDataPerUser',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'address',
                            name: 'user',
                            type: 'address',
                        },
                        {
                            internalType: 'bytes32',
                            name: 'requestId',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'bool',
                            name: 'isFulfilled',
                            type: 'bool',
                        },
                        {
                            internalType: 'uint256',
                            name: 'timestamp',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maturityTimestamp',
                            type: 'uint256',
                        },
                        {
                            internalType: 'string',
                            name: 'gameId',
                            type: 'string',
                        },
                        {
                            internalType: 'uint16',
                            name: 'sportId',
                            type: 'uint16',
                        },
                        {
                            internalType: 'uint16',
                            name: 'typeId',
                            type: 'uint16',
                        },
                        {
                            internalType: 'int24',
                            name: 'line',
                            type: 'int24',
                        },
                        {
                            internalType: 'uint8',
                            name: 'position',
                            type: 'uint8',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyInAmount',
                            type: 'uint256',
                        },
                    ],
                    internalType: 'struct LiveTradingProcessorData.RequestData[]',
                    name: 'requestsData',
                    type: 'tuple[]',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: '_startIndex',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: '_pageSize',
                    type: 'uint256',
                },
            ],
            name: 'getRequestsData',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'address',
                            name: 'user',
                            type: 'address',
                        },
                        {
                            internalType: 'bytes32',
                            name: 'requestId',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'bool',
                            name: 'isFulfilled',
                            type: 'bool',
                        },
                        {
                            internalType: 'uint256',
                            name: 'timestamp',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maturityTimestamp',
                            type: 'uint256',
                        },
                        {
                            internalType: 'string',
                            name: 'gameId',
                            type: 'string',
                        },
                        {
                            internalType: 'uint16',
                            name: 'sportId',
                            type: 'uint16',
                        },
                        {
                            internalType: 'uint16',
                            name: 'typeId',
                            type: 'uint16',
                        },
                        {
                            internalType: 'int24',
                            name: 'line',
                            type: 'int24',
                        },
                        {
                            internalType: 'uint8',
                            name: 'position',
                            type: 'uint8',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyInAmount',
                            type: 'uint256',
                        },
                    ],
                    internalType: 'struct LiveTradingProcessorData.RequestData[]',
                    name: 'requestsData',
                    type: 'tuple[]',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_owner',
                    type: 'address',
                },
                {
                    internalType: 'contract ILiveTradingProcessor',
                    name: '_liveTradingProcessor',
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
            name: 'lastPauseTime',
            outputs: [
                {
                    internalType: 'uint256',
                    name: '',
                    type: 'uint256',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'liveTradingProcessor',
            outputs: [
                {
                    internalType: 'contract ILiveTradingProcessor',
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
                    name: '_owner',
                    type: 'address',
                },
            ],
            name: 'nominateNewOwner',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'nominatedOwner',
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
            name: 'owner',
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
            name: 'paused',
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
        {
            inputs: [
                {
                    internalType: 'contract ILiveTradingProcessor',
                    name: '_liveTradingProcessor',
                    type: 'address',
                },
            ],
            name: 'setLiveTradingProcessor',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_owner',
                    type: 'address',
                },
            ],
            name: 'setOwner',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bool',
                    name: '_paused',
                    type: 'bool',
                },
            ],
            name: 'setPaused',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: 'proxyAddress',
                    type: 'address',
                },
            ],
            name: 'transferOwnershipAtInit',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ],
};

export default liveTradingProcessorDataContract;
