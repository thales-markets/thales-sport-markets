import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

export const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const InnerWrapper = styled.div`
    width: 33%;
    display: flex;
    justify-content: center;
`;

export const Container = styled(FlexDiv)`
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
    margin-bottom: 20px;
`;

export const ParticipantsContainer = styled(FlexDiv)`
    flex-direction: row;
`;

export const ParticipantLogoContainer = styled.div<{ awayTeam?: boolean; isWinner?: boolean; isDraw?: boolean }>`
    ${(_props) => (_props?.awayTeam ? 'margin-left: -1vw;' : '')}
    background-color: #1A1C2B;
    border-color: ${(_props) =>
        _props?.isWinner ? `${MAIN_COLORS.BORDERS.WINNER} !important` : MAIN_COLORS.BORDERS.GRAY};
    ${(_props) => (_props?.isWinner || _props?.isDraw ? `box-shadow: ${MAIN_COLORS.SHADOWS.WINNER};` : '')}
    width: 100px;
    height: 100px;
    padding: 5px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2.5px solid #5f6180;
`;

export const ParticipantLogo = styled.img`
    width: 65px;
    height: 65px;
`;

export const LeagueLogoContainer = styled(FlexDiv)`
    width: 70px;
    height: 70px;
    margin-right: 20px;
    padding: 5px;
    justify-content: center;
    align-items: center;
`;

export const LeagueLogo = styled.img`
    width: 100%;
    height: 100%;
    object-fit: contain;
`;

export const MatchTimeContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    justify-content: center;
    margin-left: 15px;
`;

export const MatchTimeLabel = styled.span`
    font-weight: 300;
    font-size: 1em;
    line-height: 110%;
`;

export const MatchTime = styled.span`
    font-weight: bold;
    font-size: 1em;
    line-height: 110%;
`;

export const Question = styled.span`
    font-size: 17px;
    font-weight: 400;
    text-align: center;
    max-width: 250px;
`;

export const MarketNotice = styled.span`
    font-weight: 500;
    text-align: center;
    margin-bottom: 15px;
    margin-top: -5px;
`;
