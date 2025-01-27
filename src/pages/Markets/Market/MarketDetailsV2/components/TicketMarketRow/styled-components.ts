import styled from 'styled-components';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const TicketRow = styled(FlexDivRowCentered)<{ highlighted?: boolean }>`
    border: ${(props) => (props.highlighted ? `1px solid ${props.theme.borderColor.senary}` : 'none ')};
    border-radius: 8px;
    height: 32px;
    padding: 0 10px;
    & > div {
        flex: 1;
    }
    &:last-child {
        margin-bottom: 10px;
    }
    @media (max-width: 767px) {
        height: initial;
        margin-bottom: 8px;
        padding: 0 2px;
    }
`;

export const TeamNamesContainer = styled.div<{ width?: string }>`
    display: flex;
    flex-direction: row;
    min-width: ${(props) => props.width || '250px'};
    width: ${(props) => props.width || '250px'};
    @media (max-width: 950px) {
        flex-direction: column;
    }
    @media (max-width: 767px) {
        min-width: 160px;
        width: 160px;
    }
    @media (max-width: 575px) {
        min-width: 120px;
        width: 120px;
    }
    margin-right: 5px;
    cursor: pointer;
    text-align: start;
    color: ${(props) => props.theme.textColor.primary};
`;

export const TeamNameLabel = styled(FlexDivRow)``;

export const MatchTeamsLabel = styled.span`
    font-size: 10px;
    @media (max-width: 575px) {
        font-size: 9px;
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
    color: ${(props) => props.theme.textColor.quinary};
    margin-right: 5px;
`;

export const PositionInfo = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.quaternary};
    align-items: center;
    margin-right: 5px;
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

export const MarketStatusIcon = styled.i`
    font-size: 12px;
    margin-right: 5px;
    margin-top: -1px;
    @media (max-width: 767px) {
        font-size: 10px;
        margin-right: 3px;
    }
`;

export const MarketStatus = styled.span<{ color?: string }>`
    color: ${(props) => props.color || props.theme.textColor.primary};
    min-width: 100px;
    text-align: end;
    @media (max-width: 767px) {
        margin-left: 5px;
        min-width: 80px;
    }
    @media (max-width: 575px) {
        margin-left: 5px;
        min-width: 40px;
    }
`;

export const ResolveAction = styled.div`
    border: 1px solid ${(props) => props.theme.warning.borderColor.primary};
    background: ${(props) => props.theme.warning.textColor.primary};
    color: ${(props) => props.theme.warning.background.primary};
    max-width: 14px;
    height: 14px;
    margin-left: 5px;
    border-radius: 3px;
    cursor: pointer;
`;

export const SettingsIcon = styled.i`
    font-size: 14px;
    font-weight: 600;
    margin-top: -2px;
    margin-left: -1px;
`;
