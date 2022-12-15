import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { MarketData, ChildMarkets } from 'types/markets';
import { ethers } from 'ethers';
import networkConnector from 'utils/networkConnector';
import marketContract from 'utils/contracts/sportsMarketContract';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { Position, Side } from '../../constants/options';
import { groupBy, orderBy } from 'lodash';
import { BetType } from 'constants/tags';

const useChildMarketsQuery = (parentMarket: MarketData, isSell: boolean, options?: UseQueryOptions<ChildMarkets>) => {
    return useQuery<ChildMarkets>(
        QUERY_KEYS.ChildMarkets(parentMarket.address, isSell),
        async () => {
            try {
                const childMarkets = await Promise.all(
                    parentMarket.childMarketsAddresses.map(async (childMarketAddress) => {
                        const contract = new ethers.Contract(
                            childMarketAddress,
                            marketContract.abi,
                            networkConnector.provider
                        );

                        const sportsAMMContract = networkConnector.sportsAMMContract;
                        const gamesOddsObtainerContract = networkConnector.gamesOddsObtainerContract;

                        const [
                            tags,
                            betType,
                            resolved,
                            finalResult,
                            cancelled,
                            paused,
                            marketDefaultOdds,
                            spread,
                            total,
                        ] = await Promise.all([
                            contract?.tags(0),
                            contract?.tags(1),
                            contract?.resolved(),
                            contract?.finalResult(),
                            contract?.cancelled(),
                            contract?.paused(),
                            sportsAMMContract?.getMarketDefaultOdds(childMarketAddress, isSell),
                            gamesOddsObtainerContract?.childMarketSread(childMarketAddress),
                            gamesOddsObtainerContract?.childMarketTotal(childMarketAddress),
                        ]);

                        const homeOdds = bigNumberFormatter(marketDefaultOdds[0]);
                        const awayOdds = bigNumberFormatter(marketDefaultOdds[1]);
                        const drawOdds = marketDefaultOdds[2]
                            ? bigNumberFormatter(marketDefaultOdds[2] || 0)
                            : undefined;

                        const market: MarketData = {
                            address: childMarketAddress.toLowerCase(),
                            gameDetails: parentMarket.gameDetails,
                            positions: {
                                [Position.HOME]: {
                                    sides: {
                                        [Side.BUY]: {
                                            odd: homeOdds,
                                        },
                                        [Side.SELL]: {
                                            odd: homeOdds,
                                        },
                                    },
                                },
                                [Position.AWAY]: {
                                    sides: {
                                        [Side.BUY]: {
                                            odd: awayOdds,
                                        },
                                        [Side.SELL]: {
                                            odd: awayOdds,
                                        },
                                    },
                                },
                                [Position.DRAW]: {
                                    sides: {
                                        [Side.BUY]: {
                                            odd: drawOdds,
                                        },
                                        [Side.SELL]: {
                                            odd: drawOdds,
                                        },
                                    },
                                },
                            },
                            tags: [Number(ethers.utils.formatUnits(tags, 0))],
                            homeTeam: parentMarket.homeTeam,
                            awayTeam: parentMarket.awayTeam,
                            maturityDate: parentMarket.maturityDate,
                            resolved,
                            cancelled,
                            finalResult: Number(finalResult),
                            gameStarted: parentMarket.gameStarted,
                            homeScore: parentMarket.homeScore,
                            awayScore: parentMarket.awayScore,
                            leagueRaceName: '',
                            paused,
                            betType: Number(betType),
                            isApex: false,
                            parentMarket: parentMarket.address,
                            childMarketsAddresses: [],
                            childMarkets: [],
                            spread: Number(spread) / 100,
                            total: Number(total) / 100,
                        };

                        return market;
                    })
                );

                const groupedChildMarkets = groupBy(
                    orderBy(childMarkets, ['paused', 'cancelled'], ['asc', 'asc']),
                    (market: MarketData) => market.betType
                );
                return {
                    spreadMarkets: groupedChildMarkets[BetType.SPREAD],
                    totalMarkets: groupedChildMarkets[BetType.TOTAL],
                };
            } catch (e) {
                console.log(e);
                return {
                    spreadMarkets: [],
                    totalMarkets: [],
                };
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useChildMarketsQuery;
