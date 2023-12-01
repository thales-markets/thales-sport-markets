import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import networkConnector from 'utils/networkConnector';
import { Network } from 'enums/network';
import { OvertimeVoucher, OvertimeVouchers } from 'types/tokens';
import thalesData from 'thales-data';

const useOvertimeVoucherQuery = (
    walletAddress: string,
    networkId: Network,
    options?: UseQueryOptions<OvertimeVoucher | undefined>
) => {
    return useQuery<OvertimeVoucher | undefined>(
        QUERY_KEYS.Wallet.OvertimeVoucher(walletAddress, networkId),
        async () => {
            try {
                const overtimeVouchers: OvertimeVouchers = await thalesData.sportMarkets.overtimeVouchers({
                    address: walletAddress,
                    network: networkId,
                });

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
