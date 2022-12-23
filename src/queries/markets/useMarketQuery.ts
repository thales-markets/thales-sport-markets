import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { MarketData } from 'types/markets';
import { ethers } from 'ethers';
import networkConnector from 'utils/networkConnector';
import marketContract from 'utils/contracts/sportsMarketContract';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { fixDuplicatedTeamName, fixLongTeamNameString } from '../../utils/formatters/string';
import { Position } from '../../constants/options';
import { ZERO_ADDRESS } from 'constants/network';

const useMarketQuery = (marketAddress: string, options?: UseQueryOptions<MarketData | undefined>) => {
    return useQuery<MarketData | undefined>(
        QUERY_KEYS.Market(marketAddress),
        async () => {
            try {
                const contract = new ethers.Contract(marketAddress, marketContract.abi, networkConnector.provider);

                const {
                    theRundownConsumerContract,
                    sportsAMMContract,
                    gamesOddsObtainerContract,
                    sportMarketManagerContract,
                } = networkConnector;

                const [
                    gameDetails,
                    tags,
                    times,
                    resolved,
                    finalResult,
                    cancelled,
                    paused,
                    buyMarketDefaultOdds,
                    childMarketsAddresses,
                    doubleChanceMarket,
                ] = await Promise.all([
                    contract?.getGameDetails(),
                    contract?.tags(0),
                    contract?.times(),
                    contract?.resolved(),
                    contract?.finalResult(),
                    contract?.cancelled(),
                    contract?.paused(),
                    sportsAMMContract?.getMarketDefaultOdds(marketAddress, false),
                    gamesOddsObtainerContract?.getAllChildMarketsFromParent(marketAddress),
                    sportMarketManagerContract?.doubleChanceMarkets(marketAddress),
                ]);

                const gameStarted = cancelled ? false : Date.now() > Number(times.maturity) * 1000;
                let result;

                if (resolved) {
                    result = await theRundownConsumerContract?.gameResolved(gameDetails.gameId);
                }

                const homeScore = result ? result.homeScore : undefined;
                const awayScore = result ? result.awayScore : undefined;

                const market: MarketData = {
                    address: marketAddress.toLowerCase(),
                    gameDetails,
                    positions: {
                        [Position.HOME]: {
                            odd: bigNumberFormatter(buyMarketDefaultOdds[0]),
                        },
                        [Position.AWAY]: {
                            odd: bigNumberFormatter(buyMarketDefaultOdds[1]),
                        },
                        [Position.DRAW]: {
                            odd: buyMarketDefaultOdds[2] ? bigNumberFormatter(buyMarketDefaultOdds[2] || 0) : undefined,
                        },
                    },
                    tags: [Number(ethers.utils.formatUnits(tags, 0))],
                    homeTeam: fixLongTeamNameString(fixDuplicatedTeamName(gameDetails.gameLabel.split('vs')[0].trim())),
                    awayTeam: fixLongTeamNameString(fixDuplicatedTeamName(gameDetails.gameLabel.split('vs')[1].trim())),
                    maturityDate: Number(times.maturity) * 1000,
                    resolved,
                    cancelled,
                    finalResult: Number(finalResult),
                    gameStarted,
                    homeScore,
                    awayScore,
                    leagueRaceName: '',
                    paused,
                    betType: 0,
                    isApex: false,
                    parentMarket: '',
                    childMarketsAddresses:
                        doubleChanceMarket !== ZERO_ADDRESS
                            ? [doubleChanceMarket, ...childMarketsAddresses]
                            : childMarketsAddresses,
                    childMarkets: [],
                    spread: 0,
                    total: 0,
                };
                return market;
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

export default useMarketQuery;
