import { Network } from 'enums/network';

const sportsAMMDataContract = {
    addresses: {
        [Network.OptimismMainnet]: '',
        [Network.OptimismGoerli]: '',
        [Network.Arbitrum]: '',
        [Network.Base]: '',
        [Network.OptimismSepolia]: '0x86e1b303ad6bff1641add957872f28585cc11b0b',
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
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'sportsAMM',
                    type: 'address',
                },
            ],
            name: 'SportAMMChanged',
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
            ],
            name: 'getActiveTicketsDataPerUser',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'address',
                            name: 'id',
                            type: 'address',
                        },
                        {
                            components: [
                                {
                                    internalType: 'bytes32',
                                    name: 'gameId',
                                    type: 'bytes32',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'sportId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'childId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'playerPropsId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint256',
                                    name: 'maturity',
                                    type: 'uint256',
                                },
                                {
                                    internalType: 'int24',
                                    name: 'line',
                                    type: 'int24',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'playerId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint8',
                                    name: 'position',
                                    type: 'uint8',
                                },
                                {
                                    internalType: 'uint256',
                                    name: 'odd',
                                    type: 'uint256',
                                },
                                {
                                    components: [
                                        {
                                            internalType: 'uint16',
                                            name: 'childId',
                                            type: 'uint16',
                                        },
                                        {
                                            internalType: 'uint8',
                                            name: 'position',
                                            type: 'uint8',
                                        },
                                        {
                                            internalType: 'int24',
                                            name: 'line',
                                            type: 'int24',
                                        },
                                    ],
                                    internalType: 'struct ISportsAMMV2.CombinedPosition[]',
                                    name: 'combinedPositions',
                                    type: 'tuple[]',
                                },
                            ],
                            internalType: 'struct SportsAMMV2Data.GameData[]',
                            name: 'gamesData',
                            type: 'tuple[]',
                        },
                        {
                            components: [
                                {
                                    internalType: 'bool',
                                    name: 'isResolved',
                                    type: 'bool',
                                },
                                {
                                    internalType: 'bool',
                                    name: 'isCancelled',
                                    type: 'bool',
                                },
                                {
                                    components: [
                                        {
                                            internalType: 'uint24',
                                            name: 'homeScore',
                                            type: 'uint24',
                                        },
                                        {
                                            internalType: 'uint24',
                                            name: 'awayScore',
                                            type: 'uint24',
                                        },
                                    ],
                                    internalType: 'struct ISportsAMMV2.GameScore',
                                    name: 'score',
                                    type: 'tuple',
                                },
                                {
                                    internalType: 'enum ISportsAMMV2.GameResult',
                                    name: 'result',
                                    type: 'uint8',
                                },
                            ],
                            internalType: 'struct SportsAMMV2Data.GameStatus[]',
                            name: 'gamesStatus',
                            type: 'tuple[]',
                        },
                        {
                            internalType: 'address',
                            name: 'ticketOwner',
                            type: 'address',
                        },
                        {
                            internalType: 'address',
                            name: 'ticketCreator',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyInAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyInAmountAfterFees',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'totalQuote',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'numOfGames',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'expiry',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'createdAt',
                            type: 'uint256',
                        },
                        {
                            internalType: 'bool',
                            name: 'resolved',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'paused',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'cancelled',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'isLost',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'isUserTheWinner',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'isExercisable',
                            type: 'bool',
                        },
                    ],
                    internalType: 'struct SportsAMMV2Data.TicketData[]',
                    name: '',
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
                    name: 'user',
                    type: 'address',
                },
            ],
            name: 'getResolvedTicketsDataPerUser',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'address',
                            name: 'id',
                            type: 'address',
                        },
                        {
                            components: [
                                {
                                    internalType: 'bytes32',
                                    name: 'gameId',
                                    type: 'bytes32',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'sportId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'childId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'playerPropsId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint256',
                                    name: 'maturity',
                                    type: 'uint256',
                                },
                                {
                                    internalType: 'int24',
                                    name: 'line',
                                    type: 'int24',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'playerId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint8',
                                    name: 'position',
                                    type: 'uint8',
                                },
                                {
                                    internalType: 'uint256',
                                    name: 'odd',
                                    type: 'uint256',
                                },
                                {
                                    components: [
                                        {
                                            internalType: 'uint16',
                                            name: 'childId',
                                            type: 'uint16',
                                        },
                                        {
                                            internalType: 'uint8',
                                            name: 'position',
                                            type: 'uint8',
                                        },
                                        {
                                            internalType: 'int24',
                                            name: 'line',
                                            type: 'int24',
                                        },
                                    ],
                                    internalType: 'struct ISportsAMMV2.CombinedPosition[]',
                                    name: 'combinedPositions',
                                    type: 'tuple[]',
                                },
                            ],
                            internalType: 'struct SportsAMMV2Data.GameData[]',
                            name: 'gamesData',
                            type: 'tuple[]',
                        },
                        {
                            components: [
                                {
                                    internalType: 'bool',
                                    name: 'isResolved',
                                    type: 'bool',
                                },
                                {
                                    internalType: 'bool',
                                    name: 'isCancelled',
                                    type: 'bool',
                                },
                                {
                                    components: [
                                        {
                                            internalType: 'uint24',
                                            name: 'homeScore',
                                            type: 'uint24',
                                        },
                                        {
                                            internalType: 'uint24',
                                            name: 'awayScore',
                                            type: 'uint24',
                                        },
                                    ],
                                    internalType: 'struct ISportsAMMV2.GameScore',
                                    name: 'score',
                                    type: 'tuple',
                                },
                                {
                                    internalType: 'enum ISportsAMMV2.GameResult',
                                    name: 'result',
                                    type: 'uint8',
                                },
                            ],
                            internalType: 'struct SportsAMMV2Data.GameStatus[]',
                            name: 'gamesStatus',
                            type: 'tuple[]',
                        },
                        {
                            internalType: 'address',
                            name: 'ticketOwner',
                            type: 'address',
                        },
                        {
                            internalType: 'address',
                            name: 'ticketCreator',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyInAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyInAmountAfterFees',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'totalQuote',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'numOfGames',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'expiry',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'createdAt',
                            type: 'uint256',
                        },
                        {
                            internalType: 'bool',
                            name: 'resolved',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'paused',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'cancelled',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'isLost',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'isUserTheWinner',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'isExercisable',
                            type: 'bool',
                        },
                    ],
                    internalType: 'struct SportsAMMV2Data.TicketData[]',
                    name: '',
                    type: 'tuple[]',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'getSportsAMMParameters',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'uint256',
                            name: 'minBuyInAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxTicketSize',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxSupportedAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxSupportedOdds',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'safeBoxFee',
                            type: 'uint256',
                        },
                    ],
                    internalType: 'struct SportsAMMV2Data.SportsAMMParameters',
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
                    internalType: 'address[]',
                    name: 'ticketsArray',
                    type: 'address[]',
                },
            ],
            name: 'getTicketsData',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'address',
                            name: 'id',
                            type: 'address',
                        },
                        {
                            components: [
                                {
                                    internalType: 'bytes32',
                                    name: 'gameId',
                                    type: 'bytes32',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'sportId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'childId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'playerPropsId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint256',
                                    name: 'maturity',
                                    type: 'uint256',
                                },
                                {
                                    internalType: 'int24',
                                    name: 'line',
                                    type: 'int24',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'playerId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint8',
                                    name: 'position',
                                    type: 'uint8',
                                },
                                {
                                    internalType: 'uint256',
                                    name: 'odd',
                                    type: 'uint256',
                                },
                                {
                                    components: [
                                        {
                                            internalType: 'uint16',
                                            name: 'childId',
                                            type: 'uint16',
                                        },
                                        {
                                            internalType: 'uint8',
                                            name: 'position',
                                            type: 'uint8',
                                        },
                                        {
                                            internalType: 'int24',
                                            name: 'line',
                                            type: 'int24',
                                        },
                                    ],
                                    internalType: 'struct ISportsAMMV2.CombinedPosition[]',
                                    name: 'combinedPositions',
                                    type: 'tuple[]',
                                },
                            ],
                            internalType: 'struct SportsAMMV2Data.GameData[]',
                            name: 'gamesData',
                            type: 'tuple[]',
                        },
                        {
                            components: [
                                {
                                    internalType: 'bool',
                                    name: 'isResolved',
                                    type: 'bool',
                                },
                                {
                                    internalType: 'bool',
                                    name: 'isCancelled',
                                    type: 'bool',
                                },
                                {
                                    components: [
                                        {
                                            internalType: 'uint24',
                                            name: 'homeScore',
                                            type: 'uint24',
                                        },
                                        {
                                            internalType: 'uint24',
                                            name: 'awayScore',
                                            type: 'uint24',
                                        },
                                    ],
                                    internalType: 'struct ISportsAMMV2.GameScore',
                                    name: 'score',
                                    type: 'tuple',
                                },
                                {
                                    internalType: 'enum ISportsAMMV2.GameResult',
                                    name: 'result',
                                    type: 'uint8',
                                },
                            ],
                            internalType: 'struct SportsAMMV2Data.GameStatus[]',
                            name: 'gamesStatus',
                            type: 'tuple[]',
                        },
                        {
                            internalType: 'address',
                            name: 'ticketOwner',
                            type: 'address',
                        },
                        {
                            internalType: 'address',
                            name: 'ticketCreator',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyInAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyInAmountAfterFees',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'totalQuote',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'numOfGames',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'expiry',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'createdAt',
                            type: 'uint256',
                        },
                        {
                            internalType: 'bool',
                            name: 'resolved',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'paused',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'cancelled',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'isLost',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'isUserTheWinner',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'isExercisable',
                            type: 'bool',
                        },
                    ],
                    internalType: 'struct SportsAMMV2Data.TicketData[]',
                    name: '',
                    type: 'tuple[]',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'bytes32',
                    name: 'gameId',
                    type: 'bytes32',
                },
            ],
            name: 'getTicketsDataPerGame',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'address',
                            name: 'id',
                            type: 'address',
                        },
                        {
                            components: [
                                {
                                    internalType: 'bytes32',
                                    name: 'gameId',
                                    type: 'bytes32',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'sportId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'childId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'playerPropsId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint256',
                                    name: 'maturity',
                                    type: 'uint256',
                                },
                                {
                                    internalType: 'int24',
                                    name: 'line',
                                    type: 'int24',
                                },
                                {
                                    internalType: 'uint16',
                                    name: 'playerId',
                                    type: 'uint16',
                                },
                                {
                                    internalType: 'uint8',
                                    name: 'position',
                                    type: 'uint8',
                                },
                                {
                                    internalType: 'uint256',
                                    name: 'odd',
                                    type: 'uint256',
                                },
                                {
                                    components: [
                                        {
                                            internalType: 'uint16',
                                            name: 'childId',
                                            type: 'uint16',
                                        },
                                        {
                                            internalType: 'uint8',
                                            name: 'position',
                                            type: 'uint8',
                                        },
                                        {
                                            internalType: 'int24',
                                            name: 'line',
                                            type: 'int24',
                                        },
                                    ],
                                    internalType: 'struct ISportsAMMV2.CombinedPosition[]',
                                    name: 'combinedPositions',
                                    type: 'tuple[]',
                                },
                            ],
                            internalType: 'struct SportsAMMV2Data.GameData[]',
                            name: 'gamesData',
                            type: 'tuple[]',
                        },
                        {
                            components: [
                                {
                                    internalType: 'bool',
                                    name: 'isResolved',
                                    type: 'bool',
                                },
                                {
                                    internalType: 'bool',
                                    name: 'isCancelled',
                                    type: 'bool',
                                },
                                {
                                    components: [
                                        {
                                            internalType: 'uint24',
                                            name: 'homeScore',
                                            type: 'uint24',
                                        },
                                        {
                                            internalType: 'uint24',
                                            name: 'awayScore',
                                            type: 'uint24',
                                        },
                                    ],
                                    internalType: 'struct ISportsAMMV2.GameScore',
                                    name: 'score',
                                    type: 'tuple',
                                },
                                {
                                    internalType: 'enum ISportsAMMV2.GameResult',
                                    name: 'result',
                                    type: 'uint8',
                                },
                            ],
                            internalType: 'struct SportsAMMV2Data.GameStatus[]',
                            name: 'gamesStatus',
                            type: 'tuple[]',
                        },
                        {
                            internalType: 'address',
                            name: 'ticketOwner',
                            type: 'address',
                        },
                        {
                            internalType: 'address',
                            name: 'ticketCreator',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyInAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyInAmountAfterFees',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'totalQuote',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'numOfGames',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'expiry',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'createdAt',
                            type: 'uint256',
                        },
                        {
                            internalType: 'bool',
                            name: 'resolved',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'paused',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'cancelled',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'isLost',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'isUserTheWinner',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'isExercisable',
                            type: 'bool',
                        },
                    ],
                    internalType: 'struct SportsAMMV2Data.TicketData[]',
                    name: '',
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
                    internalType: 'address',
                    name: '_sportsAMM',
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
                    internalType: 'contract ISportsAMMV2',
                    name: '_sportsAMM',
                    type: 'address',
                },
            ],
            name: 'setSportsAMM',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'sportsAMM',
            outputs: [
                {
                    internalType: 'contract ISportsAMMV2',
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

export default sportsAMMDataContract;
