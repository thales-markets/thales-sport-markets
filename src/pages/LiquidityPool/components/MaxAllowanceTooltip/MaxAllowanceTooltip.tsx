import { USD_SIGN } from 'constants/currency';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { formatCurrency, formatCurrencyWithSign } from 'utils/formatters/number';

type MaxAllowanceTooltipProps = {
    stakedThales: number;
    stakedThalesMultiplier: number;
};

const MaxAllowanceTooltip: React.FC<MaxAllowanceTooltipProps> = ({ stakedThales, stakedThalesMultiplier }) => {
    const { t } = useTranslation();

    return (
        <Container>
            <ContentContainer>
                <Label>{t('liquidity-pool.your-thales-staked-label')}</Label>
                <Text>{formatCurrency(stakedThales)}</Text>
            </ContentContainer>
            <MiddleContainer>x</MiddleContainer>
            <ContentContainer>
                <Label>{t('liquidity-pool.allowance-multiplier-label')}</Label>
                <Text>{stakedThalesMultiplier}</Text>
            </ContentContainer>
            <MiddleContainer>=</MiddleContainer>
            <ContentContainer>
                <Label>{t('liquidity-pool.max-allowance-label')}</Label>
                <Text>{formatCurrencyWithSign(USD_SIGN, stakedThales * stakedThalesMultiplier)}</Text>
            </ContentContainer>
        </Container>
    );
};

const Container = styled(FlexDivRow)`
    width: 100%;
`;

const ContentContainer = styled(FlexDivColumn)`
    width: 100%;
    padding: 4px 8px;
    justify-content: center;
`;

const MiddleContainer = styled(ContentContainer)`
    font-size: 18px;
    padding: 0px 4px;
`;

const Label = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 100%;
    white-space: nowrap;
    text-align: center;
    margin-bottom: 5px;
`;

const Text = styled.span`
    font-weight: 700;
    font-size: 15px;
    line-height: 100%;
    white-space: nowrap;
    text-align: center;
`;

export default MaxAllowanceTooltip;
