import { GAME_STATUS } from 'constants/ui';
import { League, Sport } from 'enums/sports';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { SportMarketScore } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { getLeaguePeriodType, getLeagueSport } from 'utils/sports';
import { getOrdinalNumberLabel } from 'utils/ui';

type MatchStatusProps = {
    isPendingResolution: boolean;
    isCancelled: boolean;
    isPaused: boolean;
    liveScore: SportMarketScore | undefined;
    isRundownSport: boolean;
    leagueId: League;
};

const MatchStatus: React.FC<MatchStatusProps> = ({
    isPendingResolution,
    isCancelled,
    isPaused,
    liveScore,
    isRundownSport,
    leagueId,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const displayClockTime = liveScore?.displayClock?.replaceAll("'", '');

    return (
        <Container bottomAlign={isPendingResolution}>
            {isPendingResolution ? (
                !isRundownSport || !liveScore ? (
                    <Status color={theme.status.started}>{t('markets.market-card.pending')}</Status>
                ) : (
                    <FlexDivRow>
                        {liveScore.status != GAME_STATUS.FINAL &&
                            liveScore.status != GAME_STATUS.FULL_TIME &&
                            isRundownSport && (
                                <MatchPeriodContainer>
                                    <MatchPeriodLabel>{`${getOrdinalNumberLabel(Number(liveScore.period))} ${t(
                                        `markets.market-card.${getLeaguePeriodType(leagueId)}`
                                    )}`}</MatchPeriodLabel>
                                    <FlexDivCentered>
                                        <MatchPeriodLabel className="red">
                                            {displayClockTime}
                                            <MatchPeriodLabel className="blink">&prime;</MatchPeriodLabel>
                                        </MatchPeriodLabel>
                                    </FlexDivCentered>
                                </MatchPeriodContainer>
                            )}

                        <ScoreContainer>
                            <TeamScoreLabel>{liveScore.homeScore}</TeamScoreLabel>
                            <TeamScoreLabel>{liveScore.awayScore}</TeamScoreLabel>
                        </ScoreContainer>
                        {getLeagueSport(leagueId) === Sport.SOCCER
                            ? liveScore.period == 2 && (
                                  <ScoreContainer>
                                      <TeamScoreLabel className="period">
                                          {liveScore.homeScoreByPeriod[0]}
                                      </TeamScoreLabel>
                                      <TeamScoreLabel className="period">
                                          {liveScore.awayScoreByPeriod[0]}
                                      </TeamScoreLabel>
                                  </ScoreContainer>
                              )
                            : liveScore.homeScoreByPeriod.map((_, index) => {
                                  return (
                                      <ScoreContainer key={index}>
                                          <TeamScoreLabel className="period">
                                              {liveScore.homeScoreByPeriod[index]}
                                          </TeamScoreLabel>
                                          <TeamScoreLabel className="period">
                                              {liveScore.awayScoreByPeriod[index]}
                                          </TeamScoreLabel>
                                      </ScoreContainer>
                                  );
                              })}
                    </FlexDivRow>
                )
            ) : isCancelled ? (
                <Status color={theme.status.canceled}>{t('markets.market-card.canceled')}</Status>
            ) : isPaused ? (
                <Status color={theme.status.paused}>{t('markets.market-card.paused')}</Status>
            ) : (
                <></>
            )}
        </Container>
    );
};

const Container = styled(FlexDiv)<{ bottomAlign: boolean }>`
    justify-content: center;
    align-items: ${(props) => (props.bottomAlign ? 'flex-end' : 'center')};
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
    margin: 0px 5px;
`;

const TeamScoreLabel = styled.span`
    font-weight: 400;
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
