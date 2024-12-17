import { ZERO_ADDRESS } from 'constants/network';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { decodeEventLog, DecodeEventLogParameters } from 'viem';
import { TradeData } from '../types/markets';
import { executeBiconomyTransaction } from './biconomy';
import freeBetHolder from './contracts/freeBetHolder';
import liquidityPoolDataContract from './contracts/liveTradingProcessorContract';
import stakingThalesBettingProxy from './contracts/stakingThalesBettingProxy';
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
            return freeBetHolderContract.write.tradeLive([
                {
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
                },
            ]);
        }

        if (isStakedThales && stakingThalesBettingProxyContract) {
            return stakingThalesBettingProxyContract.write.tradeLive([
                {
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
                },
            ]);
        }
        return liveTradingProcessorContract.write.requestLiveTrade([
            {
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
            },
        ]);
    }
};

export const getRequestId = (txLogs: any, isFreeBet: boolean, isStakedThales: boolean) => {
    const requestIdEvent = txLogs
        .map((log: any) => {
            try {
                const decoded = decodeEventLog({
                    abi: isFreeBet
                        ? freeBetHolder.abi
                        : isStakedThales
                        ? stakingThalesBettingProxy.abi
                        : liquidityPoolDataContract.abi,
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
                return;
            }
        })
        .filter((event: any) => event);

    return requestIdEvent[0]?.requestId ? requestIdEvent[0]?.requestId : undefined;
};
