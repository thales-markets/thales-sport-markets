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
    max-width: 300px;
    width: 300px;
    display: flex;
    align-items: center;
    height: 30px;
    cursor: pointer;
    @media (max-width: 1399px) {
        max-width: 200px;
        width: 200px;
    }
    @media (max-width: 767px) {
        max-width: 150px;
        width: 150px;
    }
`;

export const MatchLabel = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.primary};
    text-align: start;
    margin-right: 5px;
    @media (max-width: 1399px) {
        max-width: 160px;
        width: 160px;
    }
    @media (max-width: 767px) {
        max-width: 110px;
        width: 110px;
    }
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
        margin-bottom: 2px;
        font-size: 10px;
        line-height: 10px;
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
        line-height: 10px;
    }
`;

export const PositionText = styled.span`
    text-align: start;
    min-width: 100px;
`;

export const Odd = styled.span`
    margin-left: 5px;
`;

export const MarketStatus = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.primary};
    justify-content: end;
`;

export const MatchScoreContainer = styled(FlexDivRow)`
    flex: initial !important;
`;

export const MatchPeriodContainer = styled(FlexDivColumnCentered)`
    align-items: center;
    margin-right: 5px;
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

export const ScoreContainer = styled(FlexDivColumn)`
    padding-left: 8px;
`;

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

export const TicketMarketStatus = styled.span<{ color?: string }>`
    min-width: 100px;
    text-align: end;
    color: ${(props) => props.color || props.theme.textColor.primary};
    @media (max-width: 767px) {
        margin-left: 5px;
        min-width: 40px;
    }
`;
