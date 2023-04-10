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

                const { parlayMarketDataContract } = networkConnector;
                if (parlayMarketDataContract) {
                    const parlayAMMParameters = await parlayMarketDataContract.getParlayAMMParameters();

                    parlayData.minUsdAmount = bigNumberFormmaterWithDecimals(
                        parlayAMMParameters.minUSDAmount,
                        getDefaultDecimalsForNetwork(networkId)
                    );
                    parlayData.maxSupportedAmount = bigNumberFormmaterWithDecimals(
                        parlayAMMParameters.maxSupportedAmount
                    );
                    parlayData.maxSupportedOdds = bigNumberFormmaterWithDecimals(parlayAMMParameters.maxSupportedOdds);
                    parlayData.parlayAmmFee = bigNumberFormmaterWithDecimals(parlayAMMParameters.parlayAmmFee);
                    parlayData.safeBoxImpact = bigNumberFormmaterWithDecimals(parlayAMMParameters.safeBoxImpact);
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
