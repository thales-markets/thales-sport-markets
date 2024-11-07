import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { Network } from 'enums/network';
import { ethers } from 'ethers';
import { bigNumberFormatter } from 'thales-utils';
import { StakingData } from 'types/markets';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import ccipCollector from 'utils/contracts/ccipCollector';
import { getContractInstance } from 'utils/networkConnector';
import { generalConfig } from '../../config/general';

const APR_FREQUENCY = 52;
const aprToApy = (interest: number) => ((1 + interest / 100 / APR_FREQUENCY) ** APR_FREQUENCY - 1) * 100;

const useUserStakingDataQuery = (
    walletAddress: string,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<StakingData | undefined>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<StakingData | undefined>({
        queryKey: QUERY_KEYS.Wallet.StakingData(walletAddress, queryConfig.networkId),
        queryFn: async () => {
            const stakingData: StakingData = {
                isPaused: false,
                isUnstaking: false,
                apy: 0,
            };
            try {
                const stakingThalesContract = (await getContractInstance(
                    ContractType.STAKING_THALES,
                    queryConfig.client,
                    queryConfig.networkId
                )) as ViemContract;

                if (stakingThalesContract) {
                    const baseProvider = new ethers.providers.JsonRpcProvider(
                        `https://base-mainnet.blastapi.io/${process.env.REACT_APP_BLAST_PROJECT_ID}`,
                        Network.Base
                    );

                    const ccipCollectorContract = new ethers.Contract(
                        ccipCollector.addresses[Network.Base],
                        ccipCollector.abi,
                        baseProvider
                    );

                    const period = Number(await ccipCollectorContract.period()) - 1;

                    const [
                        paused,
                        closingPeriodInProgress,
                        unstaking,
                        price,
                        stakedAmount,
                        escrowedAmount,
                        calculatedRevenueForPeriod,
                        baseRewardsPool,
                        bonusRewardsPool,
                    ] = await Promise.all([
                        stakingThalesContract.read.paused(),
                        stakingThalesContract.read.closingPeriodInProgress(),
                        stakingThalesContract.read.unstaking([walletAddress]),
                        axios.get(`${generalConfig.API_URL}/token/price`),
                        ccipCollectorContract.calculatedStakedAmountForPeriod(Number(period)),
                        ccipCollectorContract.calculatedEscrowedAmountForPeriod(Number(period)),
                        ccipCollectorContract.calculatedRevenueForPeriod(Number(period)),
                        ccipCollectorContract.baseRewardsPerPeriod(),
                        ccipCollectorContract.extraRewardsPerPeriod(),
                    ]);
                    stakingData.isPaused = paused || closingPeriodInProgress;
                    stakingData.isUnstaking = unstaking;

                    const revShare = period <= 3 ? 30000 : bigNumberFormatter(calculatedRevenueForPeriod);
                    const thalesTokenPrice = Number(price.data);

                    const feeAPR =
                        (revShare * 52 * 100) /
                        ((bigNumberFormatter(stakedAmount) + bigNumberFormatter(escrowedAmount)) * thalesTokenPrice);

                    const thalesRewardsAPR =
                        ((bigNumberFormatter(baseRewardsPool) + bigNumberFormatter(bonusRewardsPool)) * 52 * 100) /
                        (bigNumberFormatter(stakedAmount) + bigNumberFormatter(escrowedAmount));

                    const feeApy = aprToApy(feeAPR);
                    const thalesApy = aprToApy(thalesRewardsAPR);

                    stakingData.apy = (feeApy + thalesApy) / 100;

                    return stakingData;
                }
            } catch (e) {
                console.log(e);
            }

            return undefined;
        },
        ...options,
    });
};

export default useUserStakingDataQuery;
