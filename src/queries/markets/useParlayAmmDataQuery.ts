import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ParlayAmmData } from 'types/markets';
import networkConnector from 'utils/networkConnector';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import { Network } from 'enums/network';

const useParlayAmmDataQuery = (networkId: Network, options?: UseQueryOptions<ParlayAmmData | undefined>) => {
    return useQuery<ParlayAmmData | undefined>(
        QUERY_KEYS.ParlayAmmData(networkId),
        async () => {
            try {
                const parlayData: ParlayAmmData = {
                    minUsdAmount: 0,
                    maxSupportedAmount: 0,
                    maxSupportedOdds: 0,
                    parlayAmmFee: 0,
                    safeBoxImpact: 0,
                    parlaySize: 0,
                };

                const { parlayMarketDataContract } = networkConnector;
                if (parlayMarketDataContract) {
                    const parlayAMMParameters = await parlayMarketDataContract.getParlayAMMParameters();

                    parlayData.minUsdAmount = bigNumberFormatter(
                        parlayAMMParameters.minUSDAmount,
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    parlayData.maxSupportedAmount = bigNumberFormatter(parlayAMMParameters.maxSupportedAmount);
                    parlayData.maxSupportedOdds = bigNumberFormatter(parlayAMMParameters.maxSupportedOdds);
                    parlayData.parlayAmmFee = bigNumberFormatter(parlayAMMParameters.parlayAmmFee);
                    parlayData.safeBoxImpact = bigNumberFormatter(parlayAMMParameters.safeBoxImpact);
                    parlayData.parlaySize = Number(parlayAMMParameters.parlaySize);
                }

                return parlayData;
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

export default useParlayAmmDataQuery;
