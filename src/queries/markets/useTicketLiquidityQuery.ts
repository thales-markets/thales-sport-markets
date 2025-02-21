import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import { TicketMarket } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';
import { getTradeData } from 'utils/marketsV2';

const useTicketLiquidityQuery = (
    markets: TicketMarket[],
    isSystemBet: boolean,
    systemBetDenominator: number,
    isSgp: boolean,
    sgpQuote: number,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<number | undefined>({
        queryKey: QUERY_KEYS.TicketLiquidity(
            networkConfig.networkId,
            isSystemBet,
            systemBetDenominator,
            isSgp,
            sgpQuote,
            markets.map((market) => market.gameId).join(','),
            markets.map((market) => market.typeId).join(','),
            markets.map((market) => market.playerProps.playerId).join(','),
            markets.map((market) => market.line).join(','),
            markets.map((market) => market.position).join(','),
            markets.map((market) => market.live).join(',')
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
                    const totalRiskPromises = [];
                    const spentOnGamePromises = [];

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

                        if (!isSgp) {
                            totalRiskPromises.push(
                                sportsAMMV2RiskManagerContract.read.calculateTotalRiskOnGame([
                                    market.gameId,
                                    market.subLeagueId,
                                    market.maturity,
                                ])
                            );
                            spentOnGamePromises.push(sportsAMMV2RiskManagerContract.read.spentOnGame([market.gameId]));
                        }
                    }

                    const risks = await Promise.all(riskPromises);
                    const caps = await Promise.all(capPromises);

                    const totalRisks = isSgp
                        ? [
                              await sportsAMMV2RiskManagerContract.read.calculateTotalRiskOnGame([
                                  markets[0].gameId,
                                  markets[0].subLeagueId,
                                  markets[0].maturity,
                              ]),
                          ]
                        : await Promise.all(totalRiskPromises);

                    const spentOnGames = isSgp
                        ? [await sportsAMMV2RiskManagerContract.read.sgpSpentOnGame([markets[0].gameId])]
                        : await Promise.all(spentOnGamePromises);

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

                        // Liquidity based on total risk and spent on game
                        let availableLiquidity = marketLiquidity;
                        if (!isSgp) {
                            const formattedTotalRisk = bigNumberFormatter(
                                totalRisks[i],
                                getDefaultDecimalsForNetwork(networkConfig.networkId)
                            );
                            const formattedSpentOnGame = bigNumberFormatter(
                                spentOnGames[i],
                                getDefaultDecimalsForNetwork(networkConfig.networkId)
                            );
                            availableLiquidity = Math.floor(
                                ((formattedTotalRisk - formattedSpentOnGame) / (1 / market.odd - 1)) *
                                    (isSystemBet ? systemBetDenominator / markets.length : 1)
                            );
                        }

                        if (i === 0) {
                            ticketLiquidity = Math.min(marketLiquidity, availableLiquidity);
                        }
                        ticketLiquidity = Math.min(marketLiquidity, availableLiquidity, ticketLiquidity);
                    }

                    // SGP Liquidity based on:
                    // 1. total risk and spent on game
                    // 2. per combination risk and spent per combination
                    if (isSgp && sgpQuote > 0) {
                        // when SGP cap divider is 0 use 2 as default on contract
                        const sgpCapDivider = await sportsAMMV2RiskManagerContract.read.sgpCapDivider();
                        const formattedSgpCapDivider = bigNumberFormatter(
                            sgpCapDivider,
                            getDefaultDecimalsForNetwork(networkConfig.networkId)
                        );
                        const sgpDivider = formattedSgpCapDivider > 0 ? formattedSgpCapDivider : 2;

                        // 1. Total risk
                        const formattedTotalRisk = bigNumberFormatter(
                            totalRisks[0],
                            getDefaultDecimalsForNetwork(networkConfig.networkId)
                        );
                        const formattedSpentOnGame = bigNumberFormatter(
                            spentOnGames[0],
                            getDefaultDecimalsForNetwork(networkConfig.networkId)
                        );
                        const sgpAvailableLiquidity = Math.floor(
                            (formattedTotalRisk / sgpDivider - formattedSpentOnGame) / (1 / sgpQuote - 1)
                        );

                        // 2. Combination risk
                        const combinationRisk = await sportsAMMV2RiskManagerContract.read.calculateCapToBeUsed([
                            markets[0].gameId,
                            markets[0].subLeagueId,
                            0,
                            0,
                            0,
                            markets[0].maturity,
                            false,
                        ]);
                        const spentOnCombination = await sportsAMMV2RiskManagerContract.read.getSGPCombinationRisk([
                            getTradeData(markets),
                        ]);

                        const formattedCombinationRisk = bigNumberFormatter(
                            combinationRisk,
                            getDefaultDecimalsForNetwork(networkConfig.networkId)
                        );
                        const formattedSpentOnCombination = bigNumberFormatter(
                            spentOnCombination,
                            getDefaultDecimalsForNetwork(networkConfig.networkId)
                        );
                        const sgpCombinationLiquidity = Math.floor(
                            (formattedCombinationRisk - formattedSpentOnCombination) / (1 / sgpQuote - 1)
                        );

                        ticketLiquidity = Math.min(sgpAvailableLiquidity, sgpCombinationLiquidity, ticketLiquidity);
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
