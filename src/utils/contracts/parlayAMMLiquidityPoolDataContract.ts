import { Network } from 'enums/network';

const parlayAMMLiquidityPoolDataContract = {
    addresses: {
        [Network.OptimismMainnet]: '0x6d4393FAd7A2928c10cdD0bcdd7702B39086d8b2',
        [Network.Arbitrum]: '0xB5F1924136d7A72C3E5E746Ba2E23A3bfd499097',
        [Network.Base]: '0xd7718Fb45Df5Cef74793444DAC32EB43ab9C41E8',
        [Network.OptimismSepolia]: '',
    },
    abi: [
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
                    internalType: 'contract ParlayAMMLiquidityPool',
                    name: 'liquidityPool',
                    type: 'address',
                },
            ],
            name: 'getLiquidityPoolData',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'bool',
                            name: 'started',
                            type: 'bool',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxAllowedDeposit',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'round',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'totalDeposited',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'minDepositAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxAllowedUsers',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'usersCurrentlyInPool',
                            type: 'uint256',
                        },
                        {
                            internalType: 'bool',
                            name: 'canCloseCurrentRound',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'paused',
                            type: 'bool',
                        },
                        {
                            internalType: 'uint256',
                            name: 'roundLength',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'stakedThalesMultiplier',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'allocationCurrentRound',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'lifetimePnl',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'roundEndTime',
                            type: 'uint256',
                        },
                    ],
                    internalType: 'struct ParlayAMMLiquidityPoolData.LiquidityPoolData',
                    name: '',
                    type: 'tuple',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'contract ParlayAMMLiquidityPool',
                    name: 'liquidityPool',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: 'user',
                    type: 'address',
                },
            ],
            name: 'getUserLiquidityPoolData',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'uint256',
                            name: 'balanceCurrentRound',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'balanceNextRound',
                            type: 'uint256',
                        },
                        {
                            internalType: 'bool',
                            name: 'withdrawalRequested',
                            type: 'bool',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxDeposit',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'availableToDeposit',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'stakedThales',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'withdrawalShare',
                            type: 'uint256',
                        },
                    ],
                    internalType: 'struct ParlayAMMLiquidityPoolData.UserLiquidityPoolData',
                    name: '',
                    type: 'tuple',
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

export default parlayAMMLiquidityPoolDataContract;
