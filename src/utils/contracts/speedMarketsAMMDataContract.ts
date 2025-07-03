import { NetworkId } from 'thales-utils';
import { Address } from 'viem';

const speedMarketsDataContract = {
    addresses: {
        [NetworkId.OptimismMainnet]: '0x467e14ac025499d60c417D7F00A7D9E83293F43c' as Address,
        [NetworkId.OptimismSepolia]: '0xc5614017CC2d336a0B3EcC2C4A795FeeF063dbbc' as Address,
        [NetworkId.PolygonMainnet]: '0xA30200A8eD9655d7096814D0cC1f76639aa42AED' as Address,
        [NetworkId.Arbitrum]: '0xbbE161Bf57799104eFd6524133e305BBcB7C07EA' as Address,
        [NetworkId.Base]: '0xD6155E7C948458D6Ab58f9D63E1566493b9304C1' as Address,
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
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_speedMarketsAMM',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'address',
                    name: '_chainedSpeedMarketsAMM',
                    type: 'address',
                },
            ],
            name: 'SetSpeedMarketsAMM',
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
            inputs: [],
            name: 'chainedSpeedMarketsAMM',
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
                    internalType: 'address[]',
                    name: 'marketsArray',
                    type: 'address[]',
                },
            ],
            name: 'getChainedMarketsData',
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
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'timeFrame',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint64',
                            name: 'initialStrikeTime',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint64',
                            name: 'strikeTime',
                            type: 'uint64',
                        },
                        {
                            internalType: 'int64',
                            name: 'initialStrikePrice',
                            type: 'int64',
                        },
                        {
                            internalType: 'enum SpeedMarket.Direction[]',
                            name: 'directions',
                            type: 'uint8[]',
                        },
                        {
                            internalType: 'int64[]',
                            name: 'strikePrices',
                            type: 'int64[]',
                        },
                        {
                            internalType: 'int64[]',
                            name: 'finalPrices',
                            type: 'int64[]',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'payoutMultiplier',
                            type: 'uint256',
                        },
                        {
                            internalType: 'bool',
                            name: 'resolved',
                            type: 'bool',
                        },
                        {
                            internalType: 'bool',
                            name: 'isUserWinner',
                            type: 'bool',
                        },
                        {
                            internalType: 'uint256',
                            name: 'safeBoxImpact',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'createdAt',
                            type: 'uint256',
                        },
                    ],
                    internalType: 'struct SpeedMarketsAMMData.ChainedMarketData[]',
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
                    name: '_walletAddress',
                    type: 'address',
                },
            ],
            name: 'getChainedSpeedMarketsAMMParameters',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'uint256',
                            name: 'numActiveMarkets',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'numMaturedMarkets',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'numActiveMarketsPerUser',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'numMaturedMarketsPerUser',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'minChainedMarkets',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxChainedMarkets',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint64',
                            name: 'minTimeFrame',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint64',
                            name: 'maxTimeFrame',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256',
                            name: 'minBuyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxBuyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxProfitPerIndividualMarket',
                            type: 'uint256',
                        },
                        {
                            components: [
                                {
                                    internalType: 'uint256',
                                    name: 'current',
                                    type: 'uint256',
                                },
                                {
                                    internalType: 'uint256',
                                    name: 'max',
                                    type: 'uint256',
                                },
                            ],
                            internalType: 'struct SpeedMarketsAMMData.Risk',
                            name: 'risk',
                            type: 'tuple',
                        },
                        {
                            internalType: 'uint256[]',
                            name: 'payoutMultipliers',
                            type: 'uint256[]',
                        },
                    ],
                    internalType: 'struct SpeedMarketsAMMData.ChainedSpeedMarketsAMMParameters',
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
                    internalType: 'bytes32',
                    name: 'asset',
                    type: 'bytes32',
                },
            ],
            name: 'getDirectionalRiskPerAsset',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'enum SpeedMarket.Direction',
                            name: 'direction',
                            type: 'uint8',
                        },
                        {
                            internalType: 'uint256',
                            name: 'current',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'max',
                            type: 'uint256',
                        },
                    ],
                    internalType: 'struct SpeedMarketsAMMData.RiskPerDirection[]',
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
                    internalType: 'address[]',
                    name: 'marketsArray',
                    type: 'address[]',
                },
            ],
            name: 'getMarketsData',
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
                            name: 'asset',
                            type: 'bytes32',
                        },
                        {
                            internalType: 'uint64',
                            name: 'strikeTime',
                            type: 'uint64',
                        },
                        {
                            internalType: 'int64',
                            name: 'strikePrice',
                            type: 'int64',
                        },
                        {
                            internalType: 'enum SpeedMarket.Direction',
                            name: 'direction',
                            type: 'uint8',
                        },
                        {
                            internalType: 'uint256',
                            name: 'buyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'bool',
                            name: 'resolved',
                            type: 'bool',
                        },
                        {
                            internalType: 'int64',
                            name: 'finalPrice',
                            type: 'int64',
                        },
                        {
                            internalType: 'enum SpeedMarket.Direction',
                            name: 'result',
                            type: 'uint8',
                        },
                        {
                            internalType: 'bool',
                            name: 'isUserWinner',
                            type: 'bool',
                        },
                        {
                            internalType: 'uint256',
                            name: 'safeBoxImpact',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'lpFee',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'createdAt',
                            type: 'uint256',
                        },
                    ],
                    internalType: 'struct SpeedMarketsAMMData.MarketData[]',
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
                    name: 'asset',
                    type: 'bytes32',
                },
            ],
            name: 'getRiskPerAsset',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'uint256',
                            name: 'current',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'max',
                            type: 'uint256',
                        },
                    ],
                    internalType: 'struct SpeedMarketsAMMData.Risk',
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
                    name: '_walletAddress',
                    type: 'address',
                },
            ],
            name: 'getSpeedMarketsAMMParameters',
            outputs: [
                {
                    components: [
                        {
                            internalType: 'uint256',
                            name: 'numActiveMarkets',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'numMaturedMarkets',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'numActiveMarketsPerUser',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'numMaturedMarketsPerUser',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'minBuyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxBuyinAmount',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'minimalTimeToMaturity',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maximalTimeToMaturity',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint64',
                            name: 'maximumPriceDelay',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint64',
                            name: 'maximumPriceDelayForResolving',
                            type: 'uint64',
                        },
                        {
                            internalType: 'uint256[]',
                            name: 'timeThresholdsForFees',
                            type: 'uint256[]',
                        },
                        {
                            internalType: 'uint256[]',
                            name: 'lpFees',
                            type: 'uint256[]',
                        },
                        {
                            internalType: 'uint256',
                            name: 'lpFee',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'maxSkewImpact',
                            type: 'uint256',
                        },
                        {
                            internalType: 'uint256',
                            name: 'safeBoxImpact',
                            type: 'uint256',
                        },
                        {
                            internalType: 'bool',
                            name: 'isAddressWhitelisted',
                            type: 'bool',
                        },
                    ],
                    internalType: 'struct SpeedMarketsAMMData.SpeedMarketsAMMParameters',
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
                {
                    internalType: 'address',
                    name: '_speedMarketsAMM',
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
                    name: '_speedMarketsAMM',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: '_chainedSpeedMarketsAMM',
                    type: 'address',
                },
            ],
            name: 'setSpeedMarketsAMM',
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

export default speedMarketsDataContract;
