import { ZERO_ADDRESS } from 'constants/network';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { Address, decodeEventLog, DecodeEventLogParameters } from 'viem';
import { TradeData } from '../types/markets';
import { executeBiconomyTransaction } from './biconomy';
import freeBetHolder from './contracts/freeBetHolder';
import liveTradingProcessorContract from './contracts/liveTradingProcessorContract';
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

    if (isFreeBet && freeBetHolderContract) {
        if (isAA) {
            return executeBiconomyTransaction({
                collateralAddress: collateralAddress as Address,
                networkId,
                contract: freeBetHolderContract,
                methodName: 'tradeLive',
                data: [
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
                ],
            });
        } else {
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
    }

    if (isStakedThales && stakingThalesBettingProxyContract) {
        if (isAA) {
            return executeBiconomyTransaction({
                collateralAddress: collateralAddress as Address,
                networkId,
                contract: stakingThalesBettingProxyContract,
                methodName: 'tradeLive',
                data: [
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
                ],
            });
        } else {
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
    }

    if (isAA) {
        return executeBiconomyTransaction({
            collateralAddress: collateralAddress as Address,
            networkId,
            contract: liveTradingProcessorContract,
            methodName: 'requestLiveTrade',
            data: [
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
            ],
        });
    } else {
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
                        : liveTradingProcessorContract.abi,
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
