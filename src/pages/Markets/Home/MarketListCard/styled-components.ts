import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRow, FlexDivRowCentered, FlexDivStart } from 'styles/common';

export const Wrapper = styled(FlexDivColumn)<{
    hideGame: boolean;
    isResolved: boolean;
    selected: boolean;
    isMarketSelected: boolean;
}>`
    width: 100%;
    display: ${(props) => (props.hideGame ? 'none' : '')};
    border-radius: 5px;
    margin-bottom: 10px;
    background-color: ${(props) =>
        props.selected
            ? props.theme.background.quaternary
            : props.isResolved || props.isMarketSelected
            ? props.theme.background.secondary
            : props.theme.background.quinary};
    color: ${(props) =>
        props.selected ? props.theme.oddsContainerBackground.tertiary : props.theme.textColor.primary};
    @media (max-width: 575px) {
        margin-bottom: 5px;
    }
`;

export const MainContainer = styled(FlexDivRow)<{ isGameOpen: boolean }>`
    position: relative;
    width: 100%;
    padding: 10px 12px;
    cursor: ${(props) => (props.isGameOpen ? 'default' : 'pointer')};
    @media (max-width: 950px) {
        flex-direction: column;
        padding: 8px 8px 4px 8px;
    }
`;

export const MatchInfoConatiner = styled(FlexDivColumn)`
    cursor: pointer;
    max-width: 250px;
    margin-right: 5px;
`;

export const MatchInfo = styled(FlexDivStart)<{
    selected: boolean;
}>`
    color: ${(props) =>
        props.selected ? props.theme.oddsContainerBackground.tertiary : props.theme.textColor.quinary};
    i {
        color: ${(props) =>
            props.selected ? props.theme.oddsContainerBackground.tertiary : props.theme.textColor.quinary};
    }
`;

export const MatchInfoLabel = styled.label`
    font-size: 12px;
    font-weight: 600;
    line-height: 14px;
    text-transform: uppercase;
    width: fit-content;
    margin-right: 2px;
    white-space: nowrap;
    @media (max-width: 950px) {
        font-size: 11px;
    }
`;

export const TeamsInfoConatiner = styled(FlexDivRow)`
    align-items: center;
    margin-top: 8px;
    flex: 1;
`;

export const TeamLogosConatiner = styled(FlexDivRow)<{ isColumnView: boolean; isTwoPositionalMarket: boolean }>`
    flex-direction: ${(props) => (props.isColumnView ? 'column' : 'row')};
    align-items: center;
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
    gap: ${(props) => (props.isColumnView ? (props.isTwoPositionalMarket ? '5px' : '10px') : '0px')};
    @media (max-width: 950px) {
        flex-direction: row;
    }
`;

export const TeamNameLabel = styled.span<{ isColumnView: boolean; isMarketSelected: boolean }>`
    font-weight: 600;
    font-size: 12px;
    line-height: ${(props) => (props.isColumnView ? '25px' : '18px')};
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: ${(props) => (props.isMarketSelected ? '130px' : '100%')};
    @media (max-width: 950px) {
        width: fit-content;
        margin-right: 5px;
    }
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
    margin-left: 5px;
    font-weight: 600;
    font-size: 13.5px;
    line-height: 16px;
    color: ${(props) => props.theme.textColor.quinary};
    text-align: center;
    cursor: pointer;
    margin-top: 20px;
    @media (max-width: 950px) {
        max-width: initial;
        position: absolute;
        top: 0;
        right: 0;
        font-size: 12px;
        margin-top: 0px;
        line-height: 14px;
        padding: 8px;
    }
`;

export const ExternalArrow = styled.i`
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 12px;
    color: ${(props) => props.theme.textColor.quinary};
    cursor: pointer;
`;

export const Arrow = styled.i`
    font-size: 14px;
    color: ${(props) => props.theme.textColor.quinary};
    cursor: pointer;
`;
