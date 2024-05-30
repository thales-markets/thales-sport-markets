import { GAME_STATUS } from 'constants/ui';
import { Sport } from 'enums/sports';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { SportMarket, SportMarketScore } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { getLeaguePeriodType, getLeagueSport } from 'utils/sports';
import { getOrdinalNumberLabel } from 'utils/ui';

type MatchStatusProps = {
    market: SportMarket;
};

const MatchStatus: React.FC<MatchStatusProps> = ({ market }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isGameStarted = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCancelled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const liveScore = market.liveScore;

    const leagueSport = getLeagueSport(market.leagueId);

    const getScoreComponent = (scoreData: SportMarket | SportMarketScore) => (
        <>
            <ScoreContainer>
                <TeamScoreLabel isResolved={market.isResolved}>{scoreData.homeScore}</TeamScoreLabel>
                <TeamScoreLabel isResolved={market.isResolved}>{scoreData.awayScore}</TeamScoreLabel>
            </ScoreContainer>
            {scoreData.homeScoreByPeriod.map((_, index) => {
                if (leagueSport === Sport.SOCCER && index === 1) {
                    return <></>;
                }
                return (
                    <ScoreContainer key={index}>
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
    );

    return (
        <Container>
            {market.isCancelled ? (
                <Status color={theme.status.canceled}>{t('markets.market-card.canceled')}</Status>
            ) : market.isResolved || market.isGameFinished ? (
                <FlexDivRow>{getScoreComponent(market)}</FlexDivRow>
            ) : isPendingResolution ? (
                liveScore ? (
                    <FlexDivRow>
                        {liveScore.status != GAME_STATUS.FINAL && liveScore.status != GAME_STATUS.FULL_TIME && (
                            <MatchPeriodContainer>
                                <MatchPeriodLabel>{`${getOrdinalNumberLabel(Number(liveScore.period))} ${t(
                                    `markets.market-card.${getLeaguePeriodType(market.leagueId)}`
                                )}`}</MatchPeriodLabel>
                                <FlexDivCentered>
                                    <MatchPeriodLabel className="red">
                                        {liveScore.displayClock?.replaceAll("'", '')}
                                        <MatchPeriodLabel className="blink">&prime;</MatchPeriodLabel>
                                    </MatchPeriodLabel>
                                </FlexDivCentered>
                            </MatchPeriodContainer>
                        )}
                        {getScoreComponent(liveScore)}
                    </FlexDivRow>
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

export const Status = styled.span<{ color: string }>`
    font-size: 12px;
    text-transform: uppercase;
    color: ${(props) => props.color};
    align-self: center;
    justify-content: space-evenly;
`;

const MatchPeriodContainer = styled(FlexDivColumnCentered)`
    align-items: center;
    margin-right: 20px;
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
        font-weight: 700;
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
    margin-left: 10px;
    @media (max-width: 575px) {
        margin-left: 8px;
    }
`;

const TeamScoreLabel = styled.span<{ isResolved?: boolean }>`
    font-weight: ${(props) => (props.isResolved ? 600 : 400)};
    font-size: 12px;
    line-height: 18px;
    text-transform: uppercase;
    white-space: nowrap;
    color: ${(props) => props.theme.textColor.primary};
    &.period {
        color: ${(props) => props.theme.textColor.secondary};
    }
`;

export default MatchStatus;
