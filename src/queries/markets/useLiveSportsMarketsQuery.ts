import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { LIVE_SUPPORTED_LEAGUES } from 'constants/tags';
import { Network } from 'enums/network';
import { UseQueryOptions, useQuery } from 'react-query';
import { SportMarkets } from 'types/markets';

const useLiveSportsMarketsQuery = (networkId: Network, options?: UseQueryOptions<SportMarkets>) => {
    return useQuery<SportMarkets>(
        QUERY_KEYS.LiveSportMarkets(networkId),
        // @ts-ignore
        async () => {
            //TODO: remove
            // return [
            //     {
            //         gameId: '0x3039383362373366653864303666643531633430636136383233636637356430',
            //         sport: 'Basketball',
            //         leagueId: 9004,
            //         leagueName: 'NBA',
            //         typeId: 0,
            //         type: 'moneyline',
            //         maturity: 1710975600,
            //         maturityDate: new Date('2024-03-20T23:00:00.000Z'),
            //         homeTeam: 'Detroit Pistons',
            //         awayTeam: 'Indiana Pacers',
            //         homeScore: 0,
            //         awayScore: 0,
            //         finalResult: 0,
            //         status: 0,
            //         isOpen: true,
            //         isResolved: false,
            //         isCanceled: false,
            //         isPaused: false,
            //         isOneSideMarket: false,
            //         line: 0,
            //         isPlayerPropsMarket: false,
            //         isOneSidePlayerPropsMarket: false,
            //         isYesNoPlayerPropsMarket: false,
            //         playerProps: {
            //             playerId: 0,
            //             playerName: '',
            //         },
            //         combinedPositions: [[], []],
            //         odds: [0.210526315789, 0.833333333333],
            //         proof: [
            //             '0x8c5662ebc0972346988888bf56bce441daa22641b22951b36d3474921bf150b0',
            //             '0x53322309d957d1dc2f58126179b598c4a5b2cc76aaa1b587cec01820b3e20d93',
            //             '0x6ee756f23c962d80a11345206d725c5e42adec3477e3c4259ee4edaa9d2b4459',
            //             '0x3f862e996959d63f8705ae340c9887f62b342139622622a2823b35ee1ee1f5a2',
            //             '0x0e0cfa76add414ad49a4f623f3a405a9b6072e5d3fdaabcac041f68fdc71331c',
            //         ],
            //         childMarkets: [],
            //         live: true,
            //     },
            //     {
            //         gameId: '0x6463646231316231636436663336333933343134393730656135643663363332',
            //         sport: 'Basketball',
            //         leagueId: 9004,
            //         leagueName: 'NBA',
            //         typeId: 0,
            //         type: 'moneyline',
            //         maturity: 1710975600,
            //         maturityDate: new Date('2024-03-20T23:00:00.000Z'),
            //         homeTeam: 'Cleveland Cavaliers',
            //         awayTeam: 'Miami Heat',
            //         homeScore: 0,
            //         awayScore: 0,
            //         finalResult: 0,
            //         status: 0,
            //         isOpen: true,
            //         isResolved: false,
            //         isCanceled: false,
            //         isPaused: false,
            //         isOneSideMarket: false,
            //         line: 0,
            //         isPlayerPropsMarket: false,
            //         isOneSidePlayerPropsMarket: false,
            //         isYesNoPlayerPropsMarket: false,
            //         playerProps: {
            //             playerId: 0,
            //             playerName: '',
            //         },
            //         combinedPositions: [[], []],
            //         odds: [0.583333333332, 0.46511627907],
            //         proof: [
            //             '0x7637fe6dc8999047174291c490295e4875531f06c7024a93d13b02aefdab8c81',
            //             '0xd3ebb131823ce22d90e590c37f58f0dcccd0df46823734e691043d8c31010983',
            //             '0x4128a28b0cf9e3ac37e4f61d9ce1ca30f5f7f1c7622d49297f7c772d56d4c1b7',
            //             '0xfd6ce1ee03f7ce5e98dcea5c21960a5eb22e951f7082c15cd19e00d5b86981ca',
            //         ],
            //         childMarkets: [],
            //         live: true,
            //     },
            // ];

            const markets: any[] = [];
            try {
                const promises: any[] = [];
                LIVE_SUPPORTED_LEAGUES.forEach((league: number) => {
                    promises.push(axios.get(`${generalConfig.API_URL}/overtime-v2/live-markets?leagueId=${league}`));
                });
                const responses = await Promise.all(promises);
                // TODO REFACTOR THIS PART OF FILTERING AND FLATTENING
                responses
                    .filter((response) => !(typeof response.data == 'string'))
                    .forEach((response: any) => markets.push(response.data));
            } catch (e) {
                console.log(e);
            }
            const marketsFlattened = markets
                .reduce((accumulator, value) => accumulator.concat(value), [])
                .map((game: any) => {
                    return {
                        ...game,
                        live: true,
                        maturityDate: new Date(game.maturityDate),
                        odds: game.odds.map((odd: any) => odd.normalizedImplied),
                    };
                });
            return marketsFlattened;
        },
        {
            refetchInterval: 10 * 1000,
            ...options,
        }
    );
};

export default useLiveSportsMarketsQuery;
