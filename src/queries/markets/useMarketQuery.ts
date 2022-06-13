import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { MarketData } from 'types/markets';
import { ethers } from 'ethers';
import networkConnector from 'utils/networkConnector';
import marketContract from 'utils/contracts/sportsMarketContract';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { fixDuplicatedTeamName } from '../../utils/formatters/string';
import { Position, Side } from '../../constants/options';

const useMarketQuery = (marketAddress: string, options?: UseQueryOptions<MarketData | undefined>) => {
    return useQuery<MarketData | undefined>(
        QUERY_KEYS.Market(marketAddress),
        async () => {
            try {
                const contract = new ethers.Contract(marketAddress, marketContract.abi, networkConnector.provider);
                // const rundownConsumerContract = networkConnector.theRundownConsumerContract;
                const sportsAMMContract = networkConnector.sportsAMMContract;
                // const { marketDataContract, marketManagerContract, thalesBondsContract } = networkConnector;
                const [gameDetails, tags, times, optionsAddresses] = await Promise.all([
                    contract?.getGameDetails(),
                    contract?.tags(0),
                    contract?.times(),
                    contract?.options(),
                ]);

                // const normalizedOdds = await rundownConsumerContract?.getNormalizedOdds(gameDetails.gameId);
                // const homeOdds = bigNumberFormatter(normalizedOdds[0]);
                // const awayOdds = bigNumberFormatter(normalizedOdds[1]);
                // const drawOdds = bigNumberFormatter(normalizedOdds[2]);

                const [
                    availableToBuyHome,
                    availableToBuyAway,
                    availableToBuyDraw,
                    availableToSellHome,
                    availableToSellAway,
                    availableToSellDraw,
                    buyFromAmmQuoteHome,
                    buyFromAmmQuoteAway,
                    buyFromAmmQuoteDraw,
                    sellToAmmQuoteHome,
                    sellToAmmQuoteAway,
                    sellToAmmQuoteDraw,
                ] = await Promise.all([
                    await sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.HOME),
                    await sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.AWAY),
                    await sportsAMMContract?.availableToBuyFromAMM(marketAddress, Position.DRAW),
                    await sportsAMMContract?.availableToSellToAMM(marketAddress, Position.HOME),
                    await sportsAMMContract?.availableToSellToAMM(marketAddress, Position.AWAY),
                    await sportsAMMContract?.availableToSellToAMM(marketAddress, Position.DRAW),
                    await sportsAMMContract?.buyFromAmmQuote(
                        marketAddress,
                        Position.HOME,
                        ethers.utils.parseEther('1')
                    ),
                    await sportsAMMContract?.buyFromAmmQuote(
                        marketAddress,
                        Position.AWAY,
                        ethers.utils.parseEther('1')
                    ),
                    await sportsAMMContract?.buyFromAmmQuote(
                        marketAddress,
                        Position.DRAW,
                        ethers.utils.parseEther('1')
                    ),
                    await sportsAMMContract?.sellToAmmQuote(marketAddress, Position.HOME, ethers.utils.parseEther('1')),
                    await sportsAMMContract?.sellToAmmQuote(marketAddress, Position.AWAY, ethers.utils.parseEther('1')),
                    await sportsAMMContract?.sellToAmmQuote(marketAddress, Position.DRAW, ethers.utils.parseEther('1')),
                ]);

                const market: MarketData = {
                    address: marketAddress,
                    gameDetails,
                    positions: {
                        [Position.HOME]: {
                            position: Position.HOME,
                            sides: {
                                [Side.BUY]: {
                                    available: bigNumberFormatter(availableToBuyHome),
                                    odd: bigNumberFormatter(buyFromAmmQuoteHome),
                                },
                                [Side.SELL]: {
                                    available: bigNumberFormatter(availableToSellHome),
                                    odd: bigNumberFormatter(sellToAmmQuoteHome),
                                },
                            },
                        },
                        [Position.AWAY]: {
                            position: Position.AWAY,
                            sides: {
                                [Side.BUY]: {
                                    available: bigNumberFormatter(availableToBuyAway),
                                    odd: bigNumberFormatter(buyFromAmmQuoteAway),
                                },
                                [Side.SELL]: {
                                    available: bigNumberFormatter(availableToSellAway),
                                    odd: bigNumberFormatter(sellToAmmQuoteAway),
                                },
                            },
                        },
                        [Position.DRAW]: {
                            position: Position.DRAW,
                            sides: {
                                [Side.BUY]: {
                                    available: bigNumberFormatter(availableToBuyDraw),
                                    odd: bigNumberFormatter(buyFromAmmQuoteDraw),
                                },
                                [Side.SELL]: {
                                    available: bigNumberFormatter(availableToSellDraw),
                                    odd: bigNumberFormatter(sellToAmmQuoteDraw),
                                },
                            },
                        },
                    },
                    tags: [Number(ethers.utils.formatUnits(tags, 0))],
                    homeTeam: fixDuplicatedTeamName(gameDetails.gameLabel.split('vs')[0].trim()),
                    awayTeam: fixDuplicatedTeamName(gameDetails.gameLabel.split('vs')[1].trim()),
                    maturityDate: Number(times.maturity) * 1000,
                    optionsAddresses,
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
