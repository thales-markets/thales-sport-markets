import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { League } from 'enums/sports';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';

const useSportsAmmRiskManagerQuery = (
    league: League,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<boolean>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<boolean>({
        queryKey: QUERY_KEYS.SportsAmmRiskManager(networkConfig.networkId, league),
        queryFn: async () => {
            let isEnabled = false;

            try {
                const sportsAMMV2RiskManagerContract = getContractInstance(
                    ContractType.SPORTS_AMM_V2_RISK_MANAGER,
                    networkConfig
                ) as ViemContract;

                if (sportsAMMV2RiskManagerContract) {
                    isEnabled = await sportsAMMV2RiskManagerContract.read.sgpOnSportIdEnabled([league]);
                }
            } catch (e) {
                console.log(e);
            }

            return isEnabled;
        },
        ...options,
    });
};

export default useSportsAmmRiskManagerQuery;
