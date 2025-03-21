import { Network } from 'enums/network';
import { ContractData } from 'types/viem';

const sportsAMMV2ResultManagerContract: ContractData = {
    addresses: {
        [Network.OptimismMainnet]: '0x04fA33175c71e6626281C4261fC1e2b998DB3235',
        [Network.Arbitrum]: '0xE8eB19E45608B90Af2046a44A0d6a736FCc8D337',
        [Network.Base]: '0xe4123FdC540FD3f969d71eC14e0839dC63A11AE6',
        [Network.OptimismSepolia]: '0x6f76379C010806F9f05DBF870CBCf892687577A7',
    },
    abi: [
        { inputs: [], name: 'InvalidInitialization', type: 'error' },
        { inputs: [], name: 'NotInitializing', type: 'error' },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'bytes32', name: 'gameId', type: 'bytes32' }],
            name: 'GameCancelled',
            type: 'event',
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
                { indexed: false, internalType: 'bytes32', name: 'gameId', type: 'bytes32' },
                { indexed: false, internalType: 'uint16', name: 'typeId', type: 'uint16' },
                { indexed: false, internalType: 'uint24', name: 'playerId', type: 'uint24' },
                { indexed: false, internalType: 'int24', name: 'line', type: 'int24' },
            ],
            name: 'MarketExplicitlyCancelled',
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
            inputs: [
                { indexed: false, internalType: 'uint16', name: 'marketTypeId', type: 'uint16' },
                { indexed: false, internalType: 'uint256', name: 'resultType', type: 'uint256' },
            ],
            name: 'ResultTypePerMarketTypeSet',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                { indexed: false, internalType: 'bytes32', name: 'gameId', type: 'bytes32' },
                { indexed: false, internalType: 'uint16', name: 'typeId', type: 'uint16' },
                { indexed: false, internalType: 'uint24', name: 'playerId', type: 'uint24' },
                { indexed: false, internalType: 'int24[]', name: 'result', type: 'int24[]' },
            ],
            name: 'ResultsPerMarketSet',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: 'resolver', type: 'address' }],
            name: 'SetChainlinkResolver',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'uint256', name: 'numOfTicketsToExercise', type: 'uint256' }],
            name: 'SetNumOfTicketsToExerciseOnGameResolution',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [{ indexed: false, internalType: 'address', name: 'manager', type: 'address' }],
            name: 'SetSportsManager',
            type: 'event',
        },
        {
            inputs: [],
            name: 'CANCEL_ID',
            outputs: [{ internalType: 'int24', name: '', type: 'int24' }],
            stateMutability: 'view',
            type: 'function',
        },
        { inputs: [], name: 'acceptOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
        {
            inputs: [
                { internalType: 'bytes32', name: '', type: 'bytes32' },
                { internalType: 'uint256', name: '', type: 'uint256' },
                { internalType: 'uint256', name: '', type: 'uint256' },
            ],
            name: 'areResultsPerMarketSet',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bytes32', name: '_gameId', type: 'bytes32' }],
            name: 'cancelGame',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bytes32[]', name: '_gameIds', type: 'bytes32[]' }],
            name: 'cancelGames',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: '_gameId', type: 'bytes32' },
                { internalType: 'uint16', name: '_typeId', type: 'uint16' },
                { internalType: 'uint24', name: '_playerId', type: 'uint24' },
                { internalType: 'int24', name: '_line', type: 'int24' },
            ],
            name: 'cancelMarket',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32[]', name: '_gameIds', type: 'bytes32[]' },
                { internalType: 'uint16[]', name: '_typeIds', type: 'uint16[]' },
                { internalType: 'uint24[]', name: '_playerIds', type: 'uint24[]' },
                { internalType: 'int24[]', name: '_lines', type: 'int24[]' },
            ],
            name: 'cancelMarkets',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'chainlinkResolver',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: '_gameId', type: 'bytes32' },
                { internalType: 'uint16', name: '_typeId', type: 'uint16' },
                { internalType: 'uint24', name: '_playerId', type: 'uint24' },
                { internalType: 'int24', name: '_line', type: 'int24' },
                { internalType: 'uint256', name: '_position', type: 'uint256' },
                {
                    components: [
                        { internalType: 'uint16', name: 'typeId', type: 'uint16' },
                        { internalType: 'uint8', name: 'position', type: 'uint8' },
                        { internalType: 'int24', name: 'line', type: 'int24' },
                    ],
                    internalType: 'struct ISportsAMMV2.CombinedPosition[]',
                    name: '_combinedPositions',
                    type: 'tuple[]',
                },
            ],
            name: 'getMarketPositionStatus',
            outputs: [
                { internalType: 'enum ISportsAMMV2ResultManager.MarketPositionStatus', name: 'status', type: 'uint8' },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: '_gameId', type: 'bytes32' },
                { internalType: 'uint16', name: '_typeId', type: 'uint16' },
                { internalType: 'uint24', name: '_playerId', type: 'uint24' },
            ],
            name: 'getResultsPerMarket',
            outputs: [{ internalType: 'int24[]', name: 'results', type: 'int24[]' }],
            stateMutability: 'view',
            type: 'function',
        },
        { inputs: [], name: 'initNonReentrant', outputs: [], stateMutability: 'nonpayable', type: 'function' },
        {
            inputs: [
                { internalType: 'address', name: '_owner', type: 'address' },
                { internalType: 'contract ISportsAMMV2Manager', name: '_manager', type: 'address' },
            ],
            name: 'initialize',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: '_gameId', type: 'bytes32' },
                { internalType: 'uint16', name: '_typeId', type: 'uint16' },
                { internalType: 'uint24', name: '_playerId', type: 'uint24' },
                { internalType: 'int24', name: '_line', type: 'int24' },
                { internalType: 'uint256', name: '_position', type: 'uint256' },
                {
                    components: [
                        { internalType: 'uint16', name: 'typeId', type: 'uint16' },
                        { internalType: 'uint8', name: 'position', type: 'uint8' },
                        { internalType: 'int24', name: 'line', type: 'int24' },
                    ],
                    internalType: 'struct ISportsAMMV2.CombinedPosition[]',
                    name: '_combinedPositions',
                    type: 'tuple[]',
                },
            ],
            name: 'isCancelledMarketPosition',
            outputs: [{ internalType: 'bool', name: 'isCancelled', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
            name: 'isGameCancelled',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: '_gameId', type: 'bytes32' },
                { internalType: 'uint16', name: '_typeId', type: 'uint16' },
                { internalType: 'uint24', name: '_playerId', type: 'uint24' },
                { internalType: 'int24', name: '_line', type: 'int24' },
                {
                    components: [
                        { internalType: 'uint16', name: 'typeId', type: 'uint16' },
                        { internalType: 'uint8', name: 'position', type: 'uint8' },
                        { internalType: 'int24', name: 'line', type: 'int24' },
                    ],
                    internalType: 'struct ISportsAMMV2.CombinedPosition[]',
                    name: 'combinedPositions',
                    type: 'tuple[]',
                },
            ],
            name: 'isMarketCancelled',
            outputs: [{ internalType: 'bool', name: 'isCancelled', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: '', type: 'bytes32' },
                { internalType: 'uint256', name: '', type: 'uint256' },
                { internalType: 'uint256', name: '', type: 'uint256' },
                { internalType: 'int256', name: '', type: 'int256' },
            ],
            name: 'isMarketExplicitlyCancelled',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: '_gameId', type: 'bytes32' },
                { internalType: 'uint16', name: '_typeId', type: 'uint16' },
                { internalType: 'uint24', name: '_playerId', type: 'uint24' },
                { internalType: 'int24', name: '_line', type: 'int24' },
                {
                    components: [
                        { internalType: 'uint16', name: 'typeId', type: 'uint16' },
                        { internalType: 'uint8', name: 'position', type: 'uint8' },
                        { internalType: 'int24', name: 'line', type: 'int24' },
                    ],
                    internalType: 'struct ISportsAMMV2.CombinedPosition[]',
                    name: 'combinedPositions',
                    type: 'tuple[]',
                },
            ],
            name: 'isMarketResolved',
            outputs: [{ internalType: 'bool', name: 'isResolved', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: '_gameId', type: 'bytes32' },
                { internalType: 'uint16', name: '_typeId', type: 'uint16' },
                { internalType: 'uint24', name: '_playerId', type: 'uint24' },
                { internalType: 'int24', name: '_line', type: 'int24' },
                { internalType: 'uint256', name: '_position', type: 'uint256' },
                {
                    components: [
                        { internalType: 'uint16', name: 'typeId', type: 'uint16' },
                        { internalType: 'uint8', name: 'position', type: 'uint8' },
                        { internalType: 'int24', name: 'line', type: 'int24' },
                    ],
                    internalType: 'struct ISportsAMMV2.CombinedPosition[]',
                    name: '_combinedPositions',
                    type: 'tuple[]',
                },
            ],
            name: 'isMarketResolvedAndPositionWinning',
            outputs: [
                { internalType: 'bool', name: 'isResolved', type: 'bool' },
                { internalType: 'bool', name: 'isWinning', type: 'bool' },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: '_gameId', type: 'bytes32' },
                { internalType: 'uint16', name: '_typeId', type: 'uint16' },
                { internalType: 'uint24', name: '_playerId', type: 'uint24' },
                { internalType: 'int24', name: '_line', type: 'int24' },
                { internalType: 'uint256', name: '_position', type: 'uint256' },
                {
                    components: [
                        { internalType: 'uint16', name: 'typeId', type: 'uint16' },
                        { internalType: 'uint8', name: 'position', type: 'uint8' },
                        { internalType: 'int24', name: 'line', type: 'int24' },
                    ],
                    internalType: 'struct ISportsAMMV2.CombinedPosition[]',
                    name: '_combinedPositions',
                    type: 'tuple[]',
                },
            ],
            name: 'isWinningMarketPosition',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
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
            inputs: [],
            name: 'manager',
            outputs: [{ internalType: 'contract ISportsAMMV2Manager', name: '', type: 'address' }],
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
            name: 'numOfTicketsToExerciseOnGameResolution',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
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
            inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            name: 'resultTypePerMarketType',
            outputs: [{ internalType: 'enum SportsAMMV2ResultManager.ResultType', name: '', type: 'uint8' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32', name: '', type: 'bytes32' },
                { internalType: 'uint256', name: '', type: 'uint256' },
                { internalType: 'uint256', name: '', type: 'uint256' },
                { internalType: 'uint256', name: '', type: 'uint256' },
            ],
            name: 'resultsPerMarket',
            outputs: [{ internalType: 'int24', name: '', type: 'int24' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_chainlinkResolver', type: 'address' }],
            name: 'setChainlinkResolver',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'uint256', name: '_numOfTicketsToExercise', type: 'uint256' }],
            name: 'setNumOfTicketsToExerciseOnGameResolution',
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
            inputs: [
                { internalType: 'uint16[]', name: '_marketTypeIds', type: 'uint16[]' },
                { internalType: 'uint256[]', name: '_resultTypes', type: 'uint256[]' },
            ],
            name: 'setResultTypesPerMarketTypes',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'bytes32[]', name: '_gameIds', type: 'bytes32[]' },
                { internalType: 'uint16[]', name: '_typeIds', type: 'uint16[]' },
                { internalType: 'uint24[]', name: '_playerIds', type: 'uint24[]' },
                { internalType: 'int24[][]', name: '_results', type: 'int24[][]' },
            ],
            name: 'setResultsPerMarkets',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: '_manager', type: 'address' }],
            name: 'setSportsManager',
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

export default sportsAMMV2ResultManagerContract;
