import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { RiskManagementConfig } from 'enums/riskManagement';
import { NetworkConfig } from 'types/network';
import { RiskManagementData } from 'types/riskManagement';

const useRiskManagementConfigQuery = (
    configType: RiskManagementConfig,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<RiskManagementData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<RiskManagementData>({
        queryKey: QUERY_KEYS.RiskManagementConfig(networkConfig.networkId, configType),
        queryFn: async () => {
            let config: RiskManagementData = {};
            try {
                const configResponse = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkConfig.networkId}/risk-management-config/${configType}`,
                    noCacheConfig
                );

                const configData = configResponse.data;

                switch (configType) {
                    case RiskManagementConfig.LEAGUES:
                        const leagues = configData.leagues.map((leagueInfo: any) => ({
                            leagueId: Number(leagueInfo.sportId),
                            marketName: leagueInfo.marketName,
                            enabled: leagueInfo.enabled === 'true',
                        }));
                        config = {
                            leagues,
                            spreadTypes: configData.spreadTypes,
                            totalTypes: configData.totalTypes,
                        };
                        break;
                    default:
                        config = {};
                }
            } catch (e) {
                console.log(e);
            }
            return config;
        },
        ...options,
    });
};

export default useRiskManagementConfigQuery;
