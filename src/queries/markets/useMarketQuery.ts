import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { MarketData } from 'types/markets';
import networkConnector from 'utils/networkConnector';
import { bigNumberFormmaterWithDecimals } from '../../utils/formatters/ethers';
import { fixDuplicatedTeamName } from '../../utils/formatters/string';
import { Position } from '../../constants/options';
import { NetworkId } from 'types/network';
import { getDefaultDecimalsForNetwork } from 'utils/collaterals';
import { ENETPULSE_SPORTS, SPORTS_TAGS_MAP } from 'constants/tags';

const useMarketQuery = (
    marketAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<MarketData | undefined>
) => {
    return useQuery<MarketData | undefined>(
        QUERY_KEYS.Market(marketAddress, networkId),
        async () => {
            try {
                const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;

                const marketData = await sportPositionalMarketDataContract?.getMarketData(marketAddress);

                const gameStarted = marketData.cancelled ? false : Date.now() > Number(marketData.maturity) * 1000;
                const homeScore = marketData.resolved ? marketData.homeScore : undefined;
                const awayScore = marketData.resolved ? marketData.awayScore : undefined;
                const isEnetpulseSport = ENETPULSE_SPORTS.includes(Number(marketData.firstTag));
                const market: MarketData = {
                    address: marketAddress.toLowerCase(),
                    gameDetails: { gameId: marketData.gameId, gameLabel: marketData.gameLabel },
                    positions: {
                        [Position.HOME]: {
                            odd: bigNumberFormmaterWithDecimals(
                                marketData.odds[0],
                                getDefaultDecimalsForNetwork(networkId)
                            ),
                        },
                        [Position.AWAY]: {
                            odd: bigNumberFormmaterWithDecimals(
                                marketData.odds[1],
                                getDefaultDecimalsForNetwork(networkId)
                            ),
                        },
                        [Position.DRAW]: {
                            odd: marketData.odds[2]
                                ? bigNumberFormmaterWithDecimals(
                                      marketData.odds[2] || 0,
                                      getDefaultDecimalsForNetwork(networkId)
                                  )
                                : undefined,
                        },
                    },
                    tags: [Number(marketData.firstTag)],
                    homeTeam: fixDuplicatedTeamName(marketData.gameLabel.split(' vs ')[0].trim(), isEnetpulseSport),
                    awayTeam: fixDuplicatedTeamName(marketData.gameLabel.split(' vs ')[1].trim(), isEnetpulseSport),
                    maturityDate: Number(marketData.maturity) * 1000,
                    resolved: marketData.resolved,
                    cancelled: marketData.cancelled,
                    finalResult: Number(marketData.finalResult),
                    gameStarted,
                    homeScore,
                    awayScore,
                    leagueRaceName: '',
                    paused: marketData.paused,
                    betType: 0,
                    isApex: false,
                    parentMarket: '',
                    childMarketsAddresses: [...marketData.doubleChanceMarkets, ...marketData.childMarkets],
                    childMarkets: [],
                    spread: 0,
                    total: 0,
                    doubleChanceMarketType: null,
                    isEnetpulseRacing:
                        SPORTS_TAGS_MAP['Motosport'].includes(Number(marketData.firstTag)) &&
                        ENETPULSE_SPORTS.includes(Number(marketData.firstTag)),
                };
                return market;
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

export default useMarketQuery;
