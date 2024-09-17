import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Wrapper = styled(FlexDivRowCentered)`
    padding: 5px 5px;
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    & > div {
        flex: 1;
    }
    border-bottom: 2px dashed ${(props) => props.theme.borderColor.senary};
    height: 50px;
    @media (max-width: 767px) {
        font-size: 10px;
        line-height: 10px;
        padding: 5px 5px;
        height: initial;
    }
`;

export const MatchInfo = styled.div`
    max-width: 220px;
    width: 220px;
    display: flex;
    align-items: center;
    height: 30px;
    cursor: pointer;
    @media (max-width: 1399px) {
        max-width: 200px;
        width: 200px;
    }
    @media (max-width: 767px) {
        max-width: 165px;
        width: 165px;
    }
`;

export const TeamNamesContainer = styled(FlexDivColumn)``;

export const TeamNameLabel = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.primary};
    line-height: 14px;
    text-align: start;
    margin-right: 5px;
    @media (max-width: 1399px) {
        max-width: 150px;
        width: 150px;
    }
    @media (max-width: 767px) {
        max-width: 120px;
        width: 120px;
        line-height: 12px;
    }
`;

export const MatchTeamsLabel = styled.span`
    font-size: 10px;
`;

export const SelectionInfoContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    & > div {
        flex: 1;
    }
    @media (max-width: 575px) {
        flex-direction: column;
        align-items: start;
    }
`;

export const MarketTypeInfo = styled(FlexDivRow)`
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${(props) => props.theme.textColor.quinary};
    margin-right: 5px;
    @media (max-width: 767px) {
        font-size: 10px;
    }
`;

export const PositionInfo = styled(FlexDivRow)`
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: ${(props) => props.theme.textColor.quaternary};
    align-items: center;
    margin-right: 5px;
    @media (max-width: 767px) {
        font-size: 10px;
    }
`;

export const PositionText = styled.span`
    text-align: start;
    min-width: 110px;
`;

export const Odd = styled.span`
    margin-left: 5px;
    @media (max-width: 575px) {
        margin-left: 10px;
    }
`;

export const MarketStatus = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.primary};
    justify-content: end;
`;

export const MatchScoreContainer = styled(FlexDivRow)`
    min-width: 150px;
    flex: initial !important;
    justify-content: end;
    @media (max-width: 767px) {
        margin-left: 5px;
        min-width: 80px;
    }
    @media (max-width: 575px) {
        margin-left: 5px;
        min-width: 40px;
    }
`;

export const MatchPeriodContainer = styled(FlexDivColumnCentered)`
    align-items: center;
`;

export const MatchPeriodLabel = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    white-space: nowrap;
    &.blink {
        color: ${(props) => props.theme.status.loss};
        animation: blinker 1.5s step-start infinite;
        font-weight: 600;
    }

    @keyframes blinker {
        50% {
            opacity: 0;
        }
    }

    &.red {
        color: ${(props) => props.theme.status.loss};
    }
    @media (max-width: 767px) {
        font-size: 10px;
        line-height: 12px;
    }
`;

export const ScoreContainer = styled(FlexDivColumn)`
    margin-left: 5px;
    flex: initial;
    justify-content: center;
`;

export const TeamScoreLabel = styled.span<{ isResolved?: boolean }>`
    font-weight: ${(props) => (props.isResolved ? 600 : 400)};
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    white-space: nowrap;
    text-align: end;
    color: ${(props) => props.theme.textColor.primary};
    &.period {
        color: ${(props) => props.theme.textColor.secondary};
    }
    @media (max-width: 767px) {
        font-size: 10px;
        line-height: 12px;
    }
`;

export const TicketMarketStatus = styled.span<{ color?: string }>`
    min-width: 150px;
    text-align: end;
    color: ${(props) => props.color || props.theme.textColor.primary};
    @media (max-width: 767px) {
        margin-left: 5px;
        min-width: 80px;
    }
    @media (max-width: 575px) {
        margin-left: 5px;
        min-width: 40px;
    }
`;
