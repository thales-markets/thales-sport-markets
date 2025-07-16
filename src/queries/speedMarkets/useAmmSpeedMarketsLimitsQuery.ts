import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { TBD_ADDRESS, ZERO_ADDRESS } from 'constants/network';
import QUERY_KEYS from 'constants/queryKeys';
import {
    MAX_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE,
    MIN_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE,
    SIDE_TO_POSITION_MAP,
} from 'constants/speedMarkets';
import { ContractType } from 'enums/contract';
import { bigNumberFormatter, coinFormatter } from 'thales-utils';
import { NetworkConfig } from 'types/network';
import { AmmSpeedMarketsLimits } from 'types/speedMarkets';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import { stringToHex } from 'viem';

const useAmmSpeedMarketsLimitsQuery = (
    networkConfig: NetworkConfig,
    walletAddress?: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<AmmSpeedMarketsLimits>({
        queryKey: QUERY_KEYS.SpeedMarkets.SpeedMarketsLimits(networkConfig.networkId, walletAddress),
        queryFn: async () => {
            const ammSpeedMarketsLimits: AmmSpeedMarketsLimits = {
                minBuyinAmount: 0,
                maxBuyinAmount: 0,
                minimalTimeToMaturity: 0,
                maximalTimeToMaturity: 0,
                maxPriceDelaySec: 0,
                maxPriceDelayForResolvingSec: 0,
                risksPerAsset: [],
                risksPerAssetAndDirection: [],
                timeThresholdsForFees: [],
                lpFees: [],
                defaultLPFee: 0,
                maxSkewImpact: 0,
                safeBoxImpact: 0,
                whitelistedAddress: false,
                bonusPerCollateral: {
                    DAI: 0,
                    USDCe: 0,
                    USDbC: 0,
                    USDC: 0,
                    USDT: 0,
                    OP: 0,
                    WETH: 0,
                    ETH: 0,
                    ARB: 0,
                    THALES: 0,
                    sTHALES: 0,
                    OVER: 0,
                    cbBTC: 0,
                    wBTC: 0,
                },
            };

            try {
                const speedMarketsDataContract = getContractInstance(
                    ContractType.SPEED_MARKETS_DATA,
                    networkConfig
                ) as ViemContract;

                const [
                    ammParams,
                    riskForETH,
                    riskForBTC,
                    directionalRiskForETH,
                    directionalRiskForBTC,
                ] = await Promise.all([
                    speedMarketsDataContract.read.getSpeedMarketsAMMParameters([walletAddress || ZERO_ADDRESS]),
                    speedMarketsDataContract.read.getRiskPerAsset([stringToHex(CRYPTO_CURRENCY_MAP.ETH, { size: 32 })]),
                    speedMarketsDataContract.read.getRiskPerAsset([stringToHex(CRYPTO_CURRENCY_MAP.BTC, { size: 32 })]),
                    speedMarketsDataContract.read.getDirectionalRiskPerAsset([
                        stringToHex(CRYPTO_CURRENCY_MAP.ETH, { size: 32 }),
                    ]),
                    speedMarketsDataContract.read.getDirectionalRiskPerAsset([
                        stringToHex(CRYPTO_CURRENCY_MAP.BTC, { size: 32 }),
                    ]),
                ]);

                ammSpeedMarketsLimits.minBuyinAmount =
                    coinFormatter(ammParams.minBuyinAmount, networkConfig.networkId) /
                    (1 - MIN_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE);
                ammSpeedMarketsLimits.maxBuyinAmount =
                    coinFormatter(ammParams.maxBuyinAmount, networkConfig.networkId) /
                    (1 + MAX_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE);
                ammSpeedMarketsLimits.minimalTimeToMaturity = Number(ammParams.minimalTimeToMaturity);
                ammSpeedMarketsLimits.maximalTimeToMaturity = Number(ammParams.maximalTimeToMaturity);
                ammSpeedMarketsLimits.maxPriceDelaySec = Number(ammParams.maximumPriceDelay);
                ammSpeedMarketsLimits.maxPriceDelayForResolvingSec = Number(ammParams.maximumPriceDelayForResolving);
                ammSpeedMarketsLimits.risksPerAsset = [
                    {
                        currency: CRYPTO_CURRENCY_MAP.ETH,
                        current: coinFormatter(riskForETH.current, networkConfig.networkId),
                        max: coinFormatter(riskForETH.max, networkConfig.networkId),
                    },
                    {
                        currency: CRYPTO_CURRENCY_MAP.BTC,
                        current: coinFormatter(riskForBTC.current, networkConfig.networkId),
                        max: coinFormatter(riskForBTC.max, networkConfig.networkId),
                    },
                ];
                directionalRiskForETH.map((risk: any) => {
                    ammSpeedMarketsLimits.risksPerAssetAndDirection.push({
                        currency: CRYPTO_CURRENCY_MAP.ETH,
                        position: SIDE_TO_POSITION_MAP[risk.direction],
                        current: coinFormatter(risk.current, networkConfig.networkId),
                        max: coinFormatter(risk.max, networkConfig.networkId),
                    });
                });
                directionalRiskForBTC.map((risk: any) => {
                    ammSpeedMarketsLimits.risksPerAssetAndDirection.push({
                        currency: CRYPTO_CURRENCY_MAP.BTC,
                        position: SIDE_TO_POSITION_MAP[risk.direction],
                        current: coinFormatter(risk.current, networkConfig.networkId),
                        max: coinFormatter(risk.max, networkConfig.networkId),
                    });
                });
                ammSpeedMarketsLimits.timeThresholdsForFees = ammParams.timeThresholdsForFees.map((time: bigint) =>
                    Number(time)
                );
                ammSpeedMarketsLimits.lpFees = ammParams.lpFees.map((lpFee: bigint) => bigNumberFormatter(lpFee));
                ammSpeedMarketsLimits.defaultLPFee = bigNumberFormatter(ammParams.lpFee);
                ammSpeedMarketsLimits.maxSkewImpact = bigNumberFormatter(ammParams.maxSkewImpact);
                ammSpeedMarketsLimits.safeBoxImpact = bigNumberFormatter(ammParams.safeBoxImpact);
                ammSpeedMarketsLimits.whitelistedAddress = ammParams.isAddressWhitelisted;

                const speedMarketsAmmContract = getContractInstance(
                    ContractType.SPEED_MARKETS_AMM,
                    networkConfig
                ) as ViemContract;

                // For now get bonus only for OVER/THALES, later it can be moved to Data contract to get for array of collaterals
                const overAddress = multipleCollateral.OVER.addresses[networkConfig.networkId];
                if (overAddress !== TBD_ADDRESS) {
                    const overBonus = await speedMarketsAmmContract.read.bonusPerCollateral([overAddress]);
                    ammSpeedMarketsLimits.bonusPerCollateral.OVER = bigNumberFormatter(overBonus);
                }
                const thalesAddress = multipleCollateral.THALES.addresses[networkConfig.networkId];
                if (thalesAddress !== TBD_ADDRESS) {
                    const thalesBonus = await speedMarketsAmmContract.read.bonusPerCollateral([thalesAddress]);
                    ammSpeedMarketsLimits.bonusPerCollateral.THALES = bigNumberFormatter(thalesBonus);
                }
            } catch (e) {
                console.log(e);
            }

            return ammSpeedMarketsLimits;
        },
        ...options,
    });
};

export default useAmmSpeedMarketsLimitsQuery;
