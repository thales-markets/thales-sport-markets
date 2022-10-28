import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ParlayAmmData } from 'types/markets';
import networkConnector from 'utils/networkConnector';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import { NetworkId } from 'types/network';

const useParlayAmmDataQuery = (networkId: NetworkId, options?: UseQueryOptions<ParlayAmmData | undefined>) => {
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
                };

                const { parlayMarketsAMMContract } = networkConnector;
                if (parlayMarketsAMMContract) {
                    const [
                        minUsdAmount,
                        maxSupportedAmount,
                        maxSupportedOdds,
                        parlayAmmFee,
                        safeBoxImpact,
                    ] = await Promise.all([
                        parlayMarketsAMMContract.minUSDAmount(),
                        parlayMarketsAMMContract.maxSupportedAmount(),
                        parlayMarketsAMMContract.maxSupportedOdds(),
                        parlayMarketsAMMContract.parlayAmmFee(),
                        parlayMarketsAMMContract.safeBoxImpact(),
                    ]);
                    parlayData.minUsdAmount = bigNumberFormatter(minUsdAmount);
                    parlayData.maxSupportedAmount = bigNumberFormatter(maxSupportedAmount);
                    parlayData.maxSupportedOdds = bigNumberFormatter(maxSupportedOdds);
                    parlayData.parlayAmmFee = bigNumberFormatter(parlayAmmFee);
                    parlayData.safeBoxImpact = bigNumberFormatter(safeBoxImpact);
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
