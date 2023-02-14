import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ParlayAmmData } from 'types/markets';
import networkConnector from 'utils/networkConnector';
import { bigNumberFormmaterWithDecimals } from 'utils/formatters/ethers';
import { NetworkId } from 'types/network';
import { getDefaultDecimalsForNetwork } from 'utils/collaterals';

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
                    parlaySize: 0,
                };

                const { parlayMarketsAMMContract } = networkConnector;
                if (parlayMarketsAMMContract) {
                    const [
                        minUsdAmount,
                        maxSupportedAmount,
                        maxSupportedOdds,
                        parlayAmmFee,
                        safeBoxImpact,
                        parlaySize,
                    ] = await Promise.all([
                        parlayMarketsAMMContract.minUSDAmount(),
                        parlayMarketsAMMContract.maxSupportedAmount(),
                        parlayMarketsAMMContract.maxSupportedOdds(),
                        parlayMarketsAMMContract.parlayAmmFee(),
                        parlayMarketsAMMContract.safeBoxImpact(),
                        parlayMarketsAMMContract.parlaySize(),
                    ]);
                    parlayData.minUsdAmount = bigNumberFormmaterWithDecimals(
                        minUsdAmount,
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    parlayData.maxSupportedAmount = bigNumberFormmaterWithDecimals(maxSupportedAmount);
                    parlayData.maxSupportedOdds = bigNumberFormmaterWithDecimals(maxSupportedOdds);
                    parlayData.parlayAmmFee = bigNumberFormmaterWithDecimals(parlayAmmFee);
                    parlayData.safeBoxImpact = bigNumberFormmaterWithDecimals(safeBoxImpact);
                    parlayData.parlaySize = Number(parlaySize);
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
