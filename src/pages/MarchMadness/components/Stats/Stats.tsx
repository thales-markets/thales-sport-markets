import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRowCentered } from 'styles/common';

const Stats: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Container>
            <Label>
                <Icon className={'icon icon--stats'} />
                <Text fontWeight={600}>{t('march-madness.stats.live-stats')}</Text>
            </Label>
            <Data>
                <Pair>
                    <Text>{t('march-madness.stats.brackets-minted')}:</Text>
                    <Value>999</Value>
                </Pair>
                <Separator />
                <Pair>
                    <Text>{t('march-madness.stats.pool-size')}:</Text>
                    <Value>50.000$ + 5,000 ARB</Value>
                </Pair>
            </Data>
        </Container>
    );
};

const Container = styled(FlexDivCentered)`
    width: 100%;
    height: 37px;
    background: ${(props) => props.theme.marchMadness.background.senary};
    border-radius: 8px;
    margin-bottom: 12px;
`;

const Data = styled(FlexDivCentered)`
    @media (max-width: 575px) {
        flex-direction: column;
        gap: 3px;
    }
`;

const Pair = styled(FlexDivRowCentered)`
    align-items: baseline;
`;

const Label = styled(Data)`
    margin: 0 250px 0 -250px;
    @media (max-width: 575px) {
        display: none;
    }
`;

const Text = styled.span<{ fontWeight?: number }>`
    font-family: ${(props) =>
        props.fontWeight && props.fontWeight > 500 ? props.theme.fontFamily.primary : props.theme.fontFamily.secondary};
    font-size: 16px;
    line-height: 10px;
    text-transform: uppercase;
`;

const Value = styled.span`
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-size: 16px;
    line-height: 14px;
    text-transform: uppercase;
    margin-left: 5px;
`;

const Icon = styled.i`
    margin-right: 5px;
`;

const Separator = styled.div`
    border-left: 2px solid ${(props) => props.theme.marchMadness.borderColor.tertiary};
    height: 26px;
    margin: 0 30px;
    @media (max-width: 575px) {
        display: none;
    }
`;

export default Stats;
