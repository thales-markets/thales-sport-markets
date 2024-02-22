import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Wrapper = styled(FlexDivColumn)<{
    hideGame: boolean;
    isResolved: boolean;
}>`
    width: 100%;
    display: ${(props) => (props.hideGame ? 'none' : '')};
    border-radius: 5px;
    margin-bottom: 8px;
    background-color: ${(props) =>
        props.isResolved ? props.theme.oddsContainerBackground.tertiary : props.theme.oddsContainerBackground.primary};
    @media (max-width: 575px) {
        margin-bottom: 5px;
    }
`;

export const MainContainer = styled(FlexDivRow)`
    width: 100%;
    padding: 6px 9px 4px 8px;
    @media (max-width: 950px) {
        padding-right: 20px;
    }
`;

export const SecondRowContainer = styled(MainContainer)<{ mobilePaddingRight: number }>`
    position: relative;
    background-color: ${(props) => props.theme.oddsContainerBackground.secondary};
    flex-wrap: wrap;
    justify-content: flex-start;
    border-radius: 0 0 5px 5px;
    /* padding-right: 174px; */
    @media (max-width: 950px) {
        padding-left: 4px;
        padding-right: ${(props) => props.mobilePaddingRight}px;
    }
`;

export const ThirdRowContainer = styled(SecondRowContainer)`
    padding-right: 0px;
    justify-content: flex-start;
`;

export const MatchInfoConatiner = styled(FlexDivColumn)`
    cursor: pointer;
`;

export const MatchTimeLabel = styled.label`
    font-size: 11px;
    text-transform: uppercase;
`;

export const TeamsInfoConatiner = styled(FlexDivRow)`
    align-items: center;
    margin-top: 6px;
`;

export const TeamLogosConatiner = styled(FlexDivRow)`
    align-items: center;
    @media (max-width: 575px) {
        display: none;
    }
`;

export const ClubLogo = styled.img<{ width?: string; height?: string }>`
    height: ${(props) => (props?.height ? props.height : '27px')};
    width: ${(props) => (props?.width ? props.width : '27px')};
`;

export const VSLabel = styled.span`
    margin: 0 4px;
    font-weight: 400;
    font-size: 11px;
`;

export const TeamNamesConatiner = styled(FlexDivColumn)`
    margin-left: 6px;
    @media (max-width: 575px) {
        margin-left: 0px;
    }
`;

export const TeamNameLabel = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    text-transform: uppercase;
    white-space: nowrap;
`;

export const ResultWrapper = styled(FlexDivRowCentered)``;

export const Result = styled.span`
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.2em;
`;

export const ResultLabel = styled.span`
    font-weight: 300;
    font-size: 12px;
    margin-right: 6px;
    text-transform: uppercase;
`;

export const TotalMarketsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
`;

export const TotalMarketsContainer = styled.span`
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 117px;
    padding-left: 9px;
`;

export const PlayerPropsLabel = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    height: 20px;
    border-radius: 30px;
    border: 1px solid ${(props) => props.theme.background.quaternary};
    box-shadow: 0px 0px 6.39919px 0px ${(props) => props.theme.background.quaternary};
    color: ${(props) => props.theme.background.quaternary};
    font-family: Roboto;
    font-size: 10px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-transform: uppercase;
`;

export const TotalMarketsLabel = styled.span`
    width: min-content;
    font-size: 10px;
    line-height: 105%;
    display: flex;
    text-align: center;
    align-items: center;
    text-transform: uppercase;
    white-space: pre-line;
    margin-right: 5px;
`;

export const TotalMarkets = styled.span`
    width: 25px;
    height: 25px;
    font-size: 13px;
    display: flex;
    text-align: center;
    align-items: center;
    justify-content: center;
    background: ${(props) => props.theme.background.tertiary};
    border-radius: 50%;
    margin-right: 6px;
`;

export const TotalMarketsArrow = styled.i`
    font-size: 18px;
    cursor: pointer;
`;

export const Arrow = styled.i`
    font-size: 14px;
    position: absolute;
    bottom: 0px;
    right: -13px;
    cursor: pointer;
`;

export const ArrowRight = styled.i`
    font-size: 11px;
    color: ${(props) => props.theme.textColor.quaternary};
`;

export const OddsWrapper = styled(FlexDivRow)`
    position: relative;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 10px;
`;

export const PlayerPropsText = styled.span`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 11px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    text-transform: uppercase;
`;

export const PlayerPropsContainer = styled.div`
    display: flex;
    justify-content: flex-start;
    gap: 4px;
    align-items: center;
    margin-left: 10px;
    margin-top: 6px;
`;

export const PlayerPropsBubble = styled.span`
    width: 22px;
    height: 22px;
    border-radius: 50%;
    padding: 2px;
    background: ${(props) => props.theme.textColor.quaternary};
    color: ${(props) => props.theme.background.primary};
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-transform: uppercase;
`;
