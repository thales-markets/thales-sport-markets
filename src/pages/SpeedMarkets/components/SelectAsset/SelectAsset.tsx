import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import styled from 'styled-components';

type SelectAssetProps = {
    selectedAsset: string;
    onAssetClick: (asset: string) => void;
};

const SelectAsset: React.FC<SelectAssetProps> = ({ selectedAsset, onAssetClick }) => {
    return (
        <Container>
            <TextWrapper
                isActive={selectedAsset === CRYPTO_CURRENCY_MAP.BTC}
                onClick={() => onAssetClick(CRYPTO_CURRENCY_MAP.BTC)}
            >
                <Text>{CRYPTO_CURRENCY_MAP.BTC}</Text>
            </TextWrapper>
            <TextWrapper
                isActive={selectedAsset === CRYPTO_CURRENCY_MAP.ETH}
                onClick={() => onAssetClick(CRYPTO_CURRENCY_MAP.ETH)}
            >
                <Text>{CRYPTO_CURRENCY_MAP.ETH}</Text>
            </TextWrapper>
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
    border-radius: 6px;
`;

const Text = styled.span<{ active?: boolean }>`
    position: relative;
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    white-space: pre;
    text-align: left;
`;

const TextWrapper = styled.div<{ isActive: boolean }>`
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: center;

    height: 38px;

    ${(props) => (props.isActive ? `background: ${props.theme.speedMarkets.button.background.active};` : '')}
    ${Text} {
        color: ${(props) =>
            props.isActive
                ? props.theme.speedMarkets.button.textColor.active
                : props.theme.speedMarkets.button.textColor.inactive};
    }
    border-radius: 6px;

    cursor: pointer;
`;

export default SelectAsset;
