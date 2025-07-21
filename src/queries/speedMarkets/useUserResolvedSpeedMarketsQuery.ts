import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import {
    BATCH_NUMBER_OF_SPEED_MARKETS,
    MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH,
    MIN_MATURITY,
    SIDE_TO_POSITION_MAP,
} from 'constants/speedMarkets';
import { hoursToMilliseconds, secondsToMilliseconds } from 'date-fns';
import { ContractType } from 'enums/contract';
import { bigNumberFormatter, coinFormatter, parseBytes32String } from 'thales-utils';
import { NetworkConfig } from 'types/network';
import { UserPosition } from 'types/speedMarkets';
import { ViemContract } from 'types/viem';
import { getCollateralByAddress } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { getFeesFromHistory } from 'utils/speedMarkets';

const useUserResolvedSpeedMarketsQuery = (
    networkConfig: NetworkConfig,
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserPosition[]>({
        queryKey: QUERY_KEYS.SpeedMarkets.ResolvedSpeedMarkets(networkConfig.networkId, walletAddress),
        queryFn: async () => {
            const userResolvedPositions: UserPosition[] = [];

            try {
                const speedMarketsAMMContract = getContractInstance(
                    ContractType.SPEED_MARKETS_AMM,
                    networkConfig
                ) as ViemContract;

                const speedMarketsDataContract = getContractInstance(
                    ContractType.SPEED_MARKETS_DATA,
                    networkConfig
                ) as ViemContract;

                const ammParams = await speedMarketsDataContract.read.getSpeedMarketsAMMParameters([walletAddress]);

                const pageSize = Math.min(
                    Number(ammParams.numMaturedMarketsPerUser),
                    MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH
                );
                const index = Number(ammParams.numMaturedMarketsPerUser) - pageSize;
                const resolvedMarkets = await speedMarketsAMMContract.read.maturedMarketsPerUser([
                    index,
                    pageSize,
                    walletAddress,
                ]);

                const promises = [];
                for (let i = 0; i < Math.ceil(resolvedMarkets.length / BATCH_NUMBER_OF_SPEED_MARKETS); i++) {
                    const start = i * BATCH_NUMBER_OF_SPEED_MARKETS;
                    const batchMarkets = resolvedMarkets.slice(start, start + BATCH_NUMBER_OF_SPEED_MARKETS);
                    promises.push(speedMarketsDataContract.read.getMarketsData([batchMarkets]));
                }
                const resolvedMarketsDataArray = await Promise.all(promises);

                const filteredMarketsData = resolvedMarketsDataArray
                    .flat()
                    .map((marketData: any, index: number) => ({
                        ...marketData,
                        market: resolvedMarkets[index],
                    }))
                    .filter((marketData: any) => Number(marketData.strikeTime) > MIN_MATURITY);

                for (let i = 0; i < filteredMarketsData.length; i++) {
                    const marketData = filteredMarketsData[i];

                    const createdAt =
                        marketData.createdAt != 0
                            ? secondsToMilliseconds(Number(marketData.createdAt))
                            : secondsToMilliseconds(Number(marketData.strikeTime)) - hoursToMilliseconds(1);

                    const lpFee =
                        marketData.lpFee != 0
                            ? bigNumberFormatter(marketData.lpFee)
                            : getFeesFromHistory(createdAt).lpFee;
                    const safeBoxImpact =
                        marketData.safeBoxImpact != 0
                            ? bigNumberFormatter(marketData.safeBoxImpact)
                            : getFeesFromHistory(createdAt).safeBoxImpact;
                    const fees = lpFee + safeBoxImpact;

                    const collateral = getCollateralByAddress(marketData.collateral, networkConfig.networkId);
                    const marketBuyinAmount = coinFormatter(
                        marketData.buyinAmount,
                        networkConfig.networkId,
                        collateral
                    );

                    const paid = marketBuyinAmount * (1 + fees);
                    const payout = coinFormatter(marketData.payout, networkConfig.networkId, collateral);

                    const userData: UserPosition = {
                        user: marketData.user,
                        market: marketData.market,
                        asset: parseBytes32String(marketData.asset),
                        side: SIDE_TO_POSITION_MAP[marketData.direction],
                        strikePrice: bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS),
                        maturityDate: secondsToMilliseconds(Number(marketData.strikeTime)),
                        paid,
                        payout,
                        collateralAddress: marketData.collateral,
                        isDefaultCollateral: marketData.isDefaultCollateral,
                        currentPrice: 0,
                        finalPrice: bigNumberFormatter(marketData.finalPrice, PYTH_CURRENCY_DECIMALS),
                        isClaimable: false,
                        isResolved: true,
                        createdAt,
                    };

                    userResolvedPositions.push(userData);
                }
            } catch (e) {
                console.log(e);
            }

            return userResolvedPositions;
        },
        ...options,
    });
};

export default useUserResolvedSpeedMarketsQuery;
