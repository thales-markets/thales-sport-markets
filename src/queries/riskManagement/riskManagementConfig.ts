import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { RiskManagementConfig } from 'enums/riskManagement';
import { UseQueryOptions, useQuery } from 'react-query';
import { RiskManagementData } from 'types/riskManagement';

const useRiskManagementConfigQuery = (
    networkId: Network,
    configType: RiskManagementConfig,
    options?: UseQueryOptions<RiskManagementData>
) => {
    return useQuery<RiskManagementData>(
        QUERY_KEYS.RiskManagementConfig(networkId, configType),
        async () => {
            let config: RiskManagementData = {};
            try {
                const configResponse = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/risk-management-config/${configType}`,
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
        { ...options }
    );
};

export default useRiskManagementConfigQuery;
