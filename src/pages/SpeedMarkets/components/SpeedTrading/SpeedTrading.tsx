import styled from 'styled-components';
import SelectAsset from '../SelectAsset';
import SelectBuyin from '../SelectBuyin';
import SelectPosition from '../SelectPosition';
import SpeedTradingChart from '../SpeedTradingChart';

const SpeedTrading: React.FC = () => {
    return (
        <>
            <ChartWrapper>
                <SpeedTradingChart />
            </ChartWrapper>
            <SelectAsset />
            <SelectBuyin />
            <SelectPosition />
        </>
    );
};

const ChartWrapper = styled.div`
    height: 180px;
`;

export default SpeedTrading;
