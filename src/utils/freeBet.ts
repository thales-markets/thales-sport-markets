import axios from 'axios';
import { generalConfig } from 'config/general';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { Network } from 'enums/network';
import { t } from 'i18next';
import { toast } from 'react-toastify';

export const claimFreeBet = async (
    walletAddress: string,
    freeBet: string | undefined,
    networkId: Network,
    setFreeBet: (betId: string | undefined) => void,
    history: any
) => {
    const toastId = toast.loading(t('market.toast-message.transaction-pending'));

    if (walletAddress) {
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
                const queryParams = new URLSearchParams(location.search);
                if (queryParams.has('freeBet')) {
                    queryParams.delete('freeBet');
                    history.replace({
                        search: queryParams.toString(),
                    });
                }
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
