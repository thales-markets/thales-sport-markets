import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { ENETPULSE_SPORTS } from 'constants/tags';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { ParlayMarketWithRound, SportMarketInfo } from 'types/markets';
import { ParlayVaultTrade } from 'types/vault';
import { fixDuplicatedTeamName, fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { updateTotalQuoteAndAmountFromContract } from 'utils/markets';

const useParlayVaultTradesQuery = (
    vaultAddress: string,
    networkId: Network,
    options?: UseQueryOptions<ParlayMarketWithRound[]>
) => {
    return useQuery<ParlayMarketWithRound[]>(
        QUERY_KEYS.Vault.ParlayTrades(vaultAddress, networkId),
        async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.ParlayVaultsTransactions}/${networkId}?vault=${vaultAddress}`
                );

                const parlayVaultTrades = response?.data ? response.data : [];

                const parlayMarketsModified: ParlayMarketWithRound[] = parlayVaultTrades.map(
                    ({ wholeMarket, round }: ParlayVaultTrade) => {
                        return {
                            ...wholeMarket,
                            round,
                            sportMarkets: wholeMarket.sportMarkets.map((market: SportMarketInfo) => {
                                const isEnetpulseSport = ENETPULSE_SPORTS.includes(Number(market.tags[0]));
                                return {
                                    ...market,
                                    homeTeam: market.isOneSideMarket
                                        ? fixOneSideMarketCompetitorName(market.homeTeam)
                                        : fixDuplicatedTeamName(market.homeTeam, isEnetpulseSport),
                                    awayTeam: market.isOneSideMarket
                                        ? fixOneSideMarketCompetitorName(market.awayTeam)
                                        : fixDuplicatedTeamName(market.awayTeam, isEnetpulseSport),
                                };
                            }),
                        };
                    }
                );

                const updateParlayWithContractData = updateTotalQuoteAndAmountFromContract(
                    parlayMarketsModified
                ) as ParlayMarketWithRound[];
                return updateParlayWithContractData;
            } catch (e) {
                console.log(e);
                return [];
            }
        },
        {
            ...options,
        }
    );
};

export default useParlayVaultTradesQuery;
