import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import { TicketMarket } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';

const useTicketLiquidityQuery = (
    markets: TicketMarket[],
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<number | undefined>({
        queryKey: QUERY_KEYS.TicketLiquidity(
            markets.map((market) => market.gameId).join(','),
            markets.map((market) => market.typeId).join(','),
            markets.map((market) => market.playerProps.playerId).join(','),
            markets.map((market) => market.line).join(','),
            markets.map((market) => market.position).join(','),
            markets.map((market) => market.live).join(','),
            networkConfig.networkId
        ),
        queryFn: async () => {
            try {
                const sportsAMMV2RiskManagerContract = getContractInstance(
                    ContractType.SPORTS_AMM_V2_RISK_MANAGER,
                    networkConfig
                ) as ViemContract;

                if (sportsAMMV2RiskManagerContract) {
                    const riskPromises = [];
                    const capPromises = [];
                    for (let i = 0; i < markets.length; i++) {
                        const market = markets[i];
                        riskPromises.push(
                            sportsAMMV2RiskManagerContract.read.riskPerMarketTypeAndPosition([
                                market.gameId,
                                market.typeId,
                                market.playerProps.playerId,
                                market.position,
                            ])
                        );
                        capPromises.push(
                            sportsAMMV2RiskManagerContract.read.calculateCapToBeUsed([
                                market.gameId,
                                market.subLeagueId,
                                market.typeId,
                                market.playerProps.playerId,
                                market.line * 100,
                                market.live ? Math.round(new Date().getTime() / 1000) + 60 : market.maturity,
                                !!market.live,
                            ])
                        );
                    }

                    const risks = await Promise.all(riskPromises);
                    const caps = await Promise.all(capPromises);

                    let ticketLiquidity = 0;
                    for (let i = 0; i < markets.length; i++) {
                        const market = markets[i];
                        const formattedRisk = bigNumberFormatter(
                            risks[i],
                            getDefaultDecimalsForNetwork(networkConfig.networkId)
                        );
                        const formattedCap = bigNumberFormatter(
                            caps[i],
                            getDefaultDecimalsForNetwork(networkConfig.networkId)
                        );
                        const marketLiquidity = Math.floor((formattedCap - formattedRisk) / (1 / market.odd - 1));
                        ticketLiquidity =
                            i === 0 || marketLiquidity < ticketLiquidity ? marketLiquidity : ticketLiquidity;
                    }

                    return ticketLiquidity;
                }
            } catch (e) {
                console.log(e);
            }
            return undefined;
        },
        ...options,
    });
};

export default useTicketLiquidityQuery;
