import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { MarketData } from 'types/markets';
import { ethers } from 'ethers';
import networkConnector from 'utils/networkConnector';
import marketContract from 'utils/contracts/sportsMarketContract';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { fixApexName, fixDuplicatedTeamName, fixLongTeamNameString } from '../../utils/formatters/string';
import { Position, Side } from '../../constants/options';
import { getScoreForApexGame, isApexGame } from 'utils/markets';

const useMarketQuery = (marketAddress: string, isSell: boolean, options?: UseQueryOptions<MarketData | undefined>) => {
    return useQuery<MarketData | undefined>(
        QUERY_KEYS.Market(marketAddress, isSell),
        async () => {
            try {
                const contract = new ethers.Contract(marketAddress, marketContract.abi, networkConnector.provider);

                const rundownConsumerContract = networkConnector.theRundownConsumerContract;
                const apexConsumerContract = networkConnector.apexConsumerContract;
                const sportsAMMContract = networkConnector.sportsAMMContract;
                // const { marketDataContract, marketManagerContract, thalesBondsContract } = networkConnector;
                const [gameDetails, tags, times, resolved, finalResult, cancelled, paused] = await Promise.all([
                    contract?.getGameDetails(),
                    contract?.tags(0),
                    contract?.times(),
                    contract?.resolved(),
                    contract?.finalResult(),
                    contract?.cancelled(),
                    contract?.paused(),
                ]);

                const [marketDefaultOdds] = await Promise.all([
                    await sportsAMMContract?.getMarketDefaultOdds(marketAddress, isSell),
                ]);

                const homeOdds = bigNumberFormatter(marketDefaultOdds[0]);
                const awayOdds = bigNumberFormatter(marketDefaultOdds[1]);
                const drawOdds = marketDefaultOdds[2] ? bigNumberFormatter(marketDefaultOdds[2] || 0) : undefined;

                const gameStarted = cancelled ? false : Date.now() > Number(times.maturity) * 1000;
                let result;

                const isApex = isApexGame(Number(tags));

                if (resolved) {
                    result = isApex
                        ? await apexConsumerContract?.getGameResolvedById(gameDetails.gameId)
                        : await rundownConsumerContract?.getGameResolvedById(gameDetails.gameId);
                }

                let homeScore = result ? result.homeScore : undefined;
                let awayScore = result ? result.awayScore : undefined;
                let raceName;
                let pausedByNonExistingOdds = false;
                let betType = 0;

                if (isApex) {
                    const [gameResults, gameCreated, isGamePausedByNonExistingPostQualifyingOdds] = await Promise.all([
                        apexConsumerContract?.gameResults(gameDetails.gameId),
                        apexConsumerContract?.gameCreated(gameDetails.gameId),
                        apexConsumerContract?.isGamePausedByNonExistingPostQualifyingOdds(gameDetails.gameId),
                    ]);
                    const score = getScoreForApexGame(gameResults.resultDetails, homeScore, awayScore);
                    homeScore = score.homeScore;
                    awayScore = score.awayScore;

                    const raceCreated = await apexConsumerContract?.raceCreated(gameCreated.raceId);
                    raceName = raceCreated.eventName;
                    pausedByNonExistingOdds = isGamePausedByNonExistingPostQualifyingOdds;
                    betType = Number(gameCreated.betType);
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
                    homeTeam: isApex
                        ? fixApexName(gameDetails.gameLabel.split('vs')[0].trim())
                        : fixLongTeamNameString(fixDuplicatedTeamName(gameDetails.gameLabel.split('vs')[0].trim())),
                    awayTeam: isApex
                        ? fixApexName(gameDetails.gameLabel.split('vs')[1].trim())
                        : fixLongTeamNameString(fixDuplicatedTeamName(gameDetails.gameLabel.split('vs')[1].trim())),
                    maturityDate: Number(times.maturity) * 1000,
                    resolved,
                    cancelled,
                    finalResult: Number(finalResult),
                    gameStarted,
                    homeScore,
                    awayScore,
                    leagueRaceName: raceName,
                    paused: paused || pausedByNonExistingOdds,
                    betType,
                    isApex,
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
