import { ScreenSizeBreakpoint } from 'enums/ui';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Container = styled(FlexDivColumnCentered)<{ topMargin?: number }>`
    padding: 10px 20px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        padding: 10px 20px;
    }
    background: ${(props) => props.theme.background.quinary};
    margin-top: ${(props) => (props.topMargin ? `${props.topMargin}px` : '')};
    border-radius: 8px;
`;

export const Body = styled(FlexDivColumn)`
    margin-top: 15px;
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.primary};
    p {
        margin-bottom: 15px;
        color: ${(props) => props.theme.textColor.secondary};
    }
    a {
        color: ${(props) => props.theme.link.textColor.primary};
        word-wrap: break-word;
        &:hover {
            text-decoration: underline;
        }
    }
    table {
        overflow-y: auto;
        display: block;
        th {
            border: 1px solid ${(props) => props.theme.borderColor.primary};
            padding: 6px 13px;
            color: ${(props) => props.theme.textColor.tertiary};
        }
        td {
            border: 1px solid ${(props) => props.theme.borderColor.primary};
            padding: 6px 13px;
        }
    }
    h2 {
        font-weight: 700;
        font-size: 18px;
        line-height: 22px;
        color: ${(props) => props.theme.textColor.primary};
        margin-top: 24px;
        margin-bottom: 16px;
    }
`;

export const VoteHeader = styled(FlexDivRowCentered)`
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
        align-items: start;
    }
`;

export const VoteNote = styled(FlexDivRow)`
    font-weight: 500;
    font-size: 13px;
    line-height: 22px;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    text-transform: uppercase;
    margin-top: 12px;
    margin-left: 5px;
`;

export const DetailsTitle = styled(FlexDivRow)`
    font-weight: 700;
    font-size: 18px;
    line-height: 22px;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 5px;
    margin-top: 10px;
`;

export const VotingPowerTitle = styled(DetailsTitle)`
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-top: 0;
    }
`;

export const Divider = styled.hr`
    width: 100%;
    border: none;
    border-top: 1px solid ${(props) => props.theme.borderColor.primary};
`;

export const Icon = styled.i<{ color?: string }>`
    font-size: 25px;
    margin-right: 5px;
    color: ${(props) => (props.color ? props.color : props.theme.textColor.primary)};
`;

export const CouncilVotesLabel = styled.span`
    font-weight: 400;
    font-size: 13px;
    color: ${(props) => props.theme.textColor.tertiary};
    margin-top: 5px;
`;

export const SidebarHeaderContainer = styled(FlexDiv)`
    padding: 0px 20px 15px;
    align-items: center;
`;
