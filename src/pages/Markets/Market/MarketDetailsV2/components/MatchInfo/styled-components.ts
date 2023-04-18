import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivRow, FlexDivColumn, FlexDivCentered, FlexDivColumnCentered } from 'styles/common';

export const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    align-items: center;
    @media (max-width: 575px) {
        border-radius: 15px;
    }
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
    border: 2.5px solid #5f6180;
    margin-left: ${(props) => (props.awayTeam ? '-1vw' : '0')};
    background-color: ${MAIN_COLORS.DARK_GRAY};
    border-color: ${(props) => (props.isWinner ? MAIN_COLORS.BORDERS.LIGHT_BLUE : MAIN_COLORS.BORDERS.GRAY)};
    box-shadow: ${(props) => (props.isWinner || props.isDraw ? MAIN_COLORS.SHADOWS.WINNER : '')};
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

export const ParticipantLogo = styled.img<{ isFlag?: boolean }>`
    width: 65px;
    height: ${(props) => (props?.isFlag ? '40' : '65')}px;
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
    text-align: center;
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
    }
`;

export const MatchTimeLabel = styled.span``;

export const MatchTime = styled.span`
    font-weight: bold;
`;

export const TeamNamesWrapper = styled(FlexDivCentered)<{ hideOnMobile: boolean }>`
    display: ${(props) => (props.hideOnMobile ? 'flex' : 'none')};
    font-weight: 700;
    font-size: 14px;
    width: 100%;
    text-transform: uppercase;
    margin-bottom: 20px;
    @media (max-width: 575px) {
        display: ${(props) => (props.hideOnMobile ? 'none' : 'flex')};
        margin-bottom: 10px;
    }
`;

export const TeamName = styled.span<{ isHomeTeam?: boolean }>`
    width: 300px;
    text-align: ${(props) => (props.isHomeTeam ? 'end' : 'start')};
    padding-right: ${(props) => (props.isHomeTeam ? 10 : 0)}px;
    padding-left: ${(props) => (props.isHomeTeam ? 0 : 10)}px;
`;

export const Versus = styled.span``;

export const TeamNames = styled(FlexDivCentered)<{ hideOnMobile: boolean }>`
    display: ${(props) => (props.hideOnMobile ? 'flex' : 'none')};
    font-weight: 700;
    font-size: 14px;
    width: 100%;
    margin-bottom: 20px;
    @media (max-width: 575px) {
        display: ${(props) => (props.hideOnMobile ? 'none' : 'flex')};
        margin-bottom: 10px;
    }
`;
