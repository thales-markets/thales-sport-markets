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

export const LiveSystemIndicatorContainer = styled(FlexDivStart)<{ isLive?: boolean; isSystem?: boolean }>`
    min-width: 10px;
    max-width: 10px;
    height: 30px;
    border-radius: 3px;
    background: ${(props) =>
        props.isLive ? props.theme.status.live : props.isSystem ? props.theme.status.system : 'transparent'};
    color: ${(props) => props.theme.textColor.secondary};
    align-items: center;
    justify-content: center;
    margin-right: 2px;
    @media (max-width: 767px) {
        min-width: 9px;
        max-width: 9px;
    }
`;

export const LiveSystemLabel = styled.span`
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

export const StatusIcon = styled.i`
    font-size: 16px;
    margin-right: 5px;
    margin-top: -2px;
    @media (max-width: 767px) {
        font-size: 12px;
    }
`;

export const LastExpandedSection = styled(FlexDivRowCentered)`
    position: relative;
    justify-content: center;
    width: 100%;
    align-items: center;
    margin-bottom: 10px;
`;

export const QuoteWrapper = styled(FlexDivRow)`
    width: 200px;
    margin: 0 20px;
    font-size: 10px;
    color: ${(props) => props.theme.textColor.quaternary};
    @media (max-width: 767px) {
        margin: 0 10px;
        font-size: 9px;
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
    @media (max-width: 767px) {
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

export const FreeBetIcon = styled.i`
    font-size: 20px;
    color: ${(props) => props.theme.textColor.quaternary};
    margin: 0 3px;
`;
