import axios from 'axios';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getLoadingToastOptions } from 'config/toast';
import { secondsToMilliseconds } from 'date-fns';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { delay } from 'utils/timer';

const DELAY_BETWEEN_CHECKS_SECONDS = 1; // 1s
const UPDATE_STATUS_MESSAGE_PERIOD_SECONDS = 5 * DELAY_BETWEEN_CHECKS_SECONDS; // 5s - must be whole number multiplier of delay

const checkFulfilledTx = async (
    networkId: SupportedNetwork,
    tradingContract: ViemContract,
    requestId: string,
    isFulfilledAdapterParam: boolean,
    toastId: string | number
) => {
    let isFulfilledAdapter = isFulfilledAdapterParam;

    if (!isFulfilledAdapter) {
        const adapterResponse = await axios.get(
            `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/live-trading/read-message/request/${requestId}`
        );

        if (!!adapterResponse.data) {
            if (adapterResponse.data.allow) {
                isFulfilledAdapter = true;
                toast.update(toastId, getLoadingToastOptions(adapterResponse.data.message));
            } else {
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
    toastId: string | number
) => {
    let counter = 0;
    const startTime = Date.now();

    let { isFulfilledTx, isFulfilledAdapter, isAdapterError } = await checkFulfilledTx(
        networkId,
        tradingContract,
        requestId,
        false,
        toastId
    );

    while (
        !isFulfilledTx &&
        !isAdapterError &&
        Date.now() - startTime < secondsToMilliseconds(maxAllowedExecutionSec)
    ) {
        const isUpdateStatus = counter / UPDATE_STATUS_MESSAGE_PERIOD_SECONDS === DELAY_BETWEEN_CHECKS_SECONDS;
        if (isUpdateStatus && !isFulfilledTx && isFulfilledAdapter) {
            toast.update(toastId, getLoadingToastOptions(t('market.toast-message.fulfilling-live-trade')));
        }

        counter++;
        await delay(secondsToMilliseconds(DELAY_BETWEEN_CHECKS_SECONDS));

        const fulfilledResponse = await checkFulfilledTx(
            networkId,
            tradingContract,
            requestId,
            isFulfilledAdapter,
            toastId
        );
        isFulfilledTx = fulfilledResponse.isFulfilledTx;
        isFulfilledAdapter = fulfilledResponse.isFulfilledAdapter;
        isAdapterError = fulfilledResponse.isAdapterError;
    }

    return { isFulfilledTx, isFulfilledAdapter, isAdapterError };
};
