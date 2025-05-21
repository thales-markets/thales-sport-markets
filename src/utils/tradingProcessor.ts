import { Dispatch, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getLoadingToastOptions } from 'config/toast';
import { ZERO_ADDRESS } from 'constants/network';
import { secondsToMilliseconds } from 'date-fns';
import { LiveTradingFinalStatus, LiveTradingTicketStatus } from 'enums/markets';
import { toast } from 'react-toastify';
import { updateTicketRequests } from 'redux/modules/ticket';
import { TicketRequest, TradeData } from 'types/markets';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { delay } from 'utils/timer';
import { decodeEventLog, DecodeEventLogParameters } from 'viem';
import freeBetHolder from './contracts/freeBetHolder';
import liveTradingProcessorContract from './contracts/liveTradingProcessorContract';
import sgpTradingProcessorContract from './contracts/sgpTradingProcessorContract';
import { convertFromBytes32 } from './formatters/string';
import { executeBiconomyTransaction } from './smartAccount/biconomy/biconomy';

const DELAY_BETWEEN_CHECKS_SECONDS = 1; // 1s
const UPDATE_STATUS_MESSAGE_PERIOD_SECONDS = 5 * DELAY_BETWEEN_CHECKS_SECONDS; // 5s - must be whole number multiplier of delay

const checkFulfilledTx = async (
    networkId: SupportedNetwork,
    tradingContract: ViemContract,
    requestId: string,
    isFulfilledAdapterParam: boolean,
    toastId: string | number,
    dispatch?: Dispatch<PayloadAction<TicketRequest>>,
    liveTicketRequestData?: TicketRequest
) => {
    let isFulfilledAdapter = isFulfilledAdapterParam;

    if (!isFulfilledAdapter) {
        const adapterResponse = await axios.get(
            `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/live-trading/read-message/request/${requestId}`
        );

        if (!!adapterResponse.data) {
            if (adapterResponse.data.allow) {
                if (dispatch && liveTicketRequestData) {
                    liveTicketRequestData.status = LiveTradingTicketStatus.APPROVED;
                    dispatch(updateTicketRequests(liveTicketRequestData));
                }
                isFulfilledAdapter = true;
                toast.update(toastId, getLoadingToastOptions(adapterResponse.data.message));
            } else {
                if (dispatch && liveTicketRequestData) {
                    liveTicketRequestData.finalStatus = LiveTradingFinalStatus.FAILED;
                    liveTicketRequestData.errorReason = adapterResponse.data.message;
                    dispatch(updateTicketRequests(liveTicketRequestData));
                }
                toast.update(toastId, getErrorToastOptions(adapterResponse.data.message));
                return { isFulfilledTx: false, isFulfilledAdapter, isAdapterError: true };
            }
        }
    }

    const isFulfilledTx = await tradingContract?.read.requestIdToFulfillAllowed([requestId]);

    return { isFulfilledTx: !!isFulfilledTx, isFulfilledAdapter, isAdapterError: false };
};

export const processTransaction = async (
    networkId: SupportedNetwork,
    tradingContract: ViemContract,
    requestId: string,
    maxAllowedExecutionSec: number,
    toastId: string | number,
    toastMessage: string,
    dispatch?: Dispatch<PayloadAction<TicketRequest>>,
    liveTicketRequestData?: TicketRequest
) => {
    let counter = 0;
    const startTime = Date.now();

    console.log('networkID: ', networkId);
    console.log('tradingContract: ', tradingContract);
    let { isFulfilledTx, isFulfilledAdapter, isAdapterError } = await checkFulfilledTx(
        networkId,
        tradingContract,
        requestId,
        false,
        toastId,
        dispatch,
        liveTicketRequestData
    );

    while (
        !isFulfilledTx &&
        !isAdapterError &&
        Date.now() - startTime < secondsToMilliseconds(maxAllowedExecutionSec)
    ) {
        const isUpdateStatusReady = counter / UPDATE_STATUS_MESSAGE_PERIOD_SECONDS === DELAY_BETWEEN_CHECKS_SECONDS;
        if (isUpdateStatusReady && !isFulfilledTx && isFulfilledAdapter) {
            toast.update(toastId, getLoadingToastOptions(toastMessage));
        }

        counter++;
        await delay(secondsToMilliseconds(DELAY_BETWEEN_CHECKS_SECONDS));

        const fulfilledResponse = await checkFulfilledTx(
            networkId,
            tradingContract,
            requestId,
            isFulfilledAdapter,
            toastId,
            dispatch,
            liveTicketRequestData
        );
        isFulfilledTx = fulfilledResponse.isFulfilledTx;
        isFulfilledAdapter = fulfilledResponse.isFulfilledAdapter;
        isAdapterError = fulfilledResponse.isAdapterError;
    }

    return { isFulfilledTx, isFulfilledAdapter, isAdapterError };
};

