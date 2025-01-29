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
            `${sgpParams.marketNames.join()}${sgpParams.typeIds.join()}${sgpParams.lines.join()}${sgpParams.playerIds.join()}`
        ),
        queryFn: async () => {
            let sgpData: SgpData = {
                data: {
                    initial: {
                        error: null,
                        missingEntries: null,
                        legs: null,
                        price: null,
                        priceWithSpread: null,
                    },
                },
            };

            const marketNames = sgpParams.marketNames.join();
            const typeIds = sgpParams.typeIds.join();
            const lines = sgpParams.lines.join();
            const playerIds = sgpParams.playerIds.join();

            try {
                const sgpResponse = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkConfig.networkId}/sgp/quote?gameId=${sgpParams.gameId}&marketNames=${marketNames}&typeIds=${typeIds}&lines=${lines}&playerIds=${playerIds}`,
                    noCacheConfig
                );

                if (sgpResponse.status === 200) {
                    sgpData = sgpResponse.data;
                }
            } catch (e: any) {
                console.log(e);
                sgpData.data.initial.error = e.response.data.error;
            }

            return sgpData;
        },
        ...options,
    });
};

export default useSgpDataQuery;
