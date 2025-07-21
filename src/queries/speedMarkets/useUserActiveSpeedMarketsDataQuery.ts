import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { PYTH_CURRENCY_DECIMALS, SUPPORTED_ASSETS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { SIDE_TO_POSITION_MAP } from 'constants/speedMarkets';
import { hoursToMilliseconds, secondsToMilliseconds } from 'date-fns';
import { ContractType } from 'enums/contract';
import { bigNumberFormatter, coinFormatter, parseBytes32String } from 'thales-utils';
import { NetworkConfig } from 'types/network';
import { UserPosition } from 'types/speedMarkets';
import { ViemContract } from 'types/viem';
import { getCollateralByAddress } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { getCurrentPrices, getPriceConnection, getPriceId } from 'utils/pyth';
import { getFeesFromHistory } from 'utils/speedMarkets';

const useUserActiveSpeedMarketsDataQuery = (
    networkConfig: NetworkConfig,
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserPosition[]>({
        queryKey: QUERY_KEYS.SpeedMarkets.UserSpeedMarkets(networkConfig.networkId, walletAddress),
        queryFn: async () => {
            const userSpeedMarketsData: UserPosition[] = [];

            try {
                const speedMarketsDataContract = getContractInstance(
                    ContractType.SPEED_MARKETS_DATA,
                    networkConfig
                ) as ViemContract;

                const speedMarketsAMMContract = getContractInstance(
                    ContractType.SPEED_MARKETS_AMM,
                    networkConfig
                ) as ViemContract;

                const ammParams = await speedMarketsDataContract.read.getSpeedMarketsAMMParameters([walletAddress]);

                const activeMarkets = await speedMarketsAMMContract.read.activeMarketsPerUser([
                    0,
                    ammParams.numActiveMarketsPerUser,
                    walletAddress,
                ]);
                const marketsDataArray = activeMarkets.length
                    ? await speedMarketsDataContract.read.getMarketsData([activeMarkets])
                    : [];
                const userActiveMarkets = marketsDataArray.map((marketData: any, index: number) => ({
                    ...marketData,
                    market: activeMarkets[index],
                }));

                const openMarkets: any = marketsDataArray
                    .map((marketData: any, index: number) => ({ ...marketData, market: activeMarkets[index] }))
                    .filter((market: any) => secondsToMilliseconds(Number(market.strikeTime)) > Date.now());

                // Fetch current prices
                let prices: { [key: string]: number } = {};
                if (openMarkets.length) {
                    const priceConnection = getPriceConnection(networkConfig.networkId);
                    const priceIds = SUPPORTED_ASSETS.map((asset) => getPriceId(networkConfig.networkId, asset));
                    prices = await getCurrentPrices(priceConnection, networkConfig.networkId, priceIds);
                }

                for (let i = 0; i < userActiveMarkets.length; i++) {
                    const marketData = userActiveMarkets[i];

                    const currencyKey = parseBytes32String(marketData.asset);
                    const side = SIDE_TO_POSITION_MAP[marketData.direction];
                    const collateral = getCollateralByAddress(marketData.collateral, networkConfig.networkId);

                    const maturityDate = secondsToMilliseconds(Number(marketData.strikeTime));
                    const createdAt =
                        marketData.createdAt != 0
                            ? secondsToMilliseconds(Number(marketData.createdAt))
                            : maturityDate - hoursToMilliseconds(1);
                    const lpFee =
                        marketData.lpFee != 0
                            ? bigNumberFormatter(marketData.lpFee)
                            : getFeesFromHistory(createdAt).lpFee;
                    const safeBoxImpact =
                        marketData.safeBoxImpact != 0
                            ? bigNumberFormatter(marketData.safeBoxImpact)
                            : getFeesFromHistory(createdAt).safeBoxImpact;
                    const fees = lpFee + safeBoxImpact;

                    const userData: UserPosition = {
                        user: marketData.user,
                        market: marketData.market,
                        asset: parseBytes32String(marketData.asset),
                        side,
                        strikePrice: bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS),
                        maturityDate,
                        paid: coinFormatter(marketData.buyinAmount, networkConfig.networkId, collateral) * (1 + fees),
                        payout: coinFormatter(marketData.payout, networkConfig.networkId, collateral),
                        collateralAddress: marketData.collateral,
                        isDefaultCollateral: marketData.isDefaultCollateral,
                        currentPrice: prices[currencyKey],
                        finalPrice: 0,
                        isClaimable: false,
                        isResolved: false,
                        createdAt,
                    };

                    userSpeedMarketsData.push(userData);
                }
            } catch (e) {
                console.log(e);
            }

            return userSpeedMarketsData;
        },
        ...options,
    });
};

export default useUserActiveSpeedMarketsDataQuery;
