import axios from 'axios';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { Network } from 'enums/network';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import { FreeBet } from 'types/freeBet';
import { refetchFreeBetBalance, refetchGetFreeBet } from './queryConnector';

export const claimFreeBet = async (
    walletAddress: string,
    freeBet: string | undefined,
    networkId: Network,
    setFreeBet: (freeBet: FreeBet | undefined) => void,
    history: any
) => {
    const toastId = toast.loading(t('market.toast-message.transaction-pending'));

    if (walletAddress && freeBet) {
        try {
            const response = await axios.post(
                // hardcode optimism for now
                `${generalConfig.API_URL}/overtime-v2/networks/${
                    networkId !== Network.OptimismMainnet && networkId !== Network.OptimismSepolia
                        ? Network.OptimismMainnet
                        : networkId
                }/claim-free-bet`,
                {
                    freeBetId: freeBet,
                    walletAddress,
                }
            );
            if (response.status === 200) {
                toast.update(toastId, getSuccessToastOptions(response.data));
                setFreeBet(undefined);
                localStorage.removeItem(LOCAL_STORAGE_KEYS.FREE_BET_ID);
                const queryParams = new URLSearchParams(location.search);
                if (queryParams.has('freeBet')) {
                    queryParams.delete('freeBet');
                    history.replace({
                        search: queryParams.toString(),
                    });
                }
                refetchGetFreeBet(freeBet, networkId);
                refetchFreeBetBalance(walletAddress, networkId);
            } else {
                toast.update(toastId, getErrorToastOptions(response.data));
            }
        } catch (e: any) {
            console.log(e);
            if (e?.response?.data) {
                toast.update(toastId, getErrorToastOptions(e.response.data));
            } else {
                toast.update(toastId, getErrorToastOptions('Unknown error'));
            }
            console.log(e);
        }
    }
};

let freeBetModalShown = false;

export const setFreeBetModalShown = (value: boolean) => {
    freeBetModalShown = value;
};

export const getFreeBetModalShown = () => freeBetModalShown;
