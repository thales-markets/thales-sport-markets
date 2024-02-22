import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import networkConnector from 'utils/networkConnector';

type OvertimeVoucherEscrowData = {
    isClaimable: boolean;
    isClaimed: boolean;
    voucherAmount: number;
    hoursLeftToClaim: number;
};

const useOvertimeVoucherEscrowQuery = (walletAddress: string, networkId: Network, options?: UseQueryOptions<any>) => {
    return useQuery<OvertimeVoucherEscrowData>(
        QUERY_KEYS.Wallet.OvertimeVoucherEscrow(walletAddress, networkId),
        async () => {
            const overtimeVoucherEscrowData: OvertimeVoucherEscrowData = {
                isClaimable: false,
                isClaimed: false,
                voucherAmount: 0,
                hoursLeftToClaim: 0,
            };

            try {
                const {
                    sportPositionalMarketDataContract,
                    sUSDContract,
                    overtimeVoucherEscrowContract,
                } = networkConnector;

                if (
                    sportPositionalMarketDataContract &&
                    walletAddress &&
                    sUSDContract &&
                    overtimeVoucherEscrowContract
                ) {
                    const [voucherEscrowData, balance] = await Promise.all([
                        sportPositionalMarketDataContract.getVoucherEscrowData(walletAddress),
                        sUSDContract.balanceOf(overtimeVoucherEscrowContract.address),
                    ]);

                    const voucherEscrowBalance = bigNumberFormatter(balance, getDefaultDecimalsForNetwork(networkId));
                    const voucherAmount = bigNumberFormatter(
                        voucherEscrowData.voucherAmount,
                        getDefaultDecimalsForNetwork(networkId)
                    );

                    const isClaimable =
                        voucherEscrowData.isWhitelisted &&
                        !voucherEscrowData.isPeriodEnded &&
                        !voucherEscrowData.isClaimed &&
                        voucherEscrowBalance >= voucherAmount;

                    overtimeVoucherEscrowData.isClaimable = isClaimable;
                    overtimeVoucherEscrowData.isClaimed = voucherEscrowData.isClaimed;
                    overtimeVoucherEscrowData.voucherAmount = voucherAmount;
                    overtimeVoucherEscrowData.hoursLeftToClaim = Math.floor(
                        (Number(voucherEscrowData.periodEnd) * 1000 - Date.now()) / 1000 / 60 / 60
                    );
                }

                return overtimeVoucherEscrowData;
            } catch (e) {
                console.log(e);
                return overtimeVoucherEscrowData;
            }
        },
        {
            ...options,
            enabled: options?.enabled && networkId !== Network.OptimismSepolia,
        }
    );
};

export default useOvertimeVoucherEscrowQuery;
