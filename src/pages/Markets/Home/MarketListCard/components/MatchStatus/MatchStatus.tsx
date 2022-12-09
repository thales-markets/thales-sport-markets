import { STATUS_COLOR } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

type MatchStatusProps = {
    isPendingResolution: boolean;
    isCanceled: boolean;
    isPaused: boolean;
};

const MatchStatus: React.FC<MatchStatusProps> = ({ isPendingResolution, isCanceled, isPaused }) => {
    const { t } = useTranslation();

    return (
        <Container>
            {isPendingResolution ? (
                <Status color={STATUS_COLOR.STARTED}>{t('markets.market-card.pending-resolution')}</Status>
            ) : isCanceled ? (
                <Status color={STATUS_COLOR.CANCELED}>{t('markets.market-card.canceled')}</Status>
            ) : isPaused ? (
                <Status color={STATUS_COLOR.PAUSED}>{t('markets.market-card.paused')}</Status>
            ) : (
                <></>
            )}
        </Container>
    );
};

const Container = styled(FlexDivCentered)``;

export const Status = styled.span<{ color: string }>`
    font-size: 12px;
    text-transform: uppercase;
    color: ${(props) => props.color};
    align-self: center;
    justify-content: space-evenly;
`;

export default MatchStatus;
