import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivRowCentered } from 'styles/common';
import { ThemeInterface } from 'types/ui';

const Stats: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    console.log(t, theme, isMobile);

    return (
        <Container>
            <FlexDivCentered>
                <Icon className={'icon icon--stats'} />
                <Text>{t('march-madness.stats.live-stats')}</Text>
            </FlexDivCentered>
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)`
    width: 100%;
    height: 37px;
    background: ${(props) => props.theme.marchMadness.background.senary};
    border-radius: 8px;
    margin-bottom: 12px;
    @media (max-width: 575px) {
    }
`;

const Text = styled.span``;

const Icon = styled.i``;

export default Stats;
