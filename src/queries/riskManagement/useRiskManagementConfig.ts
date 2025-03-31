import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { RiskManagementConfig } from 'enums/riskManagement';
import { NetworkConfig } from 'types/network';
import {
    RiskManagementData,
    RiskManagementLeaguesAndTypes,
    RiskManagementSgpBlockers,
    RiskManagementSgpBuilders,
} from 'types/riskManagement';

const useRiskManagementConfigQuery = (
    configTypes: RiskManagementConfig[],
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<RiskManagementData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<RiskManagementData>({
        queryKey: QUERY_KEYS.RiskManagementConfig(networkConfig.networkId, configTypes.join()),
        queryFn: async () => {
            let config: RiskManagementData = {};
            try {
                const configResponse = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${
                        networkConfig.networkId
                    }/risk-management-config?configTypes=${configTypes.join()}`,
                    noCacheConfig
                );

                const configData = configResponse.data;

                configTypes.forEach((configType) => {
                    switch (configType) {
                        case RiskManagementConfig.LEAGUES:
                            const leagues = configData.leagues.map((leagueInfo: any) => ({
                                leagueId: Number(leagueInfo.sportId),
                                marketName: leagueInfo.marketName,
                                enabled: leagueInfo.enabled === 'true',
                            }));
                            config = {
                                ...config,
                                leagues,
                                spreadTypes: configData.spreadTypes,
                                totalTypes: configData.totalTypes,
                            } as RiskManagementLeaguesAndTypes;
                            break;
                        case RiskManagementConfig.SGP_BLOCKERS:
                            config = {
                                ...config,
                                sgpBlockers: (configData as RiskManagementSgpBlockers).sgpBlockers.filter(
                                    (sgpBlocker) => sgpBlocker.enabled
                                ),
                            };
                            break;
                        case RiskManagementConfig.SGP_BUILDERS:
                            config = {
                                ...config,
                                sgpBuilders: (configData as RiskManagementSgpBuilders).sgpBuilders.filter(
                                    (sgpBuilder) => sgpBuilder.enabled
                                ),
                            };
                            break;
                        default:
                            config = {};
                    }
                });
            } catch (e) {
                console.log(e);
            }
            return config;
        },
        ...options,
    });
};

export default useRiskManagementConfigQuery;
