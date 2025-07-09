import NumericInput from 'components/fields/NumericInput';
import SuggestedAmount from 'components/SuggestedAmount';
import { DEFAULT_PRICE_SLIPPAGES_PERCENTAGE } from 'constants/speedMarkets';
import { Dispatch } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { FlexDivSpaceBetween } from 'styles/common';
import { floorNumberToDecimals } from 'thales-utils';
import { ThemeInterface } from 'types/ui';

const SpeedSettings: React.FC<{ priceSlippage: number; setPriceSlippage: Dispatch<number> }> = ({
    priceSlippage,
    setPriceSlippage,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const priceSlippagePercentage = floorNumberToDecimals(priceSlippage * 100, 2);

    return (
        <>
            <SettingContainer>
                <SlippageToleranceContainer>
                    <div>{t('speed-markets.settings.slippage-tolerance')}</div>
                    <span>{priceSlippagePercentage}%</span>
                </SlippageToleranceContainer>
                <Description>{t('speed-markets.settings.slippage-tolerance-description')}</Description>
            </SettingContainer>
            <SuggestedAmount
                amounts={DEFAULT_PRICE_SLIPPAGES_PERCENTAGE.map((percentage) => percentage * 100)}
                insertedAmount={priceSlippagePercentage}
                collateralIndex={0}
                changeAmount={(value) => {
                    setPriceSlippage(Number(value) / 100);
                }}
                buttonHeight="32px"
                buttonColor={theme.speedMarkets.button.background.primary}
                amountSymbol="%"
            />
            <NumericInput
                value={priceSlippagePercentage}
                onChange={(e) => {
                    const targetValue = Math.max(
                        floorNumberToDecimals(Number(e.target.value)) / 100,
                        DEFAULT_PRICE_SLIPPAGES_PERCENTAGE[0]
                    );
                    setPriceSlippage(targetValue);
                }}
                borderColor={theme.input.borderColor.tertiary}
                currencyLabel="%"
            />
        </>
    );
};

const SettingContainer = styled.div`
    margin-top: 20px;
`;

const SlippageToleranceContainer = styled(FlexDivSpaceBetween)`
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    span {
        color: ${(props) => props.theme.speedMarkets.textColor.tertiary};
    }
`;

const Description = styled.div`
    color: ${(props) => props.theme.speedMarkets.textColor.secondary};
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    margin-top: 10px;
`;

export default SpeedSettings;
