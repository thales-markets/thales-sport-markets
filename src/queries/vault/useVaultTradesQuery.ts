import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'types/network';
import { Position, PositionName } from 'constants/options';
import { VaultTrades, VaultTrade } from 'types/vault';
import { getEtherscanTxLink } from 'utils/etherscan';
import i18n from 'i18n';

const useVaultTradesQuery = (networkId: NetworkId, options?: UseQueryOptions<VaultTrades>) => {
    return useQuery<VaultTrades>(
        QUERY_KEYS.Vault.Trades(networkId),
        async () => {
            try {
                const vaultTrades = await thalesData.sportMarkets.vaultTransactions({
                    network: networkId,
                });
                return vaultTrades.map((trade: VaultTrade) => ({
                    ...trade,
                    game: `${trade.wholeMarket.homeTeam} - ${trade.wholeMarket.awayTeam}`,
                    position: Position[trade.position],
                    positionTeam:
                        // @ts-ignore
                        trade.wholeMarket[`${trade.position.toLowerCase()}Team`] || i18n.t('markets.market-card.draw'),
                    result: Position[trade.wholeMarket.finalResult - 1] as PositionName,
                    link: getEtherscanTxLink(networkId, trade.hash),
                }));
            } catch (e) {
                console.log(e);
                return [];
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useVaultTradesQuery;
