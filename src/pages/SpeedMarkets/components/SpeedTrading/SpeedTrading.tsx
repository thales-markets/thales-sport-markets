import { SUPPORTED_ASSETS } from 'constants/speedMarkets';
import { SpeedPositions } from 'enums/speedMarkets';
import useAmmSpeedMarketsLimitsQuery from 'queries/speedMarkets/useAmmSpeedMarketsLimitsQuery';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { SelectedPosition } from 'types/speedMarkets';
import { useAccount, useChainId, useClient } from 'wagmi';
import AmmSpeedTrading from '../AmmSpeedTrading';
import SelectAsset from '../SelectAsset';
import SelectBuyin from '../SelectBuyin';
import SelectPosition from '../SelectPosition';
import SpeedTradingChart from '../SpeedTradingChart';

type SpeedTradingProps = {
    deltaTimeSec: number;
    priceSlippage: number;
};

const SpeedTrading: React.FC<SpeedTradingProps> = ({ deltaTimeSec, priceSlippage }) => {
    const networkId = useChainId();
    const client = useClient();
    const { isConnected } = useAccount();

    const [selectedAsset, setSelectedAsset] = useState(SUPPORTED_ASSETS[0]);
    const [buyinAmount, setBuyinAmount] = useState<number | string>('');
    const [selectedPosition, setSelectedPosition] = useState<SelectedPosition>(undefined);
    const [profitAndSkewPerPosition, setProfitAndSkewPerPosition] = useState({
        profit: { [SpeedPositions.UP]: 0, [SpeedPositions.DOWN]: 0 },
        skew: { [SpeedPositions.UP]: 0, [SpeedPositions.DOWN]: 0 },
    });
    const [buyinGasFee, setBuyinGasFee] = useState(0);
    const [hasError, setHasError] = useState(false);

    const ammSpeedMarketsLimitsQuery = useAmmSpeedMarketsLimitsQuery({ networkId, client }, undefined);

    const ammSpeedMarketsLimitsData = useMemo(() => {
        return ammSpeedMarketsLimitsQuery.isSuccess ? ammSpeedMarketsLimitsQuery.data : null;
    }, [ammSpeedMarketsLimitsQuery]);

    const resetData = useCallback(() => {
        setSelectedPosition(undefined);
        setBuyinAmount('');
    }, []);

    useEffect(() => {
        if (!isConnected) {
            resetData();
        }
    }, [isConnected, resetData]);

    useEffect(() => {
        resetData();
    }, [networkId, resetData]);

    return (
        <>
            <ChartWrapper>
                <SpeedTradingChart
                    selectedAsset={selectedAsset}
                    selectedPosition={selectedPosition}
                    deltaTimeSec={deltaTimeSec}
                    ammSpeedMarketsLimitsData={ammSpeedMarketsLimitsData}
                />
            </ChartWrapper>
            <SelectAsset selectedAsset={selectedAsset} onAssetClick={(asset: string) => setSelectedAsset(asset)} />
            <SelectBuyin
                selectedAsset={selectedAsset}
                buyinAmount={buyinAmount}
                setBuyinAmount={setBuyinAmount}
                buyinGasFee={buyinGasFee}
                ammSpeedMarketsLimits={ammSpeedMarketsLimitsData}
                setHasError={setHasError}
            />
            <SelectPosition
                selectedPosition={selectedPosition}
                setSelectedPosition={setSelectedPosition}
                profitAndSkewPerPosition={profitAndSkewPerPosition}
            />
            <AmmSpeedTrading
                selectedAsset={selectedAsset}
                selectedPosition={selectedPosition}
                deltaTimeSec={deltaTimeSec}
                enteredBuyinAmount={Number(buyinAmount)}
                priceSlippage={priceSlippage}
                ammSpeedMarketsLimits={ammSpeedMarketsLimitsData}
                setProfitAndSkewPerPosition={setProfitAndSkewPerPosition}
                setBuyinGasFee={setBuyinGasFee}
                resetData={resetData}
                hasError={hasError}
            />
        </>
    );
};

const ChartWrapper = styled.div`
    min-height: 200px;
`;

export default SpeedTrading;
