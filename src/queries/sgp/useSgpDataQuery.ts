import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkConfig } from 'types/network';
import { SgpData, SgpParams } from 'types/sgp';

const useSgpDataQuery = (
    sgpParams: SgpParams,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<SgpData>({
        queryKey: QUERY_KEYS.SgpData(
            networkConfig.networkId,
            sgpParams.gameId,
            `${sgpParams.positions.join()}${sgpParams.typeIds.join()}${sgpParams.lines.join()}${sgpParams.playerIds.join()}`
        ),
        queryFn: async () => {
            let sgpData: SgpData = {
                data: {
                    selectedSportsbook: {
                        error: null,
                        missingEntries: null,
                        legs: null,
                        price: null,
                        priceWithSpread: null,
                    },
                },
            };

            const positions = sgpParams.positions.join();
            const typeIds = sgpParams.typeIds.join();
            const lines = sgpParams.lines.join();
            const playerIds = sgpParams.playerIds.join();

            try {
                const sgpResponse = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkConfig.networkId}/sgp/quote?gameId=${sgpParams.gameId}&positions=${positions}&typeIds=${typeIds}&lines=${lines}&playerIds=${playerIds}&includeMaxSupportedOdds=false`,
                    noCacheConfig
                );

                // if data object is empty return initial object
                if (sgpResponse.status === 200 && Object.keys(sgpResponse.data.data).length) {
                    sgpData = sgpResponse.data;
                }
            } catch (e: any) {
                const errorData = JSON.stringify(e.response.data);
                console.error(errorData);
                if (errorData.toLowerCase().includes('combination blocked')) {
                    sgpData.data.selectedSportsbook.error = e.response.data;
                }
            }

            return sgpData;
        },
        ...options,
    });
};

export default useSgpDataQuery;
