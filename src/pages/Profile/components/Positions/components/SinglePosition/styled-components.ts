import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import {
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivColumnNative,
    FlexDivRow,
    FlexDivStart,
} from 'styles/common';
import { Value } from '../ParlayPosition/styled-components';

export const Wrapper = styled(FlexDivRow)`
    align-items: center;
    background-color: ${MAIN_COLORS.LIGHT_GRAY};
    border-radius: 4px;
    padding: 7px 10px;
    width: 100%;
    margin-bottom: 5px;
    position: relative;
    @media (max-width: 768px) {
        padding: 7px 5px;
    }
`;

export const PositionContainer = styled(FlexDivCentered)`
    margin-left: 15px;
    @media (max-width: 768px) {
        margin-left: 5px;
    }
`;

export const ResultContainer = styled(FlexDivStart)`
    align-items: center;
    margin-left: 25px;
    min-width: 100px;
    @media (max-width: 768px) {
        margin-left: 15px;
        min-width: 70px;
    }
`;

export const BoldValue = styled(Value)`
    font-weight: 700;
`;

export const ColumnDirectionInfo = styled(FlexDivColumnNative)`
    min-width: 100px;
    margin-left: 25px;
    :last-of-type {
        margin-left: 10px;
    }
    @media (max-width: 768px) {
        min-width: 60px;
    }
`;

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
        color: #e26a78;
        animation: blinker 1.5s step-start infinite;
        font-weight: 700;
    }

    @keyframes blinker {
        50% {
            opacity: 0;
        }
    }

    &.red {
        color: #e26a78;
    }
`;

export const ScoreContainer = styled(FlexDivColumn)`
    margin: 0px 5px;
`;

export const TeamScoreLabel = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    text-transform: uppercase;
    white-space: nowrap;
    color: ${(props) => props.theme.textColor.primary};
    &.period {
        color: ${(props) => props.theme.textColor.secondary};
    }
`;

export const Status = styled.span<{ color: string }>`
    font-size: 12px;
    text-transform: uppercase;
    color: ${(props) => props.color};
    align-self: center;
    justify-content: space-evenly;
`;
