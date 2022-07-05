import { ethers } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { Odds } from '../../types/markets';
import marketContract from '../../utils/contracts/sportsMarketContract';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import networkConnector from '../../utils/networkConnector';

const useMarketCancellationOddsQuery = (marketAddress: string, options?: UseQueryOptions<Odds>) => {
    return useQuery<Odds>(
        QUERY_KEYS.MarketCancellationOdds(marketAddress),
        async () => {
            const odds = {
                home: 0,
                away: 0,
                draw: 0,
            };
            const contract = new ethers.Contract(marketAddress, marketContract.abi, networkConnector.provider);

            const [homeOdds, awayOdds, drawOdds] = await Promise.all([
                contract.homeOddsOnCancellation(),
                contract.awayOddsOnCancellation(),
                contract.drawOddsOnCancellation(),
            ]);

            odds.home = bigNumberFormatter(homeOdds);
            odds.away = bigNumberFormatter(awayOdds);
            odds.draw = bigNumberFormatter(drawOdds);

            return odds;
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useMarketCancellationOddsQuery;
