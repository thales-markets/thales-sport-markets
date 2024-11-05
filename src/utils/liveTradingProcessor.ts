import { ZERO_ADDRESS } from 'constants/network';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { decodeEventLog, DecodeEventLogParameters } from 'viem';
import { TradeData } from '../types/markets';
import { executeBiconomyTransaction } from './biconomy';
import { convertFromBytes32 } from './formatters/string';

export const getLiveTradingProcessorTransaction: any = async (
    collateralAddress: string,
    liveTradingProcessorContract: ViemContract,
    tradeData: TradeData[],
    sUSDPaid: bigint,
    expectedQuote: bigint,
    referral: string | null,
    additionalSlippage: bigint,
    isAA: boolean,
    isFreeBet: boolean,
    freeBetHolderContract: ViemContract,
    isStakedThales: boolean,
    stakingThalesBettingProxyContract: ViemContract,
    networkId: SupportedNetwork
): Promise<any> => {
    const referralAddress = referral || ZERO_ADDRESS;
    const gameId = convertFromBytes32(tradeData[0].gameId);

    if (isAA) {
        return executeBiconomyTransaction(
            networkId,
            collateralAddress,
            liveTradingProcessorContract,
            'requestLiveTrade',
            [
                gameId,
                tradeData[0].sportId,
                tradeData[0].typeId,
                tradeData[0].position,
                tradeData[0].line,
                sUSDPaid,
                expectedQuote,
                additionalSlippage,
                referralAddress,
                collateralAddress,
            ]
        );
    } else {
        if (isFreeBet && freeBetHolderContract) {
            return freeBetHolderContract.write.tradeLive({
                _gameId: gameId,
                _sportId: tradeData[0].sportId,
                _typeId: tradeData[0].typeId,
                _line: tradeData[0].line,
                _position: tradeData[0].position,
                _buyInAmount: sUSDPaid,
                _expectedQuote: expectedQuote,
                _additionalSlippage: additionalSlippage,
                _referrer: referralAddress,
                _collateral: collateralAddress,
            });
        }

        if (isStakedThales && stakingThalesBettingProxyContract) {
            return stakingThalesBettingProxyContract.write.tradeLive({
                _gameId: gameId,
                _sportId: tradeData[0].sportId,
                _typeId: tradeData[0].typeId,
                _line: tradeData[0].line,
                _position: tradeData[0].position,
                _buyInAmount: sUSDPaid,
                _expectedQuote: expectedQuote,
                _additionalSlippage: additionalSlippage,
                _referrer: referralAddress,
                _collateral: collateralAddress,
            });
        }
        return liveTradingProcessorContract.write.requestLiveTrade({
            _gameId: gameId,
            _sportId: tradeData[0].sportId,
            _typeId: tradeData[0].typeId,
            _position: tradeData[0].position,
            _line: tradeData[0].line,
            _buyInAmount: sUSDPaid,
            _expectedQuote: expectedQuote,
            _additionalSlippage: additionalSlippage,
            _referrer: referralAddress,
            _collateral: collateralAddress,
        });
    }
};

export const getRequestId = async (txLogs: any, isFreeBet: boolean, isStakedThales: boolean) => {
    const freeBetEventABI = {
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
    };

    const stakingTokensRequestedABI = {
        inputs: [
            { indexed: false, internalType: 'address', name: 'user', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'buyInAmount', type: 'uint256' },
            { indexed: false, internalType: 'bytes32', name: 'requestId', type: 'bytes32' },
        ],
        name: 'StakingTokensLiveTradeRequested',
        type: 'event',
    };

    const lpDataLiveABI = {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'address', name: 'requester', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'requestCounter', type: 'uint256' },
            { indexed: false, internalType: 'bytes32', name: 'requestId', type: 'bytes32' },
            { indexed: false, internalType: 'bytes32', name: '_gameId', type: 'bytes32' },
            { indexed: false, internalType: 'uint16', name: '_sportId', type: 'uint16' },
            { indexed: false, internalType: 'uint16', name: '_typeId', type: 'uint16' },
            { indexed: false, internalType: 'int24', name: '_line', type: 'int24' },
            { indexed: false, internalType: 'uint8', name: '_position', type: 'uint8' },
            { indexed: false, internalType: 'uint256', name: '_buyInAmount', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: '_expectedQuote', type: 'uint256' },
            { indexed: false, internalType: 'address', name: '_collateral', type: 'address' },
        ],
        name: 'LiveTradeRequested',
        type: 'event',
    };

    const requestIdEvent = txLogs.find((log: any) => {
        try {
            const decoded = decodeEventLog({
                abi: isFreeBet ? freeBetEventABI : isStakedThales ? stakingTokensRequestedABI : (lpDataLiveABI as any),
                data: log.data,
                topics: log.topics,
            });

            if (
                (decoded as DecodeEventLogParameters)?.eventName == 'FreeBetLiveTradeRequested' ||
                (decoded as DecodeEventLogParameters)?.eventName == 'StakingTokensLiveTradeRequested' ||
                (decoded as DecodeEventLogParameters)?.eventName == 'LiveTradeRequested'
            ) {
                return (decoded as any)?.args;
            }
        } catch (e) {
            console.error('Error parsing logs:', e);
        }
    });

    if (requestIdEvent) {
        return requestIdEvent.args[2];
    }

    return undefined;
};
