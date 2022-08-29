import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { OvertimeVoucher, OvertimeVouchers } from 'types/tokens';
import thalesData from 'thales-data';

const useTokenBalanceQuery = (
    walletAddress: string,
    networkId: NetworkId,
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

                    const [remainingAmount, image] = await Promise.all([
                        overtimeVoucherContract?.amountInVoucher(overtimeVoucher.id),
                        overtimeVoucherContract?.tokenURI(overtimeVoucher.id),
                    ]);

                    overtimeVoucher.remainingAmount = bigNumberFormatter(remainingAmount);
                    overtimeVoucher.image = image;
                    return overtimeVoucher;
                }
            } catch (e) {
                console.log(e);
            }
            return undefined;
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useTokenBalanceQuery;
