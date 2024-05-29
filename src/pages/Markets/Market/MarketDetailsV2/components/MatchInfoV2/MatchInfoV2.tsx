import Tooltip from 'components/Tooltip';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatShortDateWithTime } from 'thales-utils';
import { SportMarket, SportMarketLiveResult } from 'types/markets';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { getErrorImage, getLeagueLogoClass, getOnImageError, getTeamImageSource } from 'utils/images';
import { getLeagueTooltipKey } from '../../../../../../utils/sports';
import {
    Container,
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
    liveResultInfo: SportMarketLiveResult | undefined;
    isEnetpulseSport: boolean;
};

const MatchInfo: React.FC<MatchInfoPropsType> = ({ market, liveResultInfo, isEnetpulseSport }) => {
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

    const isGameRegularlyResolved = market.isResolved && !market.isCancelled;

    const getTeamsNames = (hideOnMobile: boolean) => (
        <TeamNamesWrapper hideOnMobile={hideOnMobile}>
            <TeamName isHomeTeam={true} isOneSided={market.isOneSideMarket}>
                {market.isOneSideMarket ? fixOneSideMarketCompetitorName(market.homeTeam) : market.homeTeam}
            </TeamName>
            {!market.isOneSideMarket && (
                <>
                    <Versus>{' vs '}</Versus>
                    <TeamName isHomeTeam={false}>{market.awayTeam}</TeamName>
                </>
            )}
        </TeamNamesWrapper>
    );

    const leagueTooltipKey = getLeagueTooltipKey(market.leagueId);

    return (
        <>
            <Wrapper>
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
                        {!market.isOneSideMarket && (
                            <ParticipantLogoContainer
                                isWinner={
                                    isGameRegularlyResolved &&
                                    market.winningPositions &&
                                    market.winningPositions.includes(1)
                                }
                                isDraw={
                                    isGameRegularlyResolved &&
                                    market.winningPositions &&
                                    market.winningPositions.includes(1)
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
                        {isEnetpulseSport && liveResultInfo ? (
                            <>
                                {liveResultInfo.tournamentName ? liveResultInfo.tournamentName : ''}
                                {liveResultInfo.tournamentRound ? ' | ' + liveResultInfo.tournamentRound : ''}
                            </>
                        ) : (
                            ''
                        )}
                    </MatchTimeContainer>
                </Container>
                {getTeamsNames(true)}
            </Wrapper>
        </>
    );
};

export default MatchInfo;
