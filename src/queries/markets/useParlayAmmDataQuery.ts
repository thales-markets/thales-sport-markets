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
                    maxSupportedAmount: 0,
                    maxSupportedOdds: 0,
                };

                const { parlayMarketsAMMContract, signer } = networkConnector;
                if (parlayMarketsAMMContract && signer) {
                    const parlayMarketsAMMContractWithSigner = parlayMarketsAMMContract.connect(signer);

                    const [maxSupportedAmount, maxSupportedOdds] = await Promise.all([
                        parlayMarketsAMMContractWithSigner.maxSupportedAmount(),
                        parlayMarketsAMMContractWithSigner.maxSupportedOdds(),
                    ]);
                    parlayData.maxSupportedAmount = bigNumberFormatter(maxSupportedAmount);
                    parlayData.maxSupportedOdds = bigNumberFormatter(maxSupportedOdds);
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
