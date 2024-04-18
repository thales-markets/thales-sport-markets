import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Wrapper = styled(FlexDivColumn)<{
    hideGame: boolean;
    isResolved: boolean;
    selected: boolean;
}>`
    width: 100%;
    display: ${(props) => (props.hideGame ? 'none' : '')};
    border-radius: 5px;
    margin-bottom: 10px;
    background-color: ${(props) =>
        props.selected
            ? props.theme.background.quaternary
            : props.isResolved
            ? props.theme.background.secondary
            : props.theme.background.quinary};
    color: ${(props) =>
        props.selected ? props.theme.oddsContainerBackground.tertiary : props.theme.textColor.primary};
    @media (max-width: 575px) {
        margin-bottom: 5px;
    }
`;

export const MainContainer = styled(FlexDivRow)`
    width: 100%;
    padding: 10px 12px;
    @media (max-width: 950px) {
        padding-right: 20px;
    }
`;

export const MatchInfoConatiner = styled(FlexDivColumn)`
    cursor: pointer;
    max-width: 250px;
    margin-right: 5px;
`;

export const MatchTimeLabel = styled.label<{
    selected: boolean;
}>`
    font-size: 12px;
    font-weight: 600;
    line-height: 14px;
    text-transform: uppercase;
    width: fit-content;
    margin-right: 2px;
    white-space: nowrap;
    color: ${(props) =>
        props.selected ? props.theme.oddsContainerBackground.tertiary : props.theme.textColor.quinary};
`;

export const TeamsInfoConatiner = styled(FlexDivRow)`
    align-items: center;
    margin-top: 8px;
    flex: 1;
`;

export const TeamLogosConatiner = styled(FlexDivRow)<{ isColumnView: boolean; isTwoPositionalMarket: boolean }>`
    flex-direction: ${(props) => (props.isColumnView ? 'column' : 'row')};
    align-items: center;
    @media (max-width: 575px) {
        display: none;
    }
    gap: ${(props) => (props.isColumnView ? (props.isTwoPositionalMarket ? '2px' : '10px') : '0px')};
`;

export const ClubLogo = styled.img<{ awayTeam?: boolean; isColumnView: boolean }>`
    height: ${(props) => props.height || (props.isColumnView ? '26px' : '24px')};
    width: ${(props) => props.width || (props.isColumnView ? '26px' : '24px')};
    margin-left: ${(props) => (props.awayTeam && !props.isColumnView ? '-10px' : '0')};
    z-index: ${(props) => (props.awayTeam ? '1' : '2')};
`;

export const TeamNamesConatiner = styled(FlexDivColumn)<{ isColumnView: boolean; isTwoPositionalMarket: boolean }>`
    margin-left: 10px;
    @media (max-width: 575px) {
        margin-left: 0px;
    }
    gap: ${(props) => (props.isColumnView ? (props.isTwoPositionalMarket ? '5px' : '10px') : '0px')};
`;

export const TeamNameLabel = styled.span<{ isColumnView: boolean; isMarketSelected: boolean }>`
    font-weight: 600;
    font-size: 12px;
    line-height: ${(props) => (props.isColumnView ? '25px' : '18px')};
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: ${(props) => (props.isMarketSelected ? '110px' : '100%')};
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

export const MarketsCountWrapper = styled(FlexDivColumnCentered)`
    max-width: 35px;
    margin-left: 10px;
    font-weight: 600;
    font-size: 13.5px;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.quinary};
    text-align: center;
    cursor: pointer;
`;

export const Arrow = styled.i`
    font-size: 14px;
    color: ${(props) => props.theme.textColor.quinary};
    cursor: pointer;
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

export const OddsWrapper = styled(FlexDivRow)<{ isFirstRow?: boolean }>`
    position: relative;
    justify-content: flex-start;
    flex-wrap: ${(props) => (props.isFirstRow ? 'nowrap' : 'wrap')};
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
