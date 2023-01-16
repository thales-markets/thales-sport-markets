import React, { useState } from 'react';
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
    MatchTimeContainer,
    Wrapper,
    TeamNamesWrapper,
    TeamName,
    Versus,
} from './styled-components';
import Tooltip from 'components/Tooltip';
import { MarketData } from 'types/markets';
import { getErrorImage, getLeagueLogoClass, getOnImageError, getTeamImageSource } from 'utils/images';
import { formatShortDateWithTime } from 'utils/formatters/date';
import { convertFinalResultToResultType, isFifaWCGame } from 'utils/markets';

type MatchInfoPropsType = {
    market: MarketData;
};

const MatchInfo: React.FC<MatchInfoPropsType> = ({ market }) => {
    const { t } = useTranslation();

    const [homeLogoSrc, setHomeLogoSrc] = useState(
        getTeamImageSource(market.homeTeam, market.tags[0])
            ? getTeamImageSource(market.homeTeam, market.tags[0])
            : getErrorImage(market.tags[0])
    );
    const [awayLogoSrc, setAwayLogoSrc] = useState(
        getTeamImageSource(market.awayTeam, market.tags[0])
            ? getTeamImageSource(market.awayTeam, market.tags[0])
            : getErrorImage(market.tags[0])
    );
    const leagueLogo = getLeagueLogoClass(market.tags[0]);

    const isGameResolved = market.gameStarted && market.resolved;

    const getTeamsNames = (hideOnMobile: boolean) => (
        <TeamNamesWrapper hideOnMobile={hideOnMobile}>
            <TeamName isHomeTeam={true}>{market.homeTeam}</TeamName>
            <Versus>{' vs '}</Versus>
            <TeamName isHomeTeam={false}>{market.awayTeam}</TeamName>
        </TeamNamesWrapper>
    );

    return (
        <>
            <Wrapper>
                <Container>
                    <LeagueLogoContainer>
                        <LeagueLogo className={leagueLogo} />
                    </LeagueLogoContainer>
                    <ParticipantsContainer>
                        <ParticipantLogoContainer
                            isWinner={isGameResolved && convertFinalResultToResultType(market.finalResult) == 0}
                            isDraw={isGameResolved && convertFinalResultToResultType(market.finalResult) == 2}
                        >
                            <ParticipantLogo
                                src={homeLogoSrc ? homeLogoSrc : getErrorImage(market.tags[0])}
                                isFlag={market.tags[0] == 9018}
                                onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                            />
                        </ParticipantLogoContainer>
                        <ParticipantLogoContainer
                            isWinner={isGameResolved && convertFinalResultToResultType(market.finalResult) == 1}
                            isDraw={isGameResolved && convertFinalResultToResultType(market.finalResult) == 2}
                            awayTeam={true}
                        >
                            <ParticipantLogo
                                src={awayLogoSrc ? awayLogoSrc : getErrorImage(market.tags[0])}
                                isFlag={market.tags[0] == 9018}
                                onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                            />
                        </ParticipantLogoContainer>
                    </ParticipantsContainer>
                    {getTeamsNames(false)}
                    <MatchTimeContainer>
                        <MatchTimeLabel>
                            {t('market.match-time')}:
                            {isFifaWCGame(market.tags[0]) && (
                                <Tooltip overlay={t(`common.fifa-tooltip`)} iconFontSize={14} marginLeft={2} />
                            )}
                        </MatchTimeLabel>
                        <MatchTime>{formatShortDateWithTime(market.maturityDate)}</MatchTime>
                    </MatchTimeContainer>
                </Container>
                {getTeamsNames(true)}
            </Wrapper>
        </>
    );
};

export default MatchInfo;
