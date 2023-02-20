import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { MarketData, ChildMarkets } from 'types/markets';
import { ethers } from 'ethers';
import networkConnector from 'utils/networkConnector';
import marketContract from 'utils/contracts/sportsMarketContract';
import { bigNumberFormmaterWithDecimals } from '../../utils/formatters/ethers';
import { Position } from '../../constants/options';
import { groupBy, orderBy } from 'lodash';
import { BetType } from 'constants/tags';
import { NetworkId } from 'types/network';
import { getDefaultDecimalsForNetwork } from 'utils/collaterals';

const useChildMarketsQuery = (
    parentMarket: MarketData,
    networkId: NetworkId,
    options?: UseQueryOptions<ChildMarkets | undefined>
) => {
    return useQuery<ChildMarkets | undefined>(
        QUERY_KEYS.ChildMarkets(parentMarket.address, networkId),
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
                            gameDetails,
                            tags,
                            betType,
                            resolved,
                            finalResult,
                            cancelled,
                            paused,
                            buyMarketDefaultOdds,
                            spread,
                            total,
                        ] = await Promise.all([
                            contract?.getGameDetails(),
                            contract?.tags(0),
                            contract?.tags(1),
                            contract?.resolved(),
                            contract?.finalResult(),
                            contract?.cancelled(),
                            contract?.paused(),
                            sportsAMMContract?.getMarketDefaultOdds(childMarketAddress, false),
                            gamesOddsObtainerContract?.childMarketSread(childMarketAddress),
                            gamesOddsObtainerContract?.childMarketTotal(childMarketAddress),
                        ]);

                        const market: MarketData = {
                            address: childMarketAddress.toLowerCase(),
                            gameDetails: parentMarket.gameDetails,
                            positions: {
                                [Position.HOME]: {
                                    odd: bigNumberFormmaterWithDecimals(
                                        buyMarketDefaultOdds[0],
                                        getDefaultDecimalsForNetwork(networkId)
                                    ),
                                },
                                [Position.AWAY]: {
                                    odd: bigNumberFormmaterWithDecimals(
                                        buyMarketDefaultOdds[1],
                                        getDefaultDecimalsForNetwork(networkId)
                                    ),
                                },
                                [Position.DRAW]: {
                                    odd: buyMarketDefaultOdds[2]
                                        ? bigNumberFormmaterWithDecimals(
                                              buyMarketDefaultOdds[2] || 0,
                                              getDefaultDecimalsForNetwork(networkId)
                                          )
                                        : undefined,
                                },
                            },
                            tags: [Number(tags)],
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
                            spread: Number(spread),
                            total: Number(total),
                            doubleChanceMarketType:
                                Number(betType) === BetType.DOUBLE_CHANCE ? gameDetails.gameLabel : null,
                        };

                        return market;
                    })
                );

                const groupedChildMarkets = groupBy(
                    orderBy(childMarkets, ['paused', 'cancelled'], ['asc', 'asc']),
                    (market: MarketData) => market.betType
                );
                return {
                    totalMarkets: groupedChildMarkets[BetType.TOTAL] || [],
                    spreadMarkets: groupedChildMarkets[BetType.SPREAD] || [],
                    doubleChanceMarkets: groupedChildMarkets[BetType.DOUBLE_CHANCE] || [],
                };
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useChildMarketsQuery;
