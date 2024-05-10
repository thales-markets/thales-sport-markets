import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const TableText = styled.span`
    font-weight: 600;
    font-size: 12px;
    text-align: left;
    white-space: nowrap;
    @media (max-width: 600px) {
        font-size: 10px;
        white-space: pre-wrap;
    }
`;

export const StatusWrapper = styled.div`
    min-width: 62px;
    height: 21px;
    border: 2px solid ${(props) => props.color || props.theme.status.open};
    border-radius: 5px;
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    text-align: justify;
    text-transform: uppercase;
    text-align: center;
    color: ${(props) => props.color || props.theme.status.open};
    padding: 2px 4px 0 4px;
`;

export const ExpandedRowWrapper = styled.div`
    display: flex;
    flex-direction: column;
    border-bottom: 2px dashed #3c498a;
`;

export const FirstExpandedSection = styled(FlexDivColumnCentered)`
    flex: 2;
    font-weight: 600;
    font-size: 10px;
    line-height: 12px;
`;

export const TicketRow = styled(FlexDivRowCentered)<{ highlighted?: boolean }>`
    background: ${(props) => (props.highlighted ? props.theme.background.secondary : 'initial')};
    border-radius: 7px;
    height: 32px;
    padding: 0 10px;
    & > div {
        flex: 1;
    }
    &:last-child {
        margin-bottom: 10px;
    }
`;

export const MatchLabel = styled(FlexDivRow)`
    color: ${(props) => props.theme.textColor.primary};
    text-align: start;
    margin-right: 5px;
    max-width: 250px;
    width: 250px;
    cursor: pointer;
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
    min-width: 100px;
`;

export const Odd = styled.span`
    margin-left: 5px;
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
    flex: 1;
    gap: 30px;
    @media (max-width: 600px) {
        margin: 10px 0;
    }
    margin-bottom: 10px;
`;

export const QuoteWrapper = styled.div<{ isPayout?: boolean }>`
    display: flex;
    flex: flex-start;
    align-items: center;
    width: 100%;
    gap: 6px;
    font-size: 10px;
    color: ${(props) => (props.isPayout ? props.theme.status.win : props.theme.textColor.quaternary)};
    :first-child {
        margin-left: 0px;
        justify-content: end;
    }
    @media (max-width: 600px) {
        margin-left: 0;
    }
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
    color: #3c498a;
    cursor: pointer;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\0061';
    }
`;

export const ExternalLink = styled.a`
    color: ${(props) => props.theme.link.textColor.secondary};
`;

export const tableHeaderStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: '11px',
    lineHeight: '12px',
    textAlign: 'center',
    textTransform: 'uppercase',
    justifyContent: 'center',
};

export const tableRowStyle: React.CSSProperties = {
    justifyContent: 'center',
    padding: '0',
};
