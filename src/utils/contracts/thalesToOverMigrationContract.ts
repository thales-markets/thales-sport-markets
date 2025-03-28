import { TBD_ADDRESS } from 'constants/network';
import { Network } from 'enums/network';
import { ContractData } from 'types/viem';

const thalesToOverMigrationContract: ContractData = {
    addresses: {
        [Network.OptimismMainnet]: '0xd71841fcF6F5862Ceb69d8432800D0A02B1d3cb6',
        [Network.Arbitrum]: '0xb308f26b7dc1eCdB52ce05dceb10818c41BA75E8',
        [Network.Base]: '0x2152A0bC2DE4a1D4FA1E81F60e094C44ec24Fe2D',
        [Network.OptimismSepolia]: TBD_ADDRESS,
    },
    abi: [
        {
            inputs: [{ internalType: 'address', name: 'target', type: 'address' }],
            name: 'AddressEmptyCode',
            type: 'error',
        },
        {
            inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
            name: 'AddressInsufficientBalance',
            type: 'error',
        },
        { inputs: [], name: 'AmountIsZero', type: 'error' },
        { inputs: [], name: 'FailedInnerCall', type: 'error' },
        { inputs: [], name: 'InvalidInitialization', type: 'error' },
        { inputs: [], name: 'NotInitializing', type: 'error' },
        {
            inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
            name: 'SafeERC20FailedOperation',
            type: 'error',
        },
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
        {
            anonymous: false,
            inputs: [{ indexed: true, internalType: 'address', name: 'overAddress', type: 'address' }],
            name: 'SetOverToken',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: true, internalType: 'address', name: 'thalesAddress', type: 'address' }],
            name: 'SetThalesToken',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: 'address', name: 'user', type: 'address' },
                { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            name: 'ThalesToOverMigrated',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: 'address', name: 'collateral', type: 'address' },
                { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            name: 'WithdrawnCollateral',
            type: 'event',
        },
        { inputs: [], name: 'acceptOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
        { inputs: [], name: 'initNonReentrant', outputs: [], stateMutability: 'nonpayable', type: 'function' },
        {
            inputs: [
                { internalType: 'address', name: '_owner', type: 'address' },
                { internalType: 'address', name: '_thalesAddress', type: 'address' },
                { internalType: 'address', name: '_overAddress', type: 'address' },
            ],
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
            inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
            name: 'migrateThalesToOver',
            outputs: [],
            stateMutability: 'nonpayable',
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
            name: 'overToken',
            outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
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
            inputs: [{ internalType: 'address', name: '_overAddress', type: 'address' }],
            name: 'setOverToken',
            outputs: [],
            stateMutability: 'nonpayable',
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
            inputs: [{ internalType: 'address', name: '_thalesAddress', type: 'address' }],
            name: 'setThalesToken',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'thalesToken',
            outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: 'proxyAddress', type: 'address' }],
            name: 'transferOwnershipAtInit',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: '_collateral', type: 'address' },
                { internalType: 'uint256', name: '_amount', type: 'uint256' },
            ],
            name: 'withdrawCollateral',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ],
};

export default thalesToOverMigrationContract;
