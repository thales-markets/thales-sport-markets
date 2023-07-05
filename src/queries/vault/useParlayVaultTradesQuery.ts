import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'types/network';
import { ParlayVaultTrade } from 'types/vault';
import { updateTotalQuoteAndAmountFromContract } from 'utils/markets';
import { ParlayMarketWithRound, SportMarketInfo } from 'types/markets';
import { fixOneSideMarketCompetitorName, fixDuplicatedTeamName } from 'utils/formatters/string';
import { ENETPULSE_SPORTS } from 'constants/tags';

const useParlayVaultTradesQuery = (
    vaultAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<ParlayMarketWithRound[]>
) => {
    return useQuery<ParlayMarketWithRound[]>(
        QUERY_KEYS.Vault.ParlayTrades(vaultAddress, networkId),
        async () => {
            try {
                const parlayVaultTrades = await thalesData.sportMarkets.parlayVaultTransactions({
                    network: networkId,
                    vault: vaultAddress,
                });

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
