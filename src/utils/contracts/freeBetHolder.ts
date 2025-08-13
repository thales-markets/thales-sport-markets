import { Network } from 'enums/network';
import { ContractData } from 'types/viem';

const freeBetHolder: ContractData = {
    addresses: {
        [Network.OptimismMainnet]: '0x8D18e68563d53be97c2ED791CA4354911F16A54B',
        [Network.Arbitrum]: '0xd1F2b87a9521315337855A132e5721cfe272BBd9',
        [Network.Base]: '0x2929Cf1edAc2DB91F68e2822CEc25736cAe029bf',
        [Network.OptimismSepolia]: '0xAeDB908b82626F031E31140527b45c7C89d4bb53',
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
            name: 'CallerNotAllowed',
            type: 'error',
        },
        {
            inputs: [],
            name: 'DirectionsCannotBeEmpty',
            type: 'error',
        },
        {
            inputs: [],
            name: 'FailedInnerCall',
            type: 'error',
        },
        {
            inputs: [],
            name: 'FreeBetExpired',
            type: 'error',
        },
        {
            inputs: [],
            name: 'FreeBetNotExpired',
            type: 'error',
        },
        {
            inputs: [],
            name: 'InsufficientBalance',
            type: 'error',
        },
        {
            inputs: [],
            name: 'InvalidAddress',
            type: 'error',
        },
        {
            inputs: [],
            name: 'InvalidInitialization',
            type: 'error',
        },
        {
            inputs: [],
            name: 'InvalidTicketType',
            type: 'error',
        },
        {
            inputs: [],
            name: 'NotInitializing',
            type: 'error',
        },
        {
            inputs: [],
            name: 'OnlyCallableFromLiveTradingProcessor',
            type: 'error',
        },
        {
            inputs: [],
            name: 'OnlyCallableFromSGPTradingProcessor',
            type: 'error',
        },
        {
            inputs: [],
            name: 'OnlyCallableFromSpeedMarketsAMMCreator',
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
            inputs: [],
            name: 'SpeedMarketsAMMCreatorNotSet',
            type: 'error',
        },
        {
            inputs: [],
            name: 'UnknownActiveTicket',
            type: 'error',
        },
        {
            inputs: [],
            name: 'UnknownLiveTicket',
            type: 'error',
        },
        {
            inputs: [],
            name: 'UnknownSGPTicket',
            type: 'error',
        },
        {
            inputs: [],
            name: 'UnknownSpeedMarketTicketOwner',
            type: 'error',
        },
        {
            inputs: [],
            name: 'UnknownTicket',
            type: 'error',
        },
        {
            inputs: [],
            name: 'UnsupportedCollateral',
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
                    internalType: 'bytes32',
                    name: 'requestId',
                    type: 'bytes32',
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
                    name: 'asset',
                    type: 'bytes32',
                },
                {
                    indexed: false,
                    internalType: 'uint64',
                    name: 'timeFrame',
                    type: 'uint64',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'directionsCount',
                    type: 'uint256',
                },
            ],
            name: 'FreeBetChainedSpeedMarketTradeRequested',
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
            name: 'FreeBetSGPTradeRequested',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'speedMarket',
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
            name: 'FreeBetSpeedMarketResolved',
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
                    internalType: 'bytes32',
                    name: 'requestId',
                    type: 'bytes32',
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
                    name: 'asset',
                    type: 'bytes32',
                },
                {
                    indexed: false,
                    internalType: 'uint64',
                    name: 'strikeTime',
                    type: 'uint64',
                },
                {
                    indexed: false,
                    internalType: 'enum ISpeedMarketsAMMCreator.Direction',
                    name: 'direction',
                    type: 'uint8',
                },
            ],
            name: 'FreeBetSpeedMarketTradeRequested',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'createdSpeedMarket',
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
            ],
            name: 'FreeBetSpeedTrade',
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
                    name: 'addressManager',
                    type: 'address',
                },
            ],
            name: 'SetAddressManager',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'freeBetExpirationPeriod',
                    type: 'uint256',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'freeBetExpirationUpgrade',
                    type: 'uint256',
                },
            ],
            name: 'SetFreeBetExpirationPeriod',
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
            name: 'SetLiveTradingProcessor',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: 'sgpTradingProcessor',
                    type: 'address',
                },
            ],
            name: 'SetSGPTradingProcessor',
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
            name: 'SetSportsAMM',
            type: 'event',
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
            ],
            name: 'UpdateMaxApprovalSpeedMarketsAMM',
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
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_user',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_collateral',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_receiver',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: '_amount',
                    type: 'uint256',
                },
            ],
            name: 'UserFundingRemoved',
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
            inputs: [],
            name: 'addressManager',
            outputs: [
                {
                    internalType: 'contract IAddressManager',
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
            name: 'confirmSGPTrade',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_resolvedSpeedMarket',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: '_exercized',
                    type: 'uint256',
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
            name: 'confirmSpeedMarketResolved',
            outputs: [],
            stateMutability: 'nonpayable',
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
                    internalType: 'address',
                    name: '_collateral',
                    type: 'address',
                },
                {
                    internalType: 'uint256',
                    name: '_buyInAmount',
                    type: 'uint256',
                },
                {
                    internalType: 'bool',
                    name: '_isChainedSpeedMarket',
                    type: 'bool',
                },
            ],
            name: 'confirmSpeedOrChainedSpeedMarketTrade',
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
                    name: '',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            name: 'freeBetExpiration',
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
            name: 'freeBetExpirationPeriod',
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
            name: 'freeBetExpirationUpgrade',
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
            name: 'getActiveSpeedMarketsPerUser',
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
            name: 'getResolvedSpeedMarketsPerUser',
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
            inputs: [
                {
                    internalType: 'address',
                    name: '_collateral',
                    type: 'address',
                },
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
            ],
            name: 'getUsersFreeBetDataPerCollateral',
            outputs: [
                {
                    internalType: 'address[]',
                    name: 'allUsers',
                    type: 'address[]',
                },
                {
                    internalType: 'uint256[]',
                    name: 'freeBetAmounts',
                    type: 'uint256[]',
                },
                {
                    internalType: 'bool[]',
                    name: 'isValid',
                    type: 'bool[]',
                },
                {
                    internalType: 'uint256[]',
                    name: 'timeToExpiration',
                    type: 'uint256[]',
                },
            ],
            stateMutability: 'view',
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
                    internalType: 'uint256',
                    name: '_index',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: '_pageSize',
                    type: 'uint256',
                },
            ],
            name: 'getUsersWithFreeBetPerCollateral',
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
            ],
            name: 'isFreeBetValid',
            outputs: [
                {
                    internalType: 'bool',
                    name: 'isValid',
                    type: 'bool',
                },
                {
                    internalType: 'uint256',
                    name: 'timeToExpiration',
                    type: 'uint256',
                },
            ],
            stateMutability: 'view',
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
            name: 'numOfActiveSpeedMarketsPerUser',
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
            name: 'numOfResolvedSpeedMarketsPerUser',
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
            inputs: [
                {
                    internalType: 'address',
                    name: '_collateral',
                    type: 'address',
                },
            ],
            name: 'numOfUsersWithFreeBetPerCollateral',
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
                    internalType: 'address[]',
                    name: '_users',
                    type: 'address[]',
                },
                {
                    internalType: 'address',
                    name: '_collateral',
                    type: 'address',
                },
            ],
            name: 'removeExpiredUserFunding',
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
                    internalType: 'address',
                    name: '_receiver',
                    type: 'address',
                },
            ],
            name: 'removeUserFunding',
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
                    internalType: 'address',
                    name: '_receiver',
                    type: 'address',
                },
            ],
            name: 'removeUserFundingBatch',
            outputs: [],
            stateMutability: 'nonpayable',
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
                    name: '_addressManager',
                    type: 'address',
                },
            ],
            name: 'setAddressManager',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'uint256',
                    name: '_freeBetExpirationPeriod',
                    type: 'uint256',
                },
                {
                    internalType: 'uint256',
                    name: '_freeBetExpirationUpgrade',
                    type: 'uint256',
                },
            ],
            name: 'setFreeBetExpirationPeriod',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
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
                    name: '_sgpTradingProcessor',
                    type: 'address',
                },
            ],
            name: 'setSGPTradingProcessor',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    internalType: 'address',
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
                    name: '_freeBetExpiration',
                    type: 'uint256',
                },
            ],
            name: 'setUserFreeBetExpiration',
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
            ],
            name: 'setUsersWithAlreadyFundedFreeBetPerCollateral',
            outputs: [],
            stateMutability: 'nonpayable',
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
            name: 'sgpRequestsPerUser',
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
            name: 'sgpTradingProcessor',
            outputs: [
                {
                    internalType: 'contract ISGPTradingProcessor',
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
                    internalType: 'bytes32',
                    name: '',
                    type: 'bytes32',
                },
            ],
            name: 'speedMarketRequestToUser',
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
                    internalType: 'address',
                    name: '',
                    type: 'address',
                },
            ],
            name: 'ticketType',
            outputs: [
                {
                    internalType: 'enum FreeBetsHolder.TicketType',
                    name: '',
                    type: 'uint8',
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
                            internalType: 'bytes32',
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'timeFrame',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePrice',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePriceSlippage',
                            type: 'uint256',
                        },
                        {
                            internalType: 'enum ISpeedMarketsAMMCreator.Direction[]',
                            name: 'directions',
                            type: 'uint8[]',
                        },
                        {
                            internalType: 'address',
                            name: 'collateral',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'address',
                            name: 'referrer',
                            type: 'address',
                        },
                    ],
                    internalType: 'struct ISpeedMarketsAMMCreator.ChainedSpeedMarketParams',
                    name: '_params',
                    type: 'tuple',
                },
            ],
            name: 'tradeChainedSpeedMarket',
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
                    components: [
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
                    internalType: 'struct ISGPTradingProcessor.SGPTradeData',
                    name: '_sgpTradeData',
                    type: 'tuple',
                },
            ],
            name: 'tradeSGP',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                {
                    components: [
                        {
                            internalType: 'bytes32',
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'strikeTime',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint64',
                            name: 'delta',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePrice',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'strikePriceSlippage',
                            type: 'uint256',
                        },
                        {
                            internalType: 'enum ISpeedMarketsAMMCreator.Direction',
                            name: 'direction',
                            type: 'uint8',
                        },
                        {
                            internalType: 'address',
                            name: 'collateral',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'address',
                            name: 'referrer',
                            type: 'address',
                        },
                        {
                            internalType: 'uint256',
                            name: 'skewImpact',
                            type: 'uint256',
                        },
                    ],
                    internalType: 'struct ISpeedMarketsAMMCreator.SpeedMarketParams',
                    name: '_params',
                    type: 'tuple',
                },
            ],
            name: 'tradeSpeedMarket',
            outputs: [],
            stateMutability: 'nonpayable',
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
                {
                    internalType: 'uint8',
                    name: '_systemBetDenominator',
                    type: 'uint8',
                },
            ],
            name: 'tradeSystemBet',
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
        {
            inputs: [
                {
                    internalType: 'address',
                    name: '_collateral',
                    type: 'address',
                },
            ],
            name: 'updateApprovalForSpeedMarketsAMM',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ],
};

export default freeBetHolder;
