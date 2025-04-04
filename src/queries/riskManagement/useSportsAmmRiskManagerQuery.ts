import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { League } from 'overtime-utils';
import { NetworkConfig } from 'types/network';
import { SportsAmmRiskManagerData } from 'types/riskManagement';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';

const useSportsAmmRiskManagerQuery = (
    league: League,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<SportsAmmRiskManagerData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<SportsAmmRiskManagerData>({
        queryKey: QUERY_KEYS.SportsAmmRiskManager(networkConfig.networkId, league),
        queryFn: async () => {
            const riskManagerData: SportsAmmRiskManagerData = {
                sgpOnLeagueIdEnabled: false,
            };

            try {
                const sportsAMMV2RiskManagerContract = getContractInstance(
                    ContractType.SPORTS_AMM_V2_RISK_MANAGER,
                    networkConfig
                ) as ViemContract;

                if (sportsAMMV2RiskManagerContract) {
                    const isSgpForLeagueEnabled = await sportsAMMV2RiskManagerContract.read.sgpOnSportIdEnabled([
                        league,
                    ]);

                    riskManagerData.sgpOnLeagueIdEnabled = isSgpForLeagueEnabled;
                }
            } catch (e) {
                console.log(e);
            }

            return riskManagerData;
        },
        ...options,
    });
};

export default useSportsAmmRiskManagerQuery;
