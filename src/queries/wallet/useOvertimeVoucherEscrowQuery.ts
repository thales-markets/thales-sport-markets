import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { NetworkId } from 'types/network';
import { getDefaultDecimalsForNetwork } from 'utils/collaterals';
import { bigNumberFormmaterWithDecimals } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';

type OvertimeVoucherEscrowData = {
    isClaimable: boolean;
    isClaimed: boolean;
    voucherAmount: number;
    hoursLeftToClaim: number;
};

const useOvertimeVoucherEscrowQuery = (walletAddress: string, networkId: NetworkId, options?: UseQueryOptions<any>) => {
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
                const { overtimeVoucherEscrowContract } = networkConnector;

                if (overtimeVoucherEscrowContract && walletAddress) {
                    const period = await overtimeVoucherEscrowContract.period();

                    const [isWhitelisted, isClaimed, voucherAmount, isPeriodEnded, periodEnd] = await Promise.all([
                        overtimeVoucherEscrowContract.isWhitelistedAddress(walletAddress),
                        overtimeVoucherEscrowContract.addressClaimedVoucherPerPeriod(period, walletAddress),
                        overtimeVoucherEscrowContract.voucherAmount(),
                        overtimeVoucherEscrowContract.claimingPeriodEnded(),
                        overtimeVoucherEscrowContract.periodEnd(period),
                    ]);

                    const isClaimable = isWhitelisted && !isPeriodEnded && !isClaimed;

                    overtimeVoucherEscrowData.isClaimable = isClaimable;
                    overtimeVoucherEscrowData.isClaimed = isClaimed;
                    overtimeVoucherEscrowData.voucherAmount = bigNumberFormmaterWithDecimals(
                        voucherAmount,
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    overtimeVoucherEscrowData.hoursLeftToClaim = Math.floor(
                        (Number(periodEnd) * 1000 - Date.now()) / 1000 / 60 / 60
                    );
                }

                return overtimeVoucherEscrowData;
            } catch (e) {
                console.log(e);
                return overtimeVoucherEscrowData;
            }
        },
        options
    );
};

export default useOvertimeVoucherEscrowQuery;
