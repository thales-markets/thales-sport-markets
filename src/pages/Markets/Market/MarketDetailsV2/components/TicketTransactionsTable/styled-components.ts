import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';

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
        line-height: 10px;
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
`;

export const TicketRow = styled(FlexDivRowCentered)<{ highlighted?: boolean }>`
    border: ${(props) => (props.highlighted ? `1px solid ${props.theme.borderColor.senary}` : 'none ')};
    border-radius: 15px;
    height: 32px;
    padding: 0 10px;
    margin-right: 5px;
    & > div {
        flex: 1;
    }
    &:last-child {
        margin-bottom: 10px;
    }
    @media (max-width: 767px) {
        height: initial;
        margin-bottom: 8px;
        padding: 0 5px;
    }
`;

export const MatchLabel = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.primary};
    text-align: start;
    margin-right: 5px;
    min-width: 250px;
    width: 250px;
    cursor: pointer;
    @media (max-width: 767px) {
        min-width: 150px;
        width: 150px;
    }
    @media (max-width: 575px) {
        min-width: 110px;
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
    color: ${(props) => props.theme.textColor.quinary};
    margin-right: 5px;
    min-width: 160px;
    @media (max-width: 575px) {
        min-width: 110px;
    }
`;

export const PositionInfo = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.quaternary};
    align-items: center;
    margin-right: 5px;
`;

export const PositionText = styled.span`
    text-align: start;
    min-width: 150px;
    @media (max-width: 575px) {
        min-width: 110px;
    }
`;

export const Odd = styled.span`
    margin-left: 5px;
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
`;

export const MarketStatus = styled(FlexDivRow)<{ color?: string }>`
    color: ${(props) => props.color || props.theme.textColor.primary};
    justify-content: end;
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
