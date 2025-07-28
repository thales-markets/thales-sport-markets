import LightweightChart from 'components/PriceChart/LightweightChart';
import { SUPPORTED_ASSETS } from 'constants/speedMarkets';
import { secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AmmSpeedMarketsLimits, SelectedPosition } from 'types/speedMarkets';
import { getCurrentPrices, getPriceConnection, getPriceId, getSupportedAssetsAsObject } from 'utils/pyth';
import { useChainId } from 'wagmi';

type SpeedTradingChartProps = {
    selectedAsset: string;
    selectedPosition: SelectedPosition;
    deltaTimeSec: number;
    ammSpeedMarketsLimitsData: AmmSpeedMarketsLimits | null;
};

const SpeedTradingChart: React.FC<SpeedTradingChartProps> = ({
    selectedAsset,
    selectedPosition,
    deltaTimeSec,
    ammSpeedMarketsLimitsData,
}) => {
    const networkId = useChainId();

    const [currentPrices, setCurrentPrices] = useState<{ [key: string]: number }>(getSupportedAssetsAsObject());

    const priceConnection = useMemo(() => getPriceConnection(networkId), [networkId]);

    const prevPrice = useRef(0);
    const fetchCurrentPrices = useCallback(async () => {
        const priceIds = SUPPORTED_ASSETS.map((asset) => getPriceId(networkId, asset));
        const prices: typeof currentPrices = await getCurrentPrices(priceConnection, networkId, priceIds);
        if (!mountedRef.current) return null;
        setCurrentPrices((prev) => {
            if (prev[selectedAsset] !== prices[selectedAsset]) {
                prevPrice.current = prev[selectedAsset];
            }
            return prices;
        });
    }, [networkId, priceConnection, selectedAsset]);

    // Used for canceling asynchronous tasks
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Set initial current prices
    useEffect(() => {
        fetchCurrentPrices();
    }, [selectedAsset, fetchCurrentPrices]);

    // Update current prices on every 5 seconds
    useInterval(async () => {
        fetchCurrentPrices();
    }, secondsToMilliseconds(5));

    return (
        <LightweightChart
            position={selectedPosition}
            asset={selectedAsset}
            selectedPrice={selectedPosition !== undefined ? currentPrices[selectedAsset] : undefined}
            selectedDate={Date.now() + secondsToMilliseconds(deltaTimeSec)}
            deltaTimeSec={deltaTimeSec}
            explicitCurrentPrice={currentPrices[selectedAsset]}
            prevExplicitPrice={prevPrice.current}
            risksPerAsset={ammSpeedMarketsLimitsData?.risksPerAsset}
            risksPerAssetAndDirection={ammSpeedMarketsLimitsData?.risksPerAssetAndDirection}
            hideLiquidity
        />
    );
};

export default SpeedTradingChart;
