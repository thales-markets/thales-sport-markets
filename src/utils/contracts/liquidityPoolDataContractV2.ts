import { Network } from 'enums/network';
import { ContractData } from 'types/viem';

const liquidityPoolDataContract: ContractData = {
    addresses: {
        [Network.OptimismMainnet]: '0x2152A0bC2DE4a1D4FA1E81F60e094C44ec24Fe2D',
        [Network.Arbitrum]: '0xcc4ED8cD7101B512B134360ED3cCB759caB33f17',
        [Network.OptimismSepolia]: '0xd61FA46d4e3CD47584a56fC20856Fdd197135756',
    },
    abi: [
        { inputs: [], name: 'InvalidInitialization', type: 'error' },
        { inputs: [], name: 'NotInitializing', type: 'error' },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'uint64', name: 'version', type: 'uint64' }],
            name: 'Initialized',
            type: 'event',
        },
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
            inputs: [{ internalType: 'contract SportsAMMV2LiquidityPool', name: 'liquidityPool', type: 'address' }],
            name: 'getCurrentRoundTickets',
            outputs: [{ internalType: 'address[]', name: 'tickets', type: 'address[]' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'contract SportsAMMV2LiquidityPool', name: 'liquidityPool', type: 'address' }],
            name: 'getCurrentRoundTicketsData',
            outputs: [
                {
                    components: [
                        { internalType: 'uint256', name: 'totalTickets', type: 'uint256' },
                        { internalType: 'uint256', name: 'numOfClosedTickets', type: 'uint256' },
                        { internalType: 'uint256', name: 'numOfPendingTickets', type: 'uint256' },
                        { internalType: 'address[]', name: 'pendingTickets', type: 'address[]' },
                    ],
                    internalType: 'struct SportsAMMV2LiquidityPoolData.RoundTicketsData',
                    name: '',
                    type: 'tuple',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'contract SportsAMMV2LiquidityPool', name: 'liquidityPool', type: 'address' }],
            name: 'getLiquidityPoolData',
            outputs: [
                {
                    components: [
                        { internalType: 'address', name: 'collateral', type: 'address' },
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
                        { internalType: 'uint256', name: 'allocationCurrentRound', type: 'uint256' },
                        { internalType: 'uint256', name: 'lifetimePnl', type: 'uint256' },
                        { internalType: 'uint256', name: 'roundEndTime', type: 'uint256' },
                    ],
                    internalType: 'struct SportsAMMV2LiquidityPoolData.LiquidityPoolData',
                    name: '',
                    type: 'tuple',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'contract SportsAMMV2LiquidityPool', name: 'liquidityPool', type: 'address' },
                { internalType: 'uint256', name: 'round', type: 'uint256' },
            ],
            name: 'getRoundTickets',
            outputs: [{ internalType: 'address[]', name: 'tickets', type: 'address[]' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'contract SportsAMMV2LiquidityPool', name: 'liquidityPool', type: 'address' },
                { internalType: 'address', name: 'user', type: 'address' },
            ],
            name: 'getUserLiquidityPoolData',
            outputs: [
                {
                    components: [
                        { internalType: 'uint256', name: 'balanceCurrentRound', type: 'uint256' },
                        { internalType: 'uint256', name: 'balanceNextRound', type: 'uint256' },
                        { internalType: 'bool', name: 'withdrawalRequested', type: 'bool' },
                        { internalType: 'uint256', name: 'withdrawalShare', type: 'uint256' },
                    ],
                    internalType: 'struct SportsAMMV2LiquidityPoolData.UserLiquidityPoolData',
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
