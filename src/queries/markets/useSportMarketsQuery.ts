import QUERY_KEYS from 'constants/queryKeys';
import { SPORTS_MAP } from 'constants/tags';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { SportMarketInfo, SportMarkets } from 'types/markets';
import { NetworkId } from 'types/network';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import { fixDuplicatedTeamName } from 'utils/formatters/string';
import networkConnector from 'utils/networkConnector';

const useSportMarketsQuery = (networkId: NetworkId, options?: UseQueryOptions<SportMarkets>) => {
    return useQuery<SportMarkets>(
        QUERY_KEYS.SportMarkets(networkId),
        async () => {
            try {
                const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;
                const [markets, marketsWithOdds] = await Promise.all([
                    thalesData.sportMarkets.markets({
                        network: networkId,
                    }),
                    sportPositionalMarketDataContract?.getOddsForAllActiveMarkets(),
                ]);

                const mappedMarkets = markets.map((market: SportMarketInfo) => {
                    market.maturityDate = new Date(market.maturityDate);
                    market.homeTeam = fixDuplicatedTeamName(market.homeTeam);
                    market.awayTeam = fixDuplicatedTeamName(market.awayTeam);
                    market.sport = SPORTS_MAP[market.tags[0]];
                    marketsWithOdds
                        .filter((obj: any) => obj[0] === market.id)
                        .map((obj: any) => {
                            market.homeOdds = bigNumberFormatter(obj.odds[0]);
                            market.awayOdds = bigNumberFormatter(obj.odds[1]);
                            market.drawOdds = obj.odds[2] ? bigNumberFormatter(obj.odds[2]) : 0;
                        });
                    return market;
                });

                return mappedMarkets as SportMarkets;
            } catch (e) {
                console.log(e);
            }
            return [];
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useSportMarketsQuery;
