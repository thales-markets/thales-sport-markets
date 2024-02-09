import { Network } from 'enums/network';

const liquidityPoolDataContract = {
    addresses: {
        [Network.OptimismMainnet]: '0x23823f1C7C4AE2Acef3bCCFCD5F282AE078150C2',
        [Network.OptimismGoerli]: '0xB0b68F811Eb18E63aD942A7EcAE038715d4026c6',
        [Network.Arbitrum]: '0x230893C24804B89D0ec3FFfFa243CE32C6b6541B',
        [Network.Base]: '0x25E9513a00d53e8a0CB2005A48fB0031F6141325',
        [Network.OptimismSepolia]: '',
    },
    abi: [
        {
            anonymous: false,
            inputs: [
                { indexed: false, internalType: 'address', name: 'oldOwner', type: 'address' },
                { indexed: false, internalType: 'address', name: 'newOwner', type: 'address' },
            ],
            name: 'OwnerChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: 'newOwner', type: 'address' }],
            name: 'OwnerNominated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'bool', name: 'isPaused', type: 'bool' }],
            name: 'PauseChanged',
            type: 'event',
        },
        { inputs: [], name: 'acceptOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
        {
            inputs: [{ internalType: 'contract ThalesAMMLiquidityPool', name: 'liquidityPool', type: 'address' }],
            name: 'getLiquidityPoolData',
            outputs: [
                {
                    components: [
                        { internalType: 'bool', name: 'started', type: 'bool' },
                        { internalType: 'uint256', name: 'maxAllowedDeposit', type: 'uint256' },
                        { internalType: 'uint256', name: 'round', type: 'uint256' },
                        { internalType: 'uint256', name: 'totalDeposited', type: 'uint256' },
                        { internalType: 'uint256', name: 'minDepositAmount', type: 'uint256' },
                        { internalType: 'uint256', name: 'maxAllowedUsers', type: 'uint256' },
                        { internalType: 'uint256', name: 'usersCurrentlyInPool', type: 'uint256' },
                        { internalType: 'bool', name: 'canCloseCurrentRound', type: 'bool' },
                        { internalType: 'bool', name: 'paused', type: 'bool' },
                        { internalType: 'uint256', name: 'roundLength', type: 'uint256' },
                        { internalType: 'uint256', name: 'stakedThalesMultiplier', type: 'uint256' },
                        { internalType: 'uint256', name: 'allocationCurrentRound', type: 'uint256' },
                        { internalType: 'uint256', name: 'lifetimePnl', type: 'uint256' },
                        { internalType: 'uint256', name: 'roundEndTime', type: 'uint256' },
                    ],
                    internalType: 'struct ThalesAMMLiquidityPoolData.LiquidityPoolData',
                    name: '',
                    type: 'tuple',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'contract ThalesAMMLiquidityPool', name: 'liquidityPool', type: 'address' },
                { internalType: 'address', name: 'user', type: 'address' },
            ],
            name: 'getUserLiquidityPoolData',
            outputs: [
                {
                    components: [
                        { internalType: 'uint256', name: 'balanceCurrentRound', type: 'uint256' },
                        { internalType: 'uint256', name: 'balanceNextRound', type: 'uint256' },
                        { internalType: 'bool', name: 'withdrawalRequested', type: 'bool' },
                        { internalType: 'uint256', name: 'maxDeposit', type: 'uint256' },
                        { internalType: 'uint256', name: 'availableToDeposit', type: 'uint256' },
                        { internalType: 'uint256', name: 'stakedThales', type: 'uint256' },
                        { internalType: 'uint256', name: 'withdrawalShare', type: 'uint256' },
                    ],
                    internalType: 'struct ThalesAMMLiquidityPoolData.UserLiquidityPoolData',
                    name: '',
                    type: 'tuple',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
            name: 'initialize',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'lastPauseTime',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
            name: 'nominateNewOwner',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'nominatedOwner',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'owner',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'paused',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
            name: 'setOwner',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bool', name: '_paused', type: 'bool' }],
            name: 'setPaused',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: 'proxyAddress', type: 'address' }],
            name: 'transferOwnershipAtInit',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ],
};

export default liquidityPoolDataContract;
