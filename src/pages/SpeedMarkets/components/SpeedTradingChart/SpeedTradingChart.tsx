import LightweightChart from 'components/PriceChart/LightweightChart';

const SpeedTradingChart: React.FC<{ selectedAsset: string }> = ({ selectedAsset }) => {
    return <LightweightChart asset={selectedAsset} />;
};

export default SpeedTradingChart;
