import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    align-items: center;
    @media (max-width: 575px) {
        border-radius: 15px;
    }
    flex: initial;
`;

export const Container = styled(FlexDivCentered)`
    margin-bottom: 10px;
    @media (max-width: 575px) {
        width: 100%;
        flex-direction: column;
    }
`;

export const ParticipantsContainer = styled(FlexDivRow)`
    @media (max-width: 575px) {
        margin-bottom: 10px;
    }
`;

export const ParticipantLogoContainer = styled.div<{ awayTeam?: boolean; isWinner: boolean; isDraw: boolean }>`
    border: 2.5px solid ${(props) => props.theme.borderColor.primary};
    margin-left: ${(props) => (props.awayTeam ? '-1vw' : '0')};
    background-color: ${(props) => props.theme.background.primary};
    border-color: ${(props) => (props.isWinner ? props.theme.borderColor.quaternary : props.theme.borderColor.primary)};
    box-shadow: ${(props) => (props.isWinner || props.isDraw ? props.theme.shadow.winner : '')};
    z-index: ${(props) => (props.isWinner ? '1' : '')};
    width: 100px;
    height: 100px;
    padding: 5px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    @media (max-width: 575px) {
        margin-left: ${(props) => (props.awayTeam ? '-3vw' : '0')};
    }
`;

export const ParticipantLogo = styled.img`
    width: 65px;
    height: 65px;
`;

export const LeagueLogoContainer = styled(FlexDivCentered)`
    margin-right: 15px;
    padding: 5px;
    @media (min-width: 768px) {
        width: 200px;
        text-align: end;
    }
    @media (max-width: 575px) {
        margin-right: 0px;
    }
`;

export const LeagueLogo = styled.i`
    width: 100%;
    height: 100%;
    font-size: 70px;
    object-fit: contain;
    @media (max-width: 575px) {
        font-size: 60px;
    }
`;

export const MatchTimeContainer = styled(FlexDivColumnCentered)`
    text-align: start;
    justify-content: center;
    margin-left: 15px;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    @media (min-width: 768px) {
        width: 200px;
        align-items: start;
    }
    @media (max-width: 575px) {
        margin-left: 0px;
        margin-bottom: 10px;
        text-align: center;
    }
`;

export const MatchTimeLabel = styled.span``;

export const MatchTime = styled.span`
    font-weight: bold;
`;

export const TeamNamesWrapper = styled(FlexDivCentered)<{ hideOnMobile: boolean }>`
    display: ${(props) => (props.hideOnMobile ? 'flex' : 'none')};
    font-weight: 600;
    font-size: 14px;
    width: 100%;
    text-transform: uppercase;
    margin-bottom: 20px;
    @media (max-width: 575px) {
        display: ${(props) => (props.hideOnMobile ? 'none' : 'flex')};
        margin-bottom: 10px;
    }
`;

export const TeamName = styled.span<{ isHomeTeam?: boolean; isOneSided?: boolean }>`
    width: 300px;
    text-align: ${(props) => (props.isOneSided ? 'center' : props.isHomeTeam ? 'end' : 'start')};
    padding-right: ${(props) => (props.isHomeTeam && !props.isOneSided ? 10 : 0)}px;
    padding-left: ${(props) => (props.isHomeTeam ? 0 : 10)}px;
`;

export const Versus = styled.span``;

export const TeamNames = styled(FlexDivCentered)<{ hideOnMobile: boolean }>`
    display: ${(props) => (props.hideOnMobile ? 'flex' : 'none')};
    font-weight: 600;
    font-size: 14px;
    width: 100%;
    margin-bottom: 20px;
    @media (max-width: 575px) {
        display: ${(props) => (props.hideOnMobile ? 'none' : 'flex')};
        margin-bottom: 10px;
    }
`;

export const LeagueInfo = styled.span`
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    margin-bottom: 10px;
    @media (max-width: 575px) {
        margin-top: 10px;
    }
`;
