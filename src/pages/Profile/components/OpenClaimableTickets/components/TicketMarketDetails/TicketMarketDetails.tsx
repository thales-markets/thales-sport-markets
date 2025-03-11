import MatchLogosV2 from 'components/MatchLogosV2';
import SPAAnchor from 'components/SPAAnchor';
import { GameStatusKey } from 'constants/markets';
import { GameStatus } from 'enums/markets';
import { League, Sport } from 'enums/sports';
import i18n from 'i18n';
import { t } from 'i18next';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { formatDateWithTime } from 'thales-utils';
import { SportMarket, SportMarketScore, TicketMarket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { formatMarketOdds } from 'utils/markets';
import {
    getMatchTeams,
    getPositionTextV2,
    getTeamNameV2,
    getTitleText,
    showGameScore,
    showLiveInfo,
} from 'utils/marketsV2';
import { buildMarketLink } from 'utils/routes';
import { getLeaguePeriodType, getLeagueSport } from 'utils/sports';
import { getOrdinalNumberLabel } from 'utils/ui';
import {
    MarketTypeInfo,
    MatchInfo,
    MatchPeriodContainer,
    MatchPeriodLabel,
    MatchScoreContainer,
    MatchTeamsLabel,
    Odd,
    PositionInfo,
    PositionText,
    ScoreContainer,
    SelectionInfoContainer,
    TeamNameLabel,
    TeamNamesContainer,
    TeamScoreLabel,
    TicketMarketStatus,
    Wrapper,
} from './styled-components';

const TicketMarketDetails: React.FC<{ market: TicketMarket; isLive: boolean; isSgp: boolean }> = ({
    market,
    isLive,
    isSgp,
}) => {
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector(getIsMobile);
    const selectedOddsType = useSelector(getOddsType);
    const language = i18n.language;

    const parlayItemQuote = market.isCancelled ? 1 : market.odd;

    const isGameStarted = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCancelled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const liveScore = market.liveScore;

    const leagueSport = getLeagueSport(market.leagueId);

    const getScoreComponent = (scoreData: SportMarket | SportMarketScore) =>
        showGameScore(scoreData.gameStatus) || !scoreData.gameStatus ? (
            <>
                {((market.leagueId === League.UFC && market.isGameFinished) || market.leagueId !== League.UFC) && (
                    <ScoreContainer>
                        <TeamScoreLabel isResolved={market.isResolved}>
                            {market.leagueId == League.UFC
                                ? Number(scoreData.homeScore) > 0
                                    ? 'W'
                                    : 'L'
                                : scoreData.homeScore}
                        </TeamScoreLabel>
                        <TeamScoreLabel isResolved={market.isResolved}>
                            {market.leagueId == League.UFC
                                ? Number(scoreData.awayScore) > 0
                                    ? 'W'
                                    : 'L'
                                : scoreData.awayScore}
                        </TeamScoreLabel>
                    </ScoreContainer>
                )}
                {!isMobile && market.leagueId === League.UFC && market.isGameFinished && (
                    <ScoreContainer>
                        <TeamScoreLabel className="period" isResolved={market.isResolved}>
                            {`(R${Number(scoreData.homeScore) > 0 ? scoreData.homeScore : scoreData.awayScore})`}
                        </TeamScoreLabel>
                    </ScoreContainer>
                )}
                {!isMobile &&
                    // TODO check logic because of 0:0 results when isResolved == true, but isGameFinished == false
                    (market.isResolved || market.isGameFinished) &&
                    leagueSport !== Sport.CRICKET &&
                    market.leagueId !== League.UFC &&
                    scoreData.homeScoreByPeriod.map((_, index) => {
                        if (leagueSport === Sport.SOCCER && index === 1) {
                            return null;
                        }
                        return (
                            <ScoreContainer key={`${market.gameId}-${index}`}>
                                <TeamScoreLabel className="period" isResolved={market.isResolved}>
                                    {scoreData.homeScoreByPeriod[index]}
                                </TeamScoreLabel>
                                <TeamScoreLabel className="period" isResolved={market.isResolved}>
                                    {scoreData.awayScoreByPeriod[index]}
                                </TeamScoreLabel>
                            </ScoreContainer>
                        );
                    })}
            </>
        ) : (
            <TicketMarketStatus color={theme.status.started}>
                {t(`markets.market-card.${GameStatusKey[scoreData.gameStatus]}`)}
            </TicketMarketStatus>
        );

    return (
        <Wrapper style={{ opacity: market.isCancelled ? 0.5 : 1 }}>
            <SPAAnchor href={buildMarketLink(market.gameId, language)}>
                <MatchInfo>
                    <MatchLogosV2
                        market={market}
                        width={isMobile ? '45px' : '45px'}
                        logoWidth={isMobile ? '20px' : '24px'}
                        logoHeight={isMobile ? '20px' : '24px'}
                    />
                    <TeamNamesContainer>
                        <TeamNameLabel>{getTeamNameV2(market, 0)}</TeamNameLabel>
                        {market.isPlayerPropsMarket && (
                            <MatchTeamsLabel>{`(${getMatchTeams(market)})`}</MatchTeamsLabel>
                        )}
                        {!market.isOneSideMarket && !market.isPlayerPropsMarket && (
                            <TeamNameLabel>{getTeamNameV2(market, 1)}</TeamNameLabel>
                        )}
                    </TeamNamesContainer>
                </MatchInfo>
            </SPAAnchor>
            <SelectionInfoContainer>
                <MarketTypeInfo>{getTitleText(market)}</MarketTypeInfo>
                <PositionInfo>
                    <PositionText>{getPositionTextV2(market, market.position, true)}</PositionText>
                    {!isSgp && <Odd>{formatMarketOdds(selectedOddsType, parlayItemQuote)}</Odd>}
                </PositionInfo>
            </SelectionInfoContainer>
            {market.isCancelled ? (
                <TicketMarketStatus>{t('profile.card.canceled')}</TicketMarketStatus>
            ) : (market.isResolved || market.isGameFinished) && !market.isPlayerPropsMarket ? (
                <MatchScoreContainer>{getScoreComponent(market)}</MatchScoreContainer>
            ) : market.isResolved && market.isPlayerPropsMarket ? (
                <TicketMarketStatus>{market.homeScore}</TicketMarketStatus>
            ) : isPendingResolution || isLive ? (
                liveScore ? (
                    <MatchScoreContainer>
                        {showLiveInfo(liveScore.gameStatus, liveScore.period) &&
                            (liveScore.gameStatus == GameStatus.RUNDOWN_HALF_TIME ||
                            liveScore.gameStatus == GameStatus.OPTICODDS_HALF ? (
                                <TicketMarketStatus>{t('markets.market-card.half-time')}</TicketMarketStatus>
                            ) : (
                                <MatchPeriodContainer>
                                    <MatchPeriodLabel>{`${getOrdinalNumberLabel(Number(liveScore.period))}${
                                        isMobile
                                            ? ''
                                            : ` ${t(`markets.market-card.${getLeaguePeriodType(market.leagueId)}`)}`
                                    }`}</MatchPeriodLabel>
                                    <FlexDivCentered>
                                        <MatchPeriodLabel className="red">
                                            {liveScore.displayClock?.replaceAll("'", '')}
                                            <MatchPeriodLabel className="blink">&prime;</MatchPeriodLabel>
                                        </MatchPeriodLabel>
                                    </FlexDivCentered>
                                </MatchPeriodContainer>
                            ))}
                        {getScoreComponent(liveScore)}
                    </MatchScoreContainer>
                ) : (
                    <TicketMarketStatus color={theme.status.started}>
                        {t('markets.market-card.pending')}
                    </TicketMarketStatus>
                )
            ) : market.isPaused ? (
                <TicketMarketStatus>{t('markets.market-card.paused')}</TicketMarketStatus>
            ) : (
                <TicketMarketStatus>{formatDateWithTime(Number(market.maturityDate))}</TicketMarketStatus>
            )}
        </Wrapper>
    );
};

export default TicketMarketDetails;
