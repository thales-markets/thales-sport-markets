import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ContractType } from 'enums/contract';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { Coins } from 'thales-utils';
import { LiquidityPoolTicketData } from 'types/liquidityPool';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';
import QUERY_KEYS from '../../constants/queryKeys';

const END_INDEX = 10000;

const useLiquidityPoolTicketDataQuery = (
    ticketAddress: string,
    collateral: Coins,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<LiquidityPoolTicketData | undefined>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LiquidityPoolTicketData | undefined>({
        queryKey: QUERY_KEYS.LiquidityPool.TicketData(collateral, ticketAddress, networkConfig.networkId),
        queryFn: async () => {
            const liquidityPoolTicketData: LiquidityPoolTicketData = {
                round: 0,
                indexInRound: 0,
                foundInRound: false,
            };

            try {
                const liquidityPoolContractInstance = getContractInstance(
                    ContractType.LIQUIDITY_POOL,
                    networkConfig,
                    undefined,
                    collateral.toLowerCase() as LiquidityPoolCollateral
                ) as ViemContract;

                if (liquidityPoolContractInstance) {
                    const round = await liquidityPoolContractInstance.read.round();
                    const ticketIndexData = await liquidityPoolContractInstance.read.getTicketIndexInTicketRound([
                        ticketAddress,
                        Number(round),
                        0,
                        END_INDEX,
                    ]);

                    liquidityPoolTicketData.round = Number(round);
                    liquidityPoolTicketData.indexInRound = Number(ticketIndexData.index);
                    liquidityPoolTicketData.foundInRound = ticketIndexData.found;

                    return liquidityPoolTicketData;
                }
            } catch (e) {
                console.log(e);
            }
            return undefined;
        },
        ...options,
    });
};

export default useLiquidityPoolTicketDataQuery;
