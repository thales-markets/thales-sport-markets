import { ENETPULSE_ROUNDS } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ethers } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { SportMarketLiveResult } from 'types/markets';
import networkConnector from 'utils/networkConnector';
import Web3 from 'web3';
import marketContract from 'utils/contracts/sportsMarketContract';

const useEnetpulseAdditionalDataQuery = (
    marketId: string,
    gameDate: string,
    sportTag: number,
    options?: UseQueryOptions<SportMarketLiveResult | undefined>
) => {
    return useQuery<SportMarketLiveResult | undefined>(
        QUERY_KEYS.EnetpulseLiveResult(marketId, gameDate, sportTag),
        async () => {
            const sportParameter = sportTag - 9000;

            try {
                const response = await fetch(
                    `https://api.thalesmarket.io/enetpulse-result/${sportParameter}/${gameDate}`
                );
                const events = Object.values(JSON.parse(await response.text()).events);

                console.log(events);

                let gameIdString = '';
                if (marketId.length == 42) {
                    // marketId represents market address in types ParlayMarket and AccountPositionProfile
                    const contract = new ethers.Contract(marketId, marketContract.abi, networkConnector.provider);

                    const [gameId] = await Promise.all([contract?.getGameId()]);
                    gameIdString = Web3.utils.hexToAscii(gameId);
                }

                let trimmedMarketId = '';
                if (gameIdString == '') {
                    for (let i = 0; i < marketId.length; i++) {
                        if (!Number.isNaN(Number(marketId[i]))) {
                            trimmedMarketId = trimmedMarketId.concat(marketId[i]);
                        }
                    }
                } else {
                    for (let i = 0; i < gameIdString.length; i++) {
                        if (!Number.isNaN(Number(marketId[i]))) {
                            trimmedMarketId = trimmedMarketId.concat(marketId[i]);
                        }
                    }
                }

                console.log(trimmedMarketId);
                const event = events.find((sportEvent: any) => sportEvent.id == trimmedMarketId) as any;

                console.log(event.tournament_stage_name);

                if (event) {
                    const tournamentName = event.tournament_stage_name;
                    const tournamentRound = ENETPULSE_ROUNDS[Number(event.round_typeFK)];

                    const period = 0;
                    const status = 'finished';
                    const displayClock = '0';
                    const sportId = sportParameter;

                    const finalResult: SportMarketLiveResult = {
                        homeScore: 0,
                        awayScore: 0,
                        period,
                        status,
                        scoreHomeByPeriod: [],
                        scoreAwayByPeriod: [],
                        displayClock,
                        sportId,
                        tournamentName,
                        tournamentRound,
                    };
                    return finalResult;
                }

                return undefined;
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

export default useEnetpulseAdditionalDataQuery;
