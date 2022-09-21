import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

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

export const ParticipantLogoContainer = styled.div<{ awayTeam?: boolean }>`
    ${(_props) => (_props?.awayTeam ? 'margin-left: -1vw;' : '')}
    background-color: #1A1C2B;
    border-color: #5f6180;
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

export const MatchTimeContrainer = styled.div`
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
