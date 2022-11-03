import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'types/network';
import { Position, PositionName } from 'constants/options';
import { VaultTrades, VaultTrade } from 'types/vault';
import { getEtherscanTxLink } from 'utils/etherscan';
import i18n from 'i18n';
import { VaultTradeStatus } from 'constants/vault';

const useVaultTradesQuery = (networkId: NetworkId, options?: UseQueryOptions<VaultTrades>) => {
    return useQuery<VaultTrades>(
        QUERY_KEYS.Vault.Trades(networkId),
        async () => {
            try {
                const vaultTrades = await thalesData.sportMarkets.vaultTransactions({
                    network: networkId,
                });
                return vaultTrades.map((trade: VaultTrade) => {
                    const game = `${trade.wholeMarket.homeTeam} - ${trade.wholeMarket.awayTeam}`;
                    const position = Position[trade.position];
                    const positionTeam =
                        // @ts-ignore
                        trade.wholeMarket[`${position.toLowerCase()}Team`] || i18n.t('markets.market-card.draw');
                    const result = Position[trade.wholeMarket.finalResult - 1] as PositionName;
                    const link = getEtherscanTxLink(networkId, trade.hash);
                    const status =
                        trade.wholeMarket.finalResult || trade.wholeMarket.finalResult === 0
                            ? VaultTradeStatus.IN_PROGRESS
                            : // @ts-ignore
                            (position as PositionName) === result
                            ? VaultTradeStatus.WIN
                            : VaultTradeStatus.LOSE;

                    return {
                        ...trade,
                        game,
                        position,
                        positionTeam,
                        result,
                        link,
                        status,
                    };
                });
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