export const getRequestId = (txLogs: any, isFreeBet: boolean, isSgp: boolean) => {
    const requestIdEvent = txLogs
        .map((log: any) => {
            try {
                const decoded = decodeEventLog({
                    abi: isFreeBet
                        ? freeBetHolder.abi
                        : isSgp
                        ? sgpTradingProcessorContract.abi
                        : liveTradingProcessorContract.abi,
                    data: log.data,
                    topics: log.topics,
                });

                if (
                    (decoded as DecodeEventLogParameters)?.eventName == 'FreeBetLiveTradeRequested' ||
                    (decoded as DecodeEventLogParameters)?.eventName == 'FreeBetSGPTradeRequested' ||
                    (decoded as DecodeEventLogParameters)?.eventName == 'LiveTradeRequested' ||
                    (decoded as DecodeEventLogParameters)?.eventName == 'SGPTradeRequested'
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

export const getTradingProcessorTransaction: any = async (
    isLive: boolean,
    isSgp: boolean,
    collateralAddress: string,
    tradingProcessorContract: ViemContract,
    tradeData: TradeData[],
    buyInAmount: bigint,
    expectedQuote: bigint,
    referral: string | null,
    additionalSlippage: bigint,
    isAA: boolean,
    isFreeBet: boolean,
    freeBetHolderContract: ViemContract,
    networkId: SupportedNetwork,
    isEth?: boolean
): Promise<any> => {
    const referralAddress = referral || ZERO_ADDRESS;
    const gameId = convertFromBytes32(tradeData[0].gameId);

    let txParams = {};

    if (isLive) {
        txParams = {
            _gameId: gameId,
            _sportId: tradeData[0].sportId,
            _typeId: tradeData[0].typeId,
            _line: tradeData[0].line,
            _position: tradeData[0].position,
            _buyInAmount: buyInAmount,
            _expectedQuote: expectedQuote,
            _additionalSlippage: additionalSlippage,
            _referrer: referralAddress,
            _collateral: collateralAddress,
        };
    } else if (isSgp) {
        txParams = {
            _tradeData: tradeData,
            _buyInAmount: buyInAmount,
            _expectedQuote: expectedQuote,
            _additionalSlippage: additionalSlippage,
            _referrer: referralAddress,
            _collateral: collateralAddress,
        };
    }

    if (isFreeBet && freeBetHolderContract) {
        if (isAA) {
            return await executeBiconomyTransaction({
                collateralAddress: collateralAddress as any,
                networkId,
                contract: freeBetHolderContract,
                methodName: isSgp ? 'tradeSGP' : 'tradeLive',
                data: [txParams],
                isEth,
            });
        } else
            return isSgp
                ? freeBetHolderContract.write.tradeSGP([txParams])
                : freeBetHolderContract.write.tradeLive([txParams]);
    }

    if (isAA) {
        return await executeBiconomyTransaction({
            collateralAddress: collateralAddress as any,
            networkId,
            contract: tradingProcessorContract,
            methodName: isSgp ? 'requestSGPTrade' : 'requestLiveTrade',
            data: [txParams],
            isEth,
        });
    } else
        return isSgp
            ? tradingProcessorContract.write.requestSGPTrade([txParams])
            : tradingProcessorContract.write.requestLiveTrade([txParams]);
};
