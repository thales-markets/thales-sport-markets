import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import { SportsAmmData } from 'types/markets';
import networkConnector from 'utils/networkConnector';

const useSportsAmmDataQuery = (networkId: Network, options?: UseQueryOptions<SportsAmmData | undefined>) => {
    return useQuery<SportsAmmData | undefined>(
        QUERY_KEYS.SportsAmmData(networkId),
        async () => {
            try {
                const sportsAmmData: SportsAmmData = {
                    minBuyInAmount: 0,
                    maxTicketSize: 0,
                    maxSupportedAmount: 0,
                    maxSupportedOdds: 0,
                    safeBoxFee: 0,
                };

                const { sportsAMMDataContract } = networkConnector;
                if (sportsAMMDataContract) {
                    const sportsAMMParameters = await sportsAMMDataContract.getSportsAMMParameters();

                    sportsAmmData.minBuyInAmount = bigNumberFormatter(
                        sportsAMMParameters.minBuyInAmount,
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    sportsAmmData.maxTicketSize = Number(sportsAMMParameters.maxTicketSize);
                    sportsAmmData.maxSupportedAmount = bigNumberFormatter(
                        sportsAMMParameters.maxSupportedAmount,
                        getDefaultDecimalsForNetwork(networkId)
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
        {
            ...options,
        }
    );
};

export default useSportsAmmDataQuery;
