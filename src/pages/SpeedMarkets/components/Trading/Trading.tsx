import styled from 'styled-components';
import TradingChart from '../TradingChart';

const Trading: React.FC = () => {
    return (
        <ChartWrapper>
            <TradingChart />
        </ChartWrapper>
    );
};

const ChartWrapper = styled.div`
    height: 180px;
`;

export default Trading;
