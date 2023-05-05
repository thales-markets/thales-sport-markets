import QUERY_KEYS from 'constants/queryKeys';
import { ethers } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { SportMarketLiveResult } from 'types/markets';
import networkConnector from 'utils/networkConnector';
import marketContract from 'utils/contracts/sportsMarketContract';
import Web3 from 'web3';

const useSportMarketLiveResultQuery = (
    marketId: string,
    options?: UseQueryOptions<SportMarketLiveResult | undefined>
) => {
    return useQuery<SportMarketLiveResult | undefined>(
        QUERY_KEYS.LiveResult(marketId),
        async () => {
            try {
                let gameIdString = '';
                if (marketId.length == 42) {
                    // marketId represents market address in types ParlayMarket and AccountPositionProfile
                    const contract = new ethers.Contract(marketId, marketContract.abi, networkConnector.provider);

                    const gameId = await contract?.getGameId();
                    gameIdString = Web3.utils.hexToAscii(gameId);
                }

                const response = await fetch(
                    `https://api.thalesmarket.io/live-result/${gameIdString != '' ? gameIdString : marketId}`
                );
                const resultData = JSON.parse(await response.text());

                const homeScore = resultData.events[0].score.score_home;
                const awayScore = resultData.events[0].score.score_away;
                const period = resultData.events[0].score.game_period;
                const status = resultData.events[0].score.event_status;
                const scoreHomeByPeriod = resultData.events[0].score.score_home_by_period;
                const scoreAwayByPeriod = resultData.events[0].score.score_away_by_period;
                const displayClock = resultData.events[0].score.display_clock;
                const sportId = resultData.events[0].sport_id + 9000;

                const liveResult: SportMarketLiveResult = {
                    homeScore,
                    awayScore,
                    period,
                    status,
                    scoreHomeByPeriod,
                    scoreAwayByPeriod,
                    displayClock,
                    sportId,
                };

                return liveResult;
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            refetchInterval: 10 * 1000,
            ...options,
        }
    );
};

export default useSportMarketLiveResultQuery;
