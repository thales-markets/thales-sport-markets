import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRow, FlexDivRowCentered, FlexDivStart } from 'styles/common';

export const TableText = styled.span`
    font-weight: 600;
    font-size: 12px;
    text-align: left;
    white-space: nowrap;
    @media (max-width: 767px) {
        font-size: 10px;
        white-space: pre-wrap;
        margin-right: 2px;
    }
    @media (max-width: 575px) {
        font-size: 9px;
    }
`;

export const LiveIndicatorContainer = styled(FlexDivStart)<{ isLive?: boolean }>`
    min-width: 10px;
    max-width: 10px;
    height: 30px;
    border-radius: 3px;
    background: ${(props) => (props.isLive ? props.theme.status.live : 'transparent')};
    color: ${(props) => props.theme.textColor.secondary};
    align-items: center;
    justify-content: center;
    margin-right: 2px;
    @media (max-width: 767px) {
        min-width: 9px;
        max-width: 9px;
    }
`;

export const LiveLabel = styled.span`
    transform: rotate(270deg);
    color: ${(props) => props.theme.textColor.tertiary};
    font-size: 10px;
    text-transform: uppercase;
    line-height: 10px;
    margin-right: 1px;
    @media (max-width: 767px) {
        margin-right: 0px;
        font-size: 9px;
    }
`;

export const StatusWrapper = styled.div`
    min-width: 62px;
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    text-align: justify;
    text-align: center;
    color: ${(props) => props.color || props.theme.status.open};
    @media (max-width: 767px) {
        font-size: 10px;
    }
`;

export const ExpandedRowWrapper = styled.div`
    display: flex;
    flex-direction: column;
    border-bottom: 2px dashed ${(props) => props.theme.borderColor.senary};
`;

export const FirstExpandedSection = styled(FlexDivColumnCentered)`
    flex: 2;
    font-weight: 600;
    font-size: 10px;
    line-height: 12px;
    @media (max-width: 767px) {
        font-size: 10px;
    }
    @media (max-width: 575px) {
        font-size: 9px;
    }
`;

export const TicketRow = styled(FlexDivRowCentered)<{ highlighted?: boolean }>`
    border: ${(props) => (props.highlighted ? `1px solid ${props.theme.borderColor.senary}` : 'none ')};
    border-radius: 15px;
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
        padding: 0;
    }
`;

export const TeamNamesContainer = styled.div`
    display: flex;
    flex-direction: row;
    min-width: 250px;
    width: 250px;
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

export const StatusIcon = styled.i`
    font-size: 16px;
    margin-right: 5px;
    margin-top: -2px;
    @media (max-width: 767px) {
        font-size: 12px;
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

export const LastExpandedSection = styled(FlexDivRowCentered)`
    position: relative;
    justify-content: center;
    flex: 1;
    gap: 30px;
    @media (max-width: 600px) {
        margin: 10px 0;
    }
    margin-bottom: 10px;
`;

export const QuoteWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 6px;
    font-size: 10px;
    color: ${(props) => props.theme.textColor.quaternary};
`;

export const QuoteText = styled.span`
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
`;

export const QuoteLabel = styled.span`
    font-weight: 400;
    text-transform: uppercase;
`;

export const TwitterWrapper = styled.div`
    position: absolute;
    bottom: 0px;
    right: 5px;
    @media (max-width: 600px) {
        bottom: -2px;
        right: 2px;
    }
`;

export const TwitterIcon = styled.i`
    font-size: 14px;
    color: ${(props) => props.theme.textColor.septenary};
    cursor: pointer;
    &:before {
        font-family: HomepageIconsV2 !important;
        content: '\\0021';
    }
`;

export const ExternalLink = styled.a`
    color: ${(props) => props.theme.link.textColor.secondary};
`;

export const tableHeaderStyle: React.CSSProperties = {
    textAlign: 'center',
    justifyContent: 'center',
};

export const tableRowStyle: React.CSSProperties = {
    justifyContent: 'center',
    padding: '0',
};
