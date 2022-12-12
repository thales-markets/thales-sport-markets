import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDiv, FlexDivRow } from 'styles/common';

export const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    @media (max-width: 500px) {
        width: 100%;
        background-color: ${MAIN_COLORS.LIGHT_GRAY};
        border-radius: 15px;
        margin-bottom: 9px;
        margin-top: 9px;
    }
`;

export const Container = styled(FlexDiv)`
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
    margin-bottom: 20px;
    @media (max-width: 500px) {
        flex-direction: column;
        justify-content: center;
    }
`;

export const ParticipantsContainer = styled(FlexDiv)`
    flex-direction: row;
    @media (max-width: 500px) {
        margin-bottom: 13px;
        margin-left: 20px;
    }
`;

export const ParticipantLogoContainer = styled.div<{ awayTeam?: boolean; isWinner?: boolean; isDraw?: boolean }>`
    ${(props) => (props?.awayTeam ? 'margin-left: -1vw;' : '')}
    background-color: ${MAIN_COLORS.DARK_GRAY};
    border-color: ${(props) =>
        props?.isWinner ? `${MAIN_COLORS.BORDERS.LIGHT_BLUE} !important` : MAIN_COLORS.BORDERS.GRAY};
    ${(props) => (props?.isWinner || props?.isDraw ? `box-shadow: ${MAIN_COLORS.SHADOWS.WINNER};` : '')}
    ${(props) => (props?.isWinner ? `z-index: 1;` : '')}
    width: 100px;
    height: 100px;
    padding: 5px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2.5px solid #5f6180;
    @media (max-width: 500px) {
        ${(props) => (props?.awayTeam ? 'margin-left: -3vw;' : '')}
        margin-right: 0px;
        background-color: ${MAIN_COLORS.LIGHT_GRAY};
    }
`;

export const ParticipantLogo = styled.img<{ isFlag?: boolean }>`
    width: 65px;
    height: ${(props) => (props?.isFlag ? '40' : '65')}px;
`;

export const LeagueLogoContainer = styled(FlexDiv)`
    width: 70px;
    height: 70px;
    margin-right: 15px;
    padding: 5px;
    justify-content: center;
    align-items: center;
    @media (min-width: 950px) {
        width: 200px;
        text-align: end;
    }
    @media (max-width: 500px) {
        margin-right: 20px;
        margin-bottom: 13px;
    }
`;

export const LeagueLogo = styled.i`
    width: 100%;
    height: 100%;
    font-size: 70px;
    object-fit: contain;
    @media (max-width: 500px) {
        font-size: 80px;
    }
`;

export const MatchTimeContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    justify-content: center;
    margin-left: 15px;
    @media (min-width: 950px) {
        width: 200px;
        align-items: start;
    }
    @media (max-width: 500px) {
        margin-left: 0px;
        margin-bottom: 13px;
    }
`;

export const MatchTimeLabel = styled.span`
    font-weight: 300;
    font-size: 1em;
    line-height: 110%;
    margin-right: 5px;
`;

export const MatchTime = styled.span`
    font-weight: bold;
    font-size: 1em;
    line-height: 110%;
`;

export const MobileContainer = styled(FlexDiv)`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

export const MatchTimeContainerMobile = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: center;
    justify-content: center;
    margin-left: 15px;
    @media (max-width: 500px) {
        margin-left: 0px;
        margin-top: 10px;
        margin-bottom: 13px;
    }
`;

export const TeamNamesWrapper = styled(FlexDivRow)`
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    width: 100%;
`;

export const TeamName = styled.span<{ isHomeTeam?: boolean }>`
    padding: 0 10px 10px 10px;
    text-transform: uppercase;
    width: 300px;
    text-align: ${(props) => (props.isHomeTeam ? 'end' : 'start')};
`;

export const Versus = styled.span`
    padding: 0 0 10px 0;
    text-transform: uppercase;
`;
