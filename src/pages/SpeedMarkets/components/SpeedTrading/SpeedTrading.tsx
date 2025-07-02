import { SUPPORTED_ASSETS } from 'constants/speedMarkest';
import { useState } from 'react';
import styled from 'styled-components';
import SelectAsset from '../SelectAsset';
import SelectBuyin from '../SelectBuyin';
import SelectPosition from '../SelectPosition';
import SpeedTradingChart from '../SpeedTradingChart';

const SpeedTrading: React.FC = () => {
    const [selectedAsset, setSelectedAsset] = useState(SUPPORTED_ASSETS[0]);

    return (
        <>
            <ChartWrapper>
                <SpeedTradingChart />
            </ChartWrapper>
            <SelectAsset selectedAsset={selectedAsset} onAssetClick={(asset: string) => setSelectedAsset(asset)} />
            <SelectBuyin />
            <SelectPosition />
        </>
    );
};

const ChartWrapper = styled.div`
    height: 180px;
`;

export default SpeedTrading;
