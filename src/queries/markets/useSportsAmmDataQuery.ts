import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import { SportsAmmData } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';

const useSportsAmmDataQuery = (
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<SportsAmmData | undefined>({
        queryKey: QUERY_KEYS.SportsAmmData(networkConfig.networkId),
        queryFn: async () => {
            try {
                const sportsAmmData: SportsAmmData = {
                    minBuyInAmount: 0,
                    maxTicketSize: 0,
                    maxSupportedAmount: 0,
                    maxSupportedOdds: 0,
                    safeBoxFee: 0,
                };

                const sportsAMMDataContract = getContractInstance(
                    ContractType.SPORTS_AMM_DATA,
                    networkConfig
                ) as ViemContract;

                if (sportsAMMDataContract) {
                    const sportsAMMParameters = await sportsAMMDataContract.read.getSportsAMMParameters();

                    sportsAmmData.minBuyInAmount = bigNumberFormatter(
                        sportsAMMParameters.minBuyInAmount,
                        getDefaultDecimalsForNetwork(networkConfig.networkId)
                    );
                    sportsAmmData.maxTicketSize = Number(sportsAMMParameters.maxTicketSize);
                    sportsAmmData.maxSupportedAmount = bigNumberFormatter(
                        sportsAMMParameters.maxSupportedAmount,
                        getDefaultDecimalsForNetwork(networkConfig.networkId)
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
