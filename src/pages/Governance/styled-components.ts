import { ScreenSizeBreakpoint } from 'enums/ui';
import { PieChart } from 'recharts';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';

export const Container = styled(FlexDivRow)`
    width: 100%;
    min-width: 767px;
    @media (max-width: 1200px) {
        flex-direction: column;
    }
`;

export const MainContentContainer = styled.div`
    background: transparent;
    width: 100%;
    border-radius: 8px;
    height: 100%;
    @media (max-width: 1200px) {
        width: 100%;
    }
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        border: none;
        background: transparent;
    }
`;

export const MainContentWrapper = styled.div`
    border-radius: 8px;
    background: transparent;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        background: ${(props) => props.theme.background.primary};
        padding: 0px 0px 10px 0px;
        flex-direction: column-reverse;
    }
`;

export const Votes = styled.div`
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 12px;
    }
`;

export const LoaderContainer = styled(FlexDivColumn)<{ height?: number }>`
    min-height: ${(props) => (props.height ? props.height : 400)}px;
    background: transparent;
    justify-content: space-evenly;
    position: relative;
    border-radius: 8px;
    margin-top: 10px;
    margin-bottom: 10px;
    color: ${(props) => props.theme.textColor.secondary};
`;

export const Blockie = styled.img`
    width: 20px;
    height: 20px;
    border-radius: 8px;
    margin-right: 6px;
`;

export const StyledLink = styled.a`
    color: ${(props) => props.theme.link.textColor.secondary};
    &path {
        fill: ${(props) => props.theme.link.textColor.secondary};
    }
    &:hover {
        text-decoration: underline;
    }
`;

export const VoteContainer = styled(FlexDivColumnCentered)`
    margin-top: 15px;
`;

export const VoteConfirmation = styled(FlexDiv)`
    font-weight: bold;
    font-size: 16px;
    line-height: 34px;
    color: ${(props) => props.theme.textColor.primary};
    padding: 0 10px;
    justify-content: center;
`;

export const ViewMore = styled(FlexDivCentered)<{ padding?: string }>`
    padding: ${(props) => (props.padding ? props.padding : '10px')};
    font-weight: normal;
    font-size: 16px;
    line-height: 36px;
    color: ${(props) => props.theme.link.textColor.secondary};
    &:hover {
        cursor: pointer;
        text-decoration: underline;
    }
`;

export const VotesCount = styled(FlexDivColumnCentered)`
    font-weight: 500;
    font-size: 18px;
    line-height: 22px;
    color: ${(props) => props.theme.button.textColor.primary};
    margin-bottom: 12px;
    text-align: center;
    background: ${(props) => props.theme.background.secondary};
    border-radius: 9999px;
    height: 30px;
    min-width: 30px;
    padding: 8px;
    margin-left: 8px;
`;

export const StyledPieChart = styled(PieChart)`
    display: flex;
    justify-self: center;
    align-self: flex-end;
`;

export const InfoText = styled.label<{ color?: string }>`
    font-weight: 500;
    font-size: 13px;
    line-height: 20px;
    color: ${(props) => (props.color ? `${props.color}` : props.theme.textColor.secondary)};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 12px;
    }
`;

export const InfoStats = styled.span<{ color?: string }>`
    font-weight: 700;
    font-size: 13px;
    line-height: 20px;
    color: ${(props) => (props.color ? `${props.color}` : props.theme.textColor.primary)};
    letter-spacing: 1px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 12px;
    }
`;
