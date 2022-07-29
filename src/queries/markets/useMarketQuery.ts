import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { MarketData } from 'types/markets';
import { ethers } from 'ethers';
import networkConnector from 'utils/networkConnector';
import marketContract from 'utils/contracts/sportsMarketContract';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { fixDuplicatedTeamName } from '../../utils/formatters/string';
import { Position, Side } from '../../constants/options';

const useMarketQuery = (marketAddress: string, isSell: boolean, options?: UseQueryOptions<MarketData | undefined>) => {
    return useQuery<MarketData | undefined>(
        QUERY_KEYS.Market(marketAddress, isSell),
        async () => {
            try {
                const contract = new ethers.Contract(marketAddress, marketContract.abi, networkConnector.provider);

                const rundownConsumerContract = networkConnector.theRundownConsumerContract;
                const sportsAMMContract = networkConnector.sportsAMMContract;
                // const { marketDataContract, marketManagerContract, thalesBondsContract } = networkConnector;
                const [gameDetails, tags, times, resolved, finalResult, cancelled] = await Promise.all([
                    contract?.getGameDetails(),
                    contract?.tags(0),
                    contract?.times(),
                    contract?.resolved(),
                    contract?.finalResult(),
                    contract?.cancelled(),
                ]);

                const [marketDefaultOdds] = await Promise.all([
                    await sportsAMMContract?.getMarketDefaultOdds(marketAddress, isSell),
                ]);

                const homeOdds = bigNumberFormatter(marketDefaultOdds[0]);
                const awayOdds = bigNumberFormatter(marketDefaultOdds[1]);
                const drawOdds = bigNumberFormatter(marketDefaultOdds[2] || 0);

                const gameStarted = cancelled ? false : Date.now() > Number(times.maturity) * 1000;
                let result;

                if (resolved) {
                    result = await rundownConsumerContract?.getGameResolvedById(gameDetails.gameId);
                }

                const market: MarketData = {
                    address: marketAddress,
                    gameDetails,
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
                    homeTeam: fixDuplicatedTeamName(gameDetails.gameLabel.split('vs')[0].trim()),
                    awayTeam: fixDuplicatedTeamName(gameDetails.gameLabel.split('vs')[1].trim()),
                    maturityDate: Number(times.maturity) * 1000,
                    resolved,
                    cancelled,
                    finalResult: Number(finalResult),
                    gameStarted,
                    homeScore: result ? result.homeScore : undefined,
                    awayScore: result ? result.awayScore : undefined,
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
