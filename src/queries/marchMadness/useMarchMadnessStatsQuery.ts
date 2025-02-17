import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { coinFormatter } from 'thales-utils';
import { NetworkConfig } from 'types/network';
import { getCollateralIndex, getDefaultCollateral } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { isMarchMadnessAvailableForNetworkId } from 'utils/marchMadness';

type MarchMadnessStats = {
    totalBracketsMinted: number;
    poolSize: number;
};

const useMarchMadnessStatsQuery = (
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<MarchMadnessStats>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<MarchMadnessStats>({
        queryKey: QUERY_KEYS.MarchMadness.Stats(networkConfig.networkId),
        queryFn: async () => {
            const marchMadnessData: MarchMadnessStats = {
                totalBracketsMinted: 0,
                poolSize: 0,
            };

            try {
                const marchMadnessContract = getContractInstance(ContractType.MARCH_MADNESS, {
                    client: networkConfig.client,
                    networkId: networkConfig.networkId,
                });

                const defaultCollateralContract = getContractInstance(
                    ContractType.MULTICOLLATERAL,
                    networkConfig,
                    getCollateralIndex(networkConfig.networkId, getDefaultCollateral(networkConfig.networkId))
                );

                if (
                    marchMadnessContract &&
                    defaultCollateralContract &&
                    isMarchMadnessAvailableForNetworkId(networkConfig.networkId)
                ) {
                    const [poolSize, totalBracketsMinted] = await Promise.all([
                        await defaultCollateralContract.read.balanceOf([marchMadnessContract.address]),
                        await marchMadnessContract.read.getCurrentTokenId(),
                    ]);

                    marchMadnessData.poolSize = coinFormatter(poolSize, networkConfig.networkId);
                    marchMadnessData.totalBracketsMinted = Number(totalBracketsMinted);
                }

                return marchMadnessData;
            } catch (e) {
                console.log(e);
                return marchMadnessData;
            }
        },
        ...options,
    });
};

export default useMarchMadnessStatsQuery;
