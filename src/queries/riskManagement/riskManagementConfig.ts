import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { RiskManagementConfig } from 'enums/riskManagement';
import { UseQueryOptions, useQuery } from 'react-query';

type RiskManagementData = {
    leagueId: number;
    marketName: string;
    enabled: boolean;
}[];

const useRiskManagementConfigQuery = (
    networkId: Network,
    configType: RiskManagementConfig,
    options?: UseQueryOptions<RiskManagementData>
) => {
    return useQuery<RiskManagementData>(
        QUERY_KEYS.RiskManagementConfig(networkId, configType),
        async () => {
            let config: RiskManagementData = [];
            try {
                const configResponse = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/risk-management-config/${configType}`,
                    noCacheConfig
                );

                const configData = configResponse.data;

                switch (configType) {
                    case RiskManagementConfig.LEAGUES:
                        config = configData.map((leagueInfo: any) => ({
                            leagueId: Number(leagueInfo.sportId),
                            marketName: leagueInfo.marketName,
                            enabled: leagueInfo.enabled === 'true',
                        }));
                        break;
                    default:
                        config = [];
                }

                return config;
            } catch (e) {
                console.log(e);
            }
            return config;
        },
        { ...options }
    );
};

export default useRiskManagementConfigQuery;
