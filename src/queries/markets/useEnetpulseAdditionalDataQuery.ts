import { ENETPULSE_ROUNDS } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ethers } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { SportMarketLiveResult } from 'types/markets';
import networkConnector from 'utils/networkConnector';
import Web3 from 'web3';
import marketContract from 'utils/contracts/sportsMarketContract';
import { SPORTS_TAGS_MAP } from 'constants/tags';

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

                let gameIdString = '';
                if (marketId.length == 42) {
                    // marketId represents market address in types ParlayMarket and AccountPositionProfile
                    const contract = new ethers.Contract(marketId, marketContract.abi, networkConnector.provider);

                    const gameId = await contract?.getGameId();
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
                const event = SPORTS_TAGS_MAP['Motosport'].includes(Number(sportTag))
                    ? events[0]
                    : (events.find((sportEvent: any) => sportEvent.id == trimmedMarketId) as any);
                if (event) {
                    const tournamentName = event.tournament_stage_name;
                    const tournamentRound = ENETPULSE_ROUNDS[Number(event.round_typeFK)];
                    const eventParticipants: any[] = SPORTS_TAGS_MAP['Motosport'].includes(Number(sportTag))
                        ? []
                        : Object.values(event.event_participants);
                    const homeResults: any[] = [];
                    const awayResults: any[] = [];

                    if (
                        !SPORTS_TAGS_MAP['eSports'].includes(Number(sportTag)) &&
                        !SPORTS_TAGS_MAP['Soccer'].includes(Number(sportTag)) &&
                        !SPORTS_TAGS_MAP['Motosport'].includes(Number(sportTag))
                    ) {
                        homeResults.push(...Object.values(eventParticipants[0].result));
                        awayResults.push(...Object.values(eventParticipants[1].result));
                    }

                    let homeScore = 0;
                    let awayScore = 0;
                    const scoreHomeByPeriod = [];
                    const scoreAwayByPeriod = [];
                    if (SPORTS_TAGS_MAP['Tennis'].includes(Number(sportTag))) {
                        homeScore = homeResults.find((result) => result.result_code.toLowerCase() == 'setswon').value;
                        awayScore = awayResults.find((result) => result.result_code.toLowerCase() == 'setswon').value;

                        for (let i = 1; i <= 5; i++) {
                            const homeSetResult = homeResults.find(
                                (result) => result.result_code.toLowerCase() == 'set' + i
                            );
                            if (homeSetResult) {
                                scoreHomeByPeriod.push(homeSetResult.value);
                            }

                            const awaySetResult = awayResults.find(
                                (result) => result.result_code.toLowerCase() == 'set' + i
                            );
                            if (awaySetResult) {
                                scoreAwayByPeriod.push(awaySetResult.value);
                            }
                        }
                    }

                    const period = 0;
                    const status = 'finished';
                    const displayClock = '0';
                    const sportId = sportTag;

                    const finalResult: SportMarketLiveResult = {
                        homeScore,
                        awayScore,
                        period,
                        status,
                        scoreHomeByPeriod,
                        scoreAwayByPeriod,
                        displayClock,
                        sportId,
                        tournamentName: sportTag == 9033 || sportTag == 9050 ? '' : tournamentName,
                        tournamentRound: sportTag == 9033 || sportTag == 9050 ? '' : tournamentRound,
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
