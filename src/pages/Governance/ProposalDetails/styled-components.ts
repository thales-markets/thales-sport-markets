import { ScreenSizeBreakpoint } from 'enums/ui';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Container = styled(FlexDivColumnCentered)<{ topMargin?: number }>`
    padding: 10px 20px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        padding: 10px 20px;
    }
    background: ${(props) => props.theme.background.quinary};
    margin-top: ${(props) => (props.topMargin ? `${props.topMargin}px` : '')};
    border-radius: 8px;
`;

export const Description = styled.span`
    margin-top: 15px;
    margin-bottom: 15px;
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.secondary};
    a {
        color: ${(props) => props.theme.link.textColor.primary};
        word-wrap: break-word;
        &:hover {
            text-decoration: underline;
        }
    }
`;

export const VoteHeader = styled(FlexDivRowCentered)`
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
        align-items: start;
    }
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
