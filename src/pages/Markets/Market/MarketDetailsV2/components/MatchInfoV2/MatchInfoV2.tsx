import Tooltip from 'components/Tooltip';
import { getLeagueLabel, getLeagueSport, getLeagueTooltipKey, isFuturesMarket } from 'overtime-utils';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatShortDateWithTime } from 'thales-utils';
import { SportMarket } from 'types/markets';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { getErrorImage, getLeagueLogoClass, getOnImageError, getTeamImageSource } from 'utils/images';
import {
    Container,
    LeagueInfo,
    LeagueLogo,
    LeagueLogoContainer,
    MatchTime,
    MatchTimeContainer,
    MatchTimeLabel,
    ParticipantLogo,
    ParticipantLogoContainer,
    ParticipantsContainer,
    TeamName,
    TeamNamesWrapper,
    Versus,
    Wrapper,
} from './styled-components';

type MatchInfoPropsType = {
    market: SportMarket;
};

const MatchInfo: React.FC<MatchInfoPropsType> = ({ market }) => {
    const { t } = useTranslation();

    const [homeLogoSrc, setHomeLogoSrc] = useState(
        getTeamImageSource(market.homeTeam, market.leagueId)
            ? getTeamImageSource(market.homeTeam, market.leagueId)
            : getErrorImage(market.leagueId)
    );
    const [awayLogoSrc, setAwayLogoSrc] = useState(
        getTeamImageSource(market.awayTeam, market.leagueId)
            ? getTeamImageSource(market.awayTeam, market.leagueId)
            : getErrorImage(market.leagueId)
    );
    const leagueLogo = getLeagueLogoClass(market.leagueId);
    const leagueLabel = getLeagueLabel(market.leagueId);
    const leagueSport = getLeagueSport(market.leagueId);

    const isGameRegularlyResolved = market.isResolved && !market.isCancelled;

    const getTeamsNames = (hideOnMobile: boolean) => (
        <TeamNamesWrapper hideOnMobile={hideOnMobile}>
            <TeamName isHomeTeam={true} isOneSided={market.isOneSideMarket}>
                {market.isOneSideMarket ? fixOneSideMarketCompetitorName(market.homeTeam) : market.homeTeam}
            </TeamName>
            {!market.isOneSideMarket && (
                <>
                    <Versus>{' - '}</Versus>
                    <TeamName isHomeTeam={false}>{market.awayTeam}</TeamName>
                </>
            )}
        </TeamNamesWrapper>
    );

    const leagueTooltipKey = getLeagueTooltipKey(market.leagueId);

    return (
        <>
            <Wrapper>
                <LeagueInfo>{`${t(
                    `market.filter-label.sport.${leagueSport.toLowerCase()}`
                )} / ${leagueLabel}`}</LeagueInfo>
                <Container>
                    <LeagueLogoContainer>
                        <LeagueLogo className={leagueLogo} />
                    </LeagueLogoContainer>
                    <ParticipantsContainer>
                        <ParticipantLogoContainer
                            isWinner={
                                isGameRegularlyResolved &&
                                market.winningPositions &&
                                market.winningPositions.includes(0)
                            }
                            isDraw={
                                isGameRegularlyResolved &&
                                market.winningPositions &&
                                market.winningPositions.includes(2)
                            }
                        >
                            <ParticipantLogo
                                src={homeLogoSrc ? homeLogoSrc : getErrorImage(market.leagueId)}
                                onError={getOnImageError(setHomeLogoSrc, market.leagueId)}
                            />
                        </ParticipantLogoContainer>
                        {!market.isOneSideMarket && !isFuturesMarket(market.typeId) && (
                            <ParticipantLogoContainer
                                isWinner={
                                    isGameRegularlyResolved &&
                                    market.winningPositions &&
                                    market.winningPositions.includes(1)
                                }
                                isDraw={
                                    isGameRegularlyResolved &&
                                    market.winningPositions &&
                                    market.winningPositions.includes(2)
                                }
                                awayTeam={true}
                            >
                                <ParticipantLogo
                                    src={awayLogoSrc ? awayLogoSrc : getErrorImage(market.leagueId)}
                                    onError={getOnImageError(setAwayLogoSrc, market.leagueId)}
                                />
                            </ParticipantLogoContainer>
                        )}
                    </ParticipantsContainer>
                    {getTeamsNames(false)}
                    <MatchTimeContainer>
                        <MatchTimeLabel>{t('market.match-time')}:</MatchTimeLabel>
                        <MatchTime>
                            {formatShortDateWithTime(market.maturityDate)}
                            {leagueTooltipKey && (
                                <Tooltip overlay={t(leagueTooltipKey)} iconFontSize={14} marginLeft={2} />
                            )}
                        </MatchTime>
                        <>{`${market.tournamentName ? `${market.tournamentName}` : ''}`}</>
                    </MatchTimeContainer>
                </Container>
                {getTeamsNames(true)}
            </Wrapper>
        </>
    );
};

export default MatchInfo;
