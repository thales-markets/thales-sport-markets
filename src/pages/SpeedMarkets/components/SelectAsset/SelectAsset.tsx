import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import styled from 'styled-components';

type SelectAssetProps = {
    selectedAsset: string;
    onAssetClick: (asset: string) => void;
};

const SelectAsset: React.FC<SelectAssetProps> = ({ selectedAsset, onAssetClick }) => {
    return (
        <Container>
            <AssetButton
                isActive={selectedAsset === CRYPTO_CURRENCY_MAP.BTC}
                onClick={() => onAssetClick(CRYPTO_CURRENCY_MAP.BTC)}
            >
                <AssetIcon className="speedmarkets-logo-icon speedmarkets-logo-icon--btc-logo" />
                <Text>{CRYPTO_CURRENCY_MAP.BTC}</Text>
            </AssetButton>
            <AssetButton
                isActive={selectedAsset === CRYPTO_CURRENCY_MAP.ETH}
                onClick={() => onAssetClick(CRYPTO_CURRENCY_MAP.ETH)}
            >
                <AssetIcon className="speedmarkets-logo-icon speedmarkets-logo-icon--eth-logo" />
                <Text>{CRYPTO_CURRENCY_MAP.ETH}</Text>
            </AssetButton>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    width: 100%;
    height: 45px;
    padding: 3px;
    background: ${(props) => props.theme.speedMarkets.button.background.inactive};
    border-radius: 5px;
`;

const Text = styled.span<{ active?: boolean }>`
    position: relative;
    font-weight: 800;
    font-size: 14px;
    text-align: center;
`;

const AssetIcon = styled.i`
    font-size: 19px;
`;

const AssetButton = styled.div<{ isActive: boolean }>`
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: center;
    height: 38px;
    gap: 3px;
    ${(props) => (props.isActive ? `background: ${props.theme.speedMarkets.button.background.active};` : '')}
    ${Text}, ${AssetIcon} {
        color: ${(props) =>
            props.isActive
                ? props.theme.speedMarkets.button.textColor.active
                : props.theme.speedMarkets.button.textColor.inactive};
    }
    border-radius: 6px;
    cursor: pointer;
`;

export default SelectAsset;
