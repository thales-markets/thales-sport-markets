import { SUPPORTED_ASSETS } from 'constants/speedMarkets';
import useAmmSpeedMarketsLimitsQuery from 'queries/speedMarkets/useAmmSpeedMarketsLimitsQuery';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useChainId, useClient } from 'wagmi';
import SelectAsset from '../SelectAsset';
import SelectBuyin from '../SelectBuyin';
import SelectPosition from '../SelectPosition';
import SpeedTradingChart from '../SpeedTradingChart';

const SpeedTrading: React.FC = () => {
    const networkId = useChainId();
    const client = useClient();

    const [selectedAsset, setSelectedAsset] = useState(SUPPORTED_ASSETS[0]);
    const [buyinAmount, setBuyinAmount] = useState<number | string>('');
    const [isAllowing, setIsAllowing] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    // TODO
    setIsAllowing;
    setIsBuying;

    const ammSpeedMarketsLimitsQuery = useAmmSpeedMarketsLimitsQuery({ networkId, client }, undefined);

    const ammSpeedMarketsLimitsData = useMemo(() => {
        return ammSpeedMarketsLimitsQuery.isSuccess ? ammSpeedMarketsLimitsQuery.data : null;
    }, [ammSpeedMarketsLimitsQuery]);

    return (
        <>
            <ChartWrapper>
                <SpeedTradingChart selectedAsset={selectedAsset} />
            </ChartWrapper>
            <SelectAsset selectedAsset={selectedAsset} onAssetClick={(asset: string) => setSelectedAsset(asset)} />
            <SelectBuyin
                selectedAsset={selectedAsset}
                buyinAmount={buyinAmount}
                setBuyinAmount={setBuyinAmount}
                ammSpeedMarketsLimits={ammSpeedMarketsLimitsData}
                isAllowing={isAllowing}
                isBuying={isBuying}
            />
            <SelectPosition />
        </>
    );
};

const ChartWrapper = styled.div`
    height: 180px;
`;

export default SpeedTrading;
