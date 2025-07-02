import styled from 'styled-components';
import SpeedTradingChart from '../SpeedTradingChart';

const SpeedTrading: React.FC = () => {
    return (
        <ChartWrapper>
            <SpeedTradingChart />
        </ChartWrapper>
    );
};

const ChartWrapper = styled.div`
    height: 180px;
`;

export default SpeedTrading;
