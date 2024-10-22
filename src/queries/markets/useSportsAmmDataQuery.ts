import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import { SportsAmmData } from 'types/markets';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/networkConnector';

const useSportsAmmDataQuery = (
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<SportsAmmData | undefined>({
        queryKey: QUERY_KEYS.SportsAmmData(queryConfig.networkId),
        queryFn: async () => {
            try {
                const sportsAmmData: SportsAmmData = {
                    minBuyInAmount: 0,
                    maxTicketSize: 0,
                    maxSupportedAmount: 0,
                    maxSupportedOdds: 0,
                    safeBoxFee: 0,
                };

                const sportsAMMDataContract = (await getContractInstance(
                    ContractType.SPORTS_AMM_DATA,
                    queryConfig.client,
                    queryConfig.networkId
                )) as ViemContract;

                if (sportsAMMDataContract) {
                    const sportsAMMParameters = await sportsAMMDataContract.read.getSportsAMMParameters();

                    sportsAmmData.minBuyInAmount = bigNumberFormatter(
                        sportsAMMParameters.minBuyInAmount,
                        getDefaultDecimalsForNetwork(queryConfig.networkId)
                    );
                    sportsAmmData.maxTicketSize = Number(sportsAMMParameters.maxTicketSize);
                    sportsAmmData.maxSupportedAmount = bigNumberFormatter(
                        sportsAMMParameters.maxSupportedAmount,
                        getDefaultDecimalsForNetwork(queryConfig.networkId)
                    );
                    sportsAmmData.maxSupportedOdds = bigNumberFormatter(sportsAMMParameters.maxSupportedOdds);
                    sportsAmmData.safeBoxFee = bigNumberFormatter(sportsAMMParameters.safeBoxFee);
                }

                return sportsAmmData;
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        ...options,
    });
};

export default useSportsAmmDataQuery;
