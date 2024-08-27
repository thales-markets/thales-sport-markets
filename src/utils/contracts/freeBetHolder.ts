import { Network } from 'enums/network';

const freeBetHolder = {
    addresses: {
        [Network.OptimismMainnet]: '0x8D18e68563d53be97c2ED791CA4354911F16A54B',
        [Network.Arbitrum]: '0xd1F2b87a9521315337855A132e5721cfe272BBd9',
        [Network.Base]: '',
        [Network.OptimismSepolia]: '0x97687d195A4296223ebCce238890b28Ba54cfD46',
    },
    abi: [
        {
            inputs: [
                {
                    internalType: 'address',
                    name: 'target',
                    type: 'address',
                },
            ],
            name: 'AddressEmptyCode',
            type: 'error',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: 'account',
                    type: 'address',
                },
            ],
            name: 'AddressInsufficientBalance',
            type: 'error',
        },
        {
            inputs: [],
            name: 'FailedInnerCall',
            type: 'error',
        },
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
            inputs: [
                {
                    internalType: 'address',
                    name: 'token',
                    type: 'address',
                },
            ],
            name: 'SafeERC20FailedOperation',
            type: 'error',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'collateral',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'bool',
                    name: 'supported',
                    type: 'bool',
                },
            ],
            name: 'CollateralSupportChanged',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'user',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'buyInAmount',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'bytes32',
                    name: 'requestId',
                    type: 'bytes32',
                },
            ],
            name: 'FreeBetLiveTradeRequested',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'ticket',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'user',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'earned',
                    type: 'uint256',
                },
            ],
            name: 'FreeBetTicketResolved',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'createdTicket',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'buyInAmount',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'user',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'bool',
                    name: 'isLive',
                    type: 'bool',
                },
            ],
            name: 'FreeBetTrade',
            type: 'event',
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
                    name: 'user',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'collateral',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'amount',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'funder',
                    type: 'address',
                },
            ],
            name: 'UserFunded',
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
                    name: '_collateral',
                    type: 'address',
                },
                {
                    internalType: 'bool',
                    name: '_supported',
                    type: 'bool',
                },
            ],
            name: 'addSupportedCollateral',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            name: 'balancePerUserAndCollateral',
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
                    internalType: 'bytes32',
                    name: 'requestId',
                    type: 'bytes32',
                },
                {
                    internalType: 'address',
                    name: '_createdTicket',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: '_buyInAmount',
                    type: 'uint256',
                },
                {
                    internalType: 'address',
                    name: '_collateral',
                    type: 'address',
                },
            ],
            name: 'confirmLiveTrade',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_resolvedTicket',
                    type: 'address',
                },
            ],
            name: 'confirmTicketResolved',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_user',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: '_collateral',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: '_amount',
                    type: 'uint256',
                },
            ],
            name: 'fund',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address[]',
                    name: '_users',
                    type: 'address[]',
                },
                {
                    internalType: 'address',
                    name: '_collateral',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: '_amountPerUser',
                    type: 'uint256',
                },
            ],
            name: 'fundBatch',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: '_index',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: '_pageSize',
                    type: 'uint256',
                },
                {
                    internalType: 'address',
                    name: '_user',
                    type: 'address',
                },
            ],
            name: 'getActiveTicketsPerUser',
            outputs: [
                {
                    internalType: 'address[]',
                    name: '',
                    type: 'address[]',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: '_index',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: '_pageSize',
                    type: 'uint256',
                },
                {
                    internalType: 'address',
                    name: '_user',
                    type: 'address',
                },
            ],
            name: 'getResolvedTicketsPerUser',
            outputs: [
                {
                    internalType: 'address[]',
                    name: '',
                    type: 'address[]',
                },
            ],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'initNonReentrant',
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
                {
                    internalType: 'address',
                    name: '_sportsAMMV2',
                    type: 'address',
                },
                {
                    internalType: 'address',
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
            inputs: [
                {
                    internalType: 'bytes32',
                    name: '',
                    type: 'bytes32',
                },
            ],
            name: 'liveRequestsPerUser',
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
            inputs: [
                {
                    internalType: 'address',
                    name: '_user',
                    type: 'address',
                },
            ],
            name: 'numOfActiveTicketsPerUser',
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
                    name: '_user',
                    type: 'address',
                },
            ],
            name: 'numOfResolvedTicketsPerUser',
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
            inputs: [
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            name: 'paidPerTicket',
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
                    internalType: 'contract IERC20',
                    name: '_collateral',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: '_amount',
                    type: 'uint256',
                },
            ],
            name: 'retrieveFunds',
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
                    name: '',
                    type: 'address',
                },
            ],
            name: 'supportedCollateral',
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
                    name: '',
                    type: 'address',
                },
            ],
            name: 'ticketToUser',
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
                            name: 'typeId',
                            type: 'uint16',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maturity',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint8',
                            name: 'status',
                            type: 'uint8',
                        },
                        {
                            internalType: 'int24',
                            name: 'line',
                            type: 'int24',
                        },
                        {
                            internalType: 'uint24',
                            name: 'playerId',
                            type: 'uint24',
                        },
                        {
                            internalType: 'uint256[]',
                            name: 'odds',
                            type: 'uint256[]',
                        },
                        {
                            internalType: 'bytes32[]',
                            name: 'merkleProof',
                            type: 'bytes32[]',
                        },
                        {
                            internalType: 'uint8',
                            name: 'position',
                            type: 'uint8',
                        },
                        {
                            components: [
                                {
                                    internalType: 'uint16',
                                    name: 'typeId',
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
                            internalType: 'struct ISportsAMMV2.CombinedPosition[][]',
                            name: 'combinedPositions',
                            type: 'tuple[][]',
                        },
                    ],
                    internalType: 'struct ISportsAMMV2.TradeData[]',
                    name: '_tradeData',
                    type: 'tuple[]',
                },
                {
                    internalType: 'uint256',
                    name: '_buyInAmount',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: '_expectedQuote',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: '_additionalSlippage',
                    type: 'uint256',
                },
                {
                    internalType: 'address',
                    name: '_referrer',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: '_collateral',
                    type: 'address',
                },
            ],
            name: 'trade',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    components: [
                        {
                            internalType: 'string',
                            name: '_gameId',
                            type: 'string',
                        },
                        {
                            internalType: 'uint16',
                            name: '_sportId',
                            type: 'uint16',
                        },
                        {
                            internalType: 'uint16',
                            name: '_typeId',
                            type: 'uint16',
                        },
                        {
                            internalType: 'int24',
                            name: '_line',
                            type: 'int24',
                        },
                        {
                            internalType: 'uint8',
                            name: '_position',
                            type: 'uint8',
                        },
                        {
                            internalType: 'uint256',
                            name: '_buyInAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: '_expectedQuote',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: '_additionalSlippage',
                            type: 'uint256',
                        },
                        {
                            internalType: 'address',
                            name: '_referrer',
                            type: 'address',
                        },
                        {
                            internalType: 'address',
                            name: '_collateral',
                            type: 'address',
                        },
                    ],
                    internalType: 'struct ILiveTradingProcessor.LiveTradeData',
                    name: '_liveTradeData',
                    type: 'tuple',
                },
            ],
            name: 'tradeLive',
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

export default freeBetHolder;
