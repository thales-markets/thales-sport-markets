import axios from 'axios';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getLoadingToastOptions } from 'config/toast';
import { secondsToMilliseconds } from 'date-fns';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { delay } from 'utils/timer';

const checkFulfilledTx = async (
    networkId: SupportedNetwork,
    tradingContract: ViemContract,
    requestId: string,
    isAdapterAllowed: boolean,
    toastId: string | number
) => {
    let isFulfilledAdapter = isAdapterAllowed;

    if (!isAdapterAllowed) {
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
        if (counter / 5 === 1 && !isFulfilledAdapter) {
            toast.update(toastId, getLoadingToastOptions(t('market.toast-message.fulfilling-live-trade')));
        }
        counter++;
        await delay(1000);
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
