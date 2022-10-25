import { useQuery, UseQueryOptions } from 'react-query';
import { Balances, MarketData } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { ethers } from 'ethers';
import { NetworkId } from 'types/network';
import { bigNumberFormatter } from 'utils/formatters/ethers';

const usePositionSellPriceQuery = (
    market: MarketData,
    balances: Balances | undefined,
    networkId: NetworkId,
    options?: UseQueryOptions<Balances>
) => {
    return useQuery<Balances>(
        QUERY_KEYS.PositionSellPrice(market.address, networkId, balances),
        async () => {
            try {
                if (!balances) {
                    return {
                        home: 0,
                        away: 0,
                        draw: 0,
                    };
                }

                const sportsAMMContract = networkConnector.sportsAMMContract;

                const parsedHome = balances.home ? ethers.utils.parseEther(balances.home.toString()) : undefined;
                const parsedDraw = balances.draw ? ethers.utils.parseEther(balances.draw.toString()) : undefined;
                const parsedAway = balances.away ? ethers.utils.parseEther(balances.away.toString()) : undefined;

                const [homePositionsValue, awayPositionsValue, drawPositionsValue] = await Promise.all([
                    parsedHome ? await sportsAMMContract?.sellToAmmQuote(market.address, 0, parsedHome) : 0,
                    parsedAway ? await sportsAMMContract?.sellToAmmQuote(market.address, 1, parsedAway) : 0,
                    parsedDraw ? await sportsAMMContract?.sellToAmmQuote(market.address, 2, parsedDraw) : 0,
                ]);

                return {
                    home: homePositionsValue ? bigNumberFormatter(homePositionsValue) : 0,
                    away: awayPositionsValue ? bigNumberFormatter(awayPositionsValue) : 0,
                    draw: drawPositionsValue ? bigNumberFormatter(drawPositionsValue) : 0,
                };
            } catch (e) {
                console.log('Error ', e);
                return {
                    home: 0,
                    away: 0,
                    draw: 0,
                };
            }
        },
        {
            ...options,
        }
    );
};

export default usePositionSellPriceQuery;
