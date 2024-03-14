import QUERY_KEYS from 'constants/queryKeys';
import { UseQueryOptions, useQuery } from 'react-query';
import { NetworkId, coinFormatter } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { getDefaultCollateral } from 'utils/collaterals';
import { isMarchMadnessAvailableForNetworkId } from 'utils/marchMadness';
import networkConnector from 'utils/networkConnector';

type MarchMadnessStats = {
    totalBracketsMinted: number;
    poolSize: number;
};

const useMarchMadnessStatsQuery = (networkId: NetworkId, options?: UseQueryOptions<any>) => {
    return useQuery<MarchMadnessStats>(
        QUERY_KEYS.MarchMadness.Stats(networkId),
        async () => {
            const marchMadnessData: MarchMadnessStats = {
                totalBracketsMinted: 0,
                poolSize: 0,
            };

            try {
                const { marchMadnessContract, multipleCollateral } = networkConnector;

                const defaultCollateralContract =
                    multipleCollateral && multipleCollateral[getDefaultCollateral(networkId as SupportedNetwork)];

                if (
                    marchMadnessContract &&
                    defaultCollateralContract &&
                    isMarchMadnessAvailableForNetworkId(networkId)
                ) {
                    const [poolSize, totalBracketsMinted] = await Promise.all([
                        await defaultCollateralContract.balanceOf(marchMadnessContract.address),
                        await marchMadnessContract.getCurrentTokenId(),
                    ]);

                    marchMadnessData.poolSize = coinFormatter(poolSize, networkId);
                    marchMadnessData.totalBracketsMinted = Number(totalBracketsMinted);
                }

                return marchMadnessData;
            } catch (e) {
                console.log(e);
                return marchMadnessData;
            }
        },
        options
    );
};

export default useMarchMadnessStatsQuery;
