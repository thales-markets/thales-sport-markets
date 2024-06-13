import axios from 'axios';
import { generalConfig } from 'config/general';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import { OvertimeVoucher, OvertimeVouchers } from 'types/tokens';
import networkConnector from 'utils/networkConnector';
import QUERY_KEYS from '../../constants/queryKeys';

const useOvertimeVoucherQuery = (
    walletAddress: string,
    networkId: Network,
    options?: UseQueryOptions<OvertimeVoucher | undefined>
) => {
    return useQuery<OvertimeVoucher | undefined>(
        QUERY_KEYS.Wallet.OvertimeVoucher(walletAddress, networkId),
        async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.Vouchers}/${networkId}?address=${walletAddress}`
                );
                const overtimeVouchers: OvertimeVouchers = response?.data ? response.data : [];

                if (overtimeVouchers.length > 0) {
                    const overtimeVoucher = overtimeVouchers[0];
                    const { overtimeVoucherContract } = networkConnector;

                    const remainingAmount = await overtimeVoucherContract?.amountInVoucher(overtimeVoucher.id);

                    overtimeVoucher.remainingAmount = bigNumberFormatter(
                        remainingAmount,
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    return overtimeVoucher;
                }
            } catch (e) {
                console.log(e);
            }
            return undefined;
        },
        {
            ...options,
        }
    );
};

export default useOvertimeVoucherQuery;
