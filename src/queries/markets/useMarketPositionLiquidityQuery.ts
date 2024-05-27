import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import { TicketMarket } from 'types/markets';
import networkConnector from 'utils/networkConnector';

const useMarketPositionLiquidityQuery = (
    market: TicketMarket,
    networkId: Network,
    options?: UseQueryOptions<number>
) => {
    return useQuery<number>(
        QUERY_KEYS.MarketPositionLiquidity(
            market.gameId,
            market.typeId,
            market.playerProps.playerId,
            market.position,
            networkId
        ),
        async () => {
            try {
                const { sportsAMMV2RiskManagerContract } = networkConnector;
                if (sportsAMMV2RiskManagerContract) {
                    const [risk, cap] = await Promise.all([
                        sportsAMMV2RiskManagerContract.riskPerMarketTypeAndPosition(
                            market.gameId,
                            market.typeId,
                            market.playerProps.playerId,
                            market.position
                        ),
                        sportsAMMV2RiskManagerContract.calculateCapToBeUsed(
                            market.gameId,
                            market.subLeagueId,
                            market.typeId,
                            market.playerProps.playerId,
                            market.line * 100,
                            market.maturity
                        ),
                    ]);

                    const formattedRisk = bigNumberFormatter(risk, getDefaultDecimalsForNetwork(networkId));
                    const formattedCap = bigNumberFormatter(cap, getDefaultDecimalsForNetwork(networkId));

                    return (formattedCap - formattedRisk) / (1 / market.odd - 1);
                }
            } catch (e) {
                console.log(e);
            }
            return 0;
        },
        {
            ...options,
        }
    );
};

export default useMarketPositionLiquidityQuery;
