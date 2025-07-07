import NumericInput from 'components/fields/NumericInput';
import SuggestedAmount from 'components/SuggestedAmount';
import { Dispatch, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { FlexDivSpaceBetween } from 'styles/common';
import { ThemeInterface } from 'types/ui';

const SLIPPAGE_AMOUNTS = [0.1, 0.5, 1, 2];

const SpeedSettings: React.FC<{ setPriceSlippage: Dispatch<number>; priceSlippage: number }> = ({
    setPriceSlippage,
    priceSlippage,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const [slippageSetting, setSlippageSetting] = useState<number | string>(priceSlippage * 100);

    return (
        <>
            <SettingContainer>
                <SlippageToleranceContainer>
                    <div>{t('speed-markets.settings.slippage-tolerance')}</div>
                    <span>{priceSlippage * 100}%</span>
                </SlippageToleranceContainer>
                <Description>{t('speed-markets.settings.slippage-tolerance-description')}</Description>
            </SettingContainer>
            <SuggestedAmount
                amounts={SLIPPAGE_AMOUNTS}
                insertedAmount={slippageSetting}
                collateralIndex={0}
                changeAmount={(value) => {
                    setPriceSlippage(Number(value) / 100);
                    setSlippageSetting(Number(value));
                }}
                buttonHeight="32px"
                buttonColor={theme.speedMarkets.button.background.primary}
                amountSymbol="%"
            />
            <NumericInput
                value={slippageSetting}
                onChange={(e) => {
                    setPriceSlippage(Number(e.target.value) / 100);
                    setSlippageSetting(e.target.value);
                }}
                borderColor={theme.input.borderColor.tertiary}
                currencyLabel="%"
            />
        </>
    );
};

const SettingContainer = styled.div`
    margin: 20px;
`;

const SlippageToleranceContainer = styled(FlexDivSpaceBetween)`
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;
    span {
        color: #ffb600;
    }
`;

const Description = styled.div`
    font-family: Inter;
    color: #8b92b8;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    margin-top: 10px;
`;

export default SpeedSettings;
