import Tooltip from 'components/Tooltip';
import { GameStatusKey } from 'constants/markets';
import { GameStatus, SportFilter } from 'enums/markets';
import { getLeaguePeriodType, getLeagueSport, League, Sport } from 'overtime-utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getSportFilter } from 'redux/modules/market';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';
import { SportMarket, SportMarketScore } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { isStalePausedMarket, showGameScore, showLiveInfo } from 'utils/marketsV2';
import { getOrdinalNumberLabel } from 'utils/ui';

type MatchStatusProps = {
    market: SportMarket;
};

const MatchStatus: React.FC<MatchStatusProps> = ({ market }) => {
    const { t } = useTranslation();
    const isMobile = useSelector(getIsMobile);
    const theme: ThemeInterface = useTheme();

    const sportFilter = useSelector(getSportFilter);

    const isGameStarted = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCancelled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const isGamePaused = sportFilter === SportFilter.Live && market.isPaused;
    const liveScore = market.liveScore;

    const leagueSport = getLeagueSport(market.leagueId);

    const liveMarketErrorMessage = market.live && market.errorMessage ? market.errorMessage : '';

    const getScoreComponent = (scoreData: SportMarket | SportMarketScore) =>
        showGameScore(scoreData.gameStatus) || !scoreData.gameStatus ? (
            <FlexDivRow>
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
                {market.leagueId === League.UFC && market.isGameFinished && (
                    <ScoreContainer>
                        <TeamScoreLabel className="period" isResolved={market.isResolved}>
                            {`(R${Number(scoreData.homeScore) > 0 ? scoreData.homeScore : scoreData.awayScore})`}
                        </TeamScoreLabel>
                    </ScoreContainer>
                )}
                {leagueSport !== Sport.CRICKET &&
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
            </FlexDivRow>
        ) : (
            <Status color={theme.status.started}>
                {t(`markets.market-card.${GameStatusKey[scoreData.gameStatus]}`)}
            </Status>
        );

    return (
        <Container>
            {market.isCancelled ? (
                <Status color={theme.status.canceled}>{t('markets.market-card.canceled')}</Status>
            ) : // TODO check logic because of 0:0 results when isResolved == true, but isGameFinished == false
            market.isResolved || market.isGameFinished ? (
                <>{getScoreComponent(market)}</>
            ) : isPendingResolution ? (
                isGamePaused ? (
                    <Status color={theme.status.paused}>
                        {isStalePausedMarket(market)
                            ? t(`markets.market-card.live-trading-stale-paused`)
                            : t(`markets.market-card.live-trading-paused`)}
                        {liveMarketErrorMessage && <Tooltip overlay={liveMarketErrorMessage} marginLeft={5} top={0} />}
                    </Status>
                ) : liveScore ? (
                    <>
                        {showLiveInfo(liveScore.gameStatus, liveScore.period) && (
                            <MatchScoreContainer>
                                {liveScore.gameStatus == GameStatus.RUNDOWN_HALF_TIME ||
                                liveScore.gameStatus == GameStatus.OPTICODDS_HALF ? (
                                    <Status color={theme.status.started} marginRight="10px">
                                        {t('markets.market-card.half-time')}
                                    </Status>
                                ) : (
                                    <MatchPeriodContainer>
                                        {!!liveScore.period && (
                                            <MatchPeriodLabel>{`${getOrdinalNumberLabel(Number(liveScore.period))}${
                                                isMobile
                                                    ? ''
                                                    : ` ${t(
                                                          `markets.market-card.${getLeaguePeriodType(market.leagueId)}`
                                                      )}`
                                            }`}</MatchPeriodLabel>
                                        )}
                                        {!!liveScore.displayClock && (
                                            <FlexDivCentered>
                                                <MatchPeriodLabel className="red">
                                                    {liveScore.displayClock?.replaceAll("'", '')}
                                                    <MatchPeriodLabel className="blink">&prime;</MatchPeriodLabel>
                                                </MatchPeriodLabel>
                                            </FlexDivCentered>
                                        )}
                                    </MatchPeriodContainer>
                                )}
                            </MatchScoreContainer>
                        )}
                        {getScoreComponent(liveScore)}
                    </>
                ) : (
                    <Status color={theme.status.started}>{t('markets.market-card.pending')}</Status>
                )
            ) : market.isPaused ? (
                <Status color={theme.status.paused}>{t('markets.market-card.paused')}</Status>
            ) : (
                <></>
            )}
        </Container>
    );
};

const Container = styled(FlexDiv)`
    justify-content: center;
    align-items: flex-end;
`;

const Status = styled.span<{ color: string; marginBottom?: string; marginRight?: string }>`
    font-size: 12px;
    text-transform: uppercase;
    color: ${(props) => props.color};
    align-self: center;
    justify-content: space-evenly;
    margin-bottom: ${(props) => props.marginBottom || ''};
    margin-right: ${(props) => props.marginRight || ''};
`;

const MatchScoreContainer = styled(FlexDivRow)`
    align-items: center;
    min-height: 36px;
`;

const MatchPeriodContainer = styled(FlexDivColumn)`
    align-items: center;
    margin-right: 20px;
    @media (max-width: 575px) {
        margin-right: 10px;
    }
`;

const MatchPeriodLabel = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    text-transform: uppercase;
    white-space: nowrap;
    &.blink {
        color: ${(props) => props.theme.status.loss};
        animation: blinker 1.5s step-start infinite;
        font-weight: 600;
    }

    @keyframes blinker {
        50% {
            opacity: 0;
        }
    }

    &.red {
        color: ${(props) => props.theme.status.loss};
    }
`;

const ScoreContainer = styled(FlexDivColumn)`
    margin-left: 5px;
    justify-content: center;
`;

const TeamScoreLabel = styled.span<{ isResolved?: boolean }>`
    font-weight: ${(props) => (props.isResolved ? 600 : 400)};
    font-size: 12px;
    line-height: 18px;
    text-transform: uppercase;
    white-space: nowrap;
    text-align: end;
    color: ${(props) => props.theme.textColor.primary};
    &.period {
        color: ${(props) => props.theme.textColor.secondary};
    }
`;

export default MatchStatus;
