import React from 'react';
import { useTranslation } from 'react-i18next';

import {
    Container,
    LeagueLogoContainer,
    ParticipantLogo,
    ParticipantLogoContainer,
    ParticipantsContainer,
    LeagueLogo,
    MatchTimeLabel,
    MatchTime,
    MatchTimeContrainer,
} from './styled-components';

import { MarketData } from 'types/markets';

import { getErrorImage, getLeagueImage, getTeamImageSource } from 'utils/images';
import { formatDateWithTime } from 'utils/formatters/date';

type MatchInfoPropsType = {
    market: MarketData;
};

const MatchInfo: React.FC<MatchInfoPropsType> = ({ market }) => {
    const { t } = useTranslation();

    const homeLogoSrc = getTeamImageSource(market.homeTeam, market.tags[0]);
    const awayLogoSrc = getTeamImageSource(market.awayTeam, market.tags[0]);
    const leagueLogo = getLeagueImage(market.tags[0]);

    return (
        <Container>
            <LeagueLogoContainer>
                <LeagueLogo src={leagueLogo} />
            </LeagueLogoContainer>
            <ParticipantsContainer>
                <ParticipantLogoContainer>
                    <ParticipantLogo src={homeLogoSrc ? homeLogoSrc : getErrorImage(market.tags[0])} />
                </ParticipantLogoContainer>
                <ParticipantLogoContainer awayTeam={true}>
                    <ParticipantLogo src={awayLogoSrc ? awayLogoSrc : getErrorImage(market.tags[0])} />
                </ParticipantLogoContainer>
            </ParticipantsContainer>
            <MatchTimeContrainer>
                <MatchTimeLabel>{t('market.match-time')}</MatchTimeLabel>
                <MatchTime>{formatDateWithTime(market.maturityDate)}</MatchTime>
            </MatchTimeContrainer>
        </Container>
    );
};

export default MatchInfo;
