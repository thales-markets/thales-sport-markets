import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered } from 'styles/common';

export const MatchPeriodContainer = styled(FlexDivColumnCentered)`
    align-items: center;
    margin-right: 20px;
`;

export const MatchPeriodLabel = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    text-transform: uppercase;
    white-space: nowrap;
    &.blink {
        color: ${(props) => props.theme.status.loss};
        animation: blinker 1.5s step-start infinite;
        font-weight: 700;
    }

    @keyframes blinker {
        50% {
            opacity: 0;
        }
    }

    &.red {
        color: ${(props) => props.theme.status.loss};
    }
`;

export const ScoreContainer = styled(FlexDivColumn)``;

export const TeamScoreLabel = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    text-transform: uppercase;
    white-space: nowrap;
    text-align: end;
    color: ${(props) => props.theme.textColor.primary};
    &.period {
        color: ${(props) => props.theme.textColor.secondary};
    }
`;

export const Status = styled.span<{ color: string }>`
    font-size: 12px;
    text-transform: uppercase;
    color: ${(props) => props.color};
    text-align: end;
    min-width: 100px;
`;
