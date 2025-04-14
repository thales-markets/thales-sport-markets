import styled from 'styled-components';
import { FlexDiv, FlexDivColumnCentered } from 'styles/common';

export const LeagueCard = styled.div<{ isMarketSelected: boolean }>`
    display: flex;
    position: sticky;
    top: 0;
    z-index: 2;
    flex-direction: row;
    padding: 0px 12px 10px 12px;
    align-items: center;
    background-color: ${(props) => props.theme.background.primary};
    justify-content: space-between;
    padding-right: ${(props) => (props.isMarketSelected ? '0px' : '40px')};
`;

export const LeagueInfo = styled.div`
    display: flex;
    position: relative;
    flex-direction: row;
    cursor: pointer;
    align-items: center;
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    @media (max-width: 950px) {
        &:hover {
            color: ${(props) => props.theme.textColor.primary};
        }
    }
`;

export const GamesContainer = styled.div<{ hidden?: boolean }>`
    display: ${(props) => (props.hidden ? 'none' : 'flex')};
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
`;

export const LeagueFlag = styled.img`
    width: 24px;
    height: 24px;
    cursor: pointer;
`;

export const LeagueName = styled.label`
    font-size: 12px;
    text-transform: uppercase;
    margin-left: 10px;
    &:hover {
        cursor: pointer;
    }
`;

export const ArrowIcon = styled.i<{ down?: boolean }>`
    display: flex;
    align-items: center;
    font-size: 16px;
    margin-left: 10px;
    &:hover {
        cursor: pointer;
        color: ${(props) => props.theme.textColor.quaternary};
    }
    @media (max-width: 950px) {
        &:hover {
            color: ${(props) => props.theme.textColor.primary};
        }
    }
`;

export const StarIcon = styled.i`
    font-size: 20px;
    position: absolute;
    right: 10px;
    color: ${(props) => props.theme.textColor.secondary};
    cursor: pointer;
    &.selected,
    &:hover {
        color: ${(props) => props.theme.button.textColor.tertiary};
    }
`;

export const PlayerPropsHeader = styled(FlexDiv)<{ marketSelected: boolean; collapsed: boolean }>`
    position: sticky;
    top: 0;
    z-index: 2;
    background: ${(props) => props.theme.background.primary};
    padding: ${(props) => (props.marketSelected ? '0' : props.collapsed ? '0 15px 10px 15px' : '0px 15px 15px 15px')};
    justify-content: space-between;
    cursor: pointer;
    margin-bottom: -10px;
    @media (max-width: 950px) {
        padding: ${(props) =>
            props.marketSelected ? '0' : props.collapsed ? '0 15px 10px 15px' : '0px 15px 5px 15px'};
    }
`;

export const MatchTimeLabel = styled.label<{ marketSelected: boolean }>`
    color: ${(props) => props.theme.textColor.quinary};
    font-size: ${(props) => (props.marketSelected ? '10px' : '11px')};
    font-weight: 600;
    line-height: 14px;
    text-transform: uppercase;
    width: fit-content;
    margin-right: 2px;
    white-space: nowrap;
    z-index: 2;
    cursor: pointer;
    @media (max-width: 950px) {
        font-size: 11px;
    }
`;

export const MatchTeamsLabel = styled.label<{ marketSelected: boolean }>`
    display: flex;
    flex-direction: ${(props) => (props.marketSelected ? 'column' : 'row')};
    gap: 3px;
    font-size: ${(props) => (props.marketSelected ? '12px' : '13px')};
    cursor: pointer;
`;

export const MatchTimeLabelContainer = styled(FlexDiv)`
    align-items: center;
`;

export const GameOfLabel = styled.span`
    display: flex;
    align-items: center;
    height: 100%;
    position: absolute;
    right: 60px;
    color: ${(props) => props.theme.overdrop.textColor.primary};
    font-size: 12px;
    text-transform: uppercase;
    @media (max-width: 600px) {
        font-size: 8px;
        top: 0;
        right: 20px;
        height: auto;
    }
`;

export const FireContainer = styled(FlexDivColumnCentered)`
    font-weight: 600;
    margin-right: 5px;
    @media (max-width: 600px) {
        flex-direction: row;
        top: 5px;
        right: 44px;
    }
`;

export const Fire = styled.i`
    color: ${(props) => props.theme.overdrop.textColor.primary};
    font-size: 12px;
    display: flex;
    justify-content: center;
`;

export const FireText = styled.span`
    color: ${(props) => props.theme.overdrop.textColor.primary};
    white-space: pre;
    font-size: 7px;
    @media (max-width: 600px) {
        display: flex;
        align-items: center;
    }
`;

export const StickyContainer = styled(FlexDiv)`
    position: relative;
    justify-content: space-between;
    flex: 1;
`;
