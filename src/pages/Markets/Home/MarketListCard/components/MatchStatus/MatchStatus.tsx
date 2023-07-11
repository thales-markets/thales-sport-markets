import { SPORTS_TAGS_MAP, SPORT_PERIODS_MAP } from 'constants/tags';
import { GAME_STATUS } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { SportMarketLiveResult } from 'types/markets';
import { getOrdinalNumberLabel } from 'utils/ui';
import { ThemeInterface } from 'types/ui';
import { useTheme } from 'styled-components';

type MatchStatusProps = {
    isPendingResolution: boolean;
    isCanceled: boolean;
    isPaused: boolean;
    liveResultInfo: SportMarketLiveResult | undefined;
    isEnetpulseSport: boolean;
    isJsonOddsSport: boolean;
};

const MatchStatus: React.FC<MatchStatusProps> = ({
    isPendingResolution,
    isCanceled,
    isPaused,
    liveResultInfo,
    isEnetpulseSport,
    isJsonOddsSport,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const displayClockTime = liveResultInfo?.displayClock.replaceAll("'", '');

    return (
        <Container bottomAlign={isPendingResolution}>
            {isPendingResolution ? (
                isEnetpulseSport || isJsonOddsSport ? (
                    <Status color={theme.status.started}>{t('markets.market-card.pending')}</Status>
                ) : (
                    <FlexDivRow>
                        {liveResultInfo?.status != GAME_STATUS.FINAL &&
                            liveResultInfo?.status != GAME_STATUS.FULL_TIME &&
                            !isEnetpulseSport &&
                            !isJsonOddsSport && (
                                <MatchPeriodContainer>
                                    <MatchPeriodLabel>{`${getOrdinalNumberLabel(Number(liveResultInfo?.period))} ${t(
                                        `markets.market-card.${SPORT_PERIODS_MAP[Number(liveResultInfo?.sportId)]}`
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
                            <TeamScoreLabel>{liveResultInfo?.homeScore}</TeamScoreLabel>
                            <TeamScoreLabel>{liveResultInfo?.awayScore}</TeamScoreLabel>
                        </ScoreContainer>
                        {SPORTS_TAGS_MAP['Soccer'].includes(Number(liveResultInfo?.sportId))
                            ? liveResultInfo?.period == 2 && (
                                  <ScoreContainer>
                                      <TeamScoreLabel className="period">
                                          {liveResultInfo?.scoreHomeByPeriod[0]}
                                      </TeamScoreLabel>
                                      <TeamScoreLabel className="period">
                                          {liveResultInfo?.scoreAwayByPeriod[0]}
                                      </TeamScoreLabel>
                                  </ScoreContainer>
                              )
                            : liveResultInfo?.scoreHomeByPeriod.map((homePeriodResult, index) => {
                                  return (
                                      <ScoreContainer key={index}>
                                          <TeamScoreLabel className="period">{homePeriodResult}</TeamScoreLabel>
                                          <TeamScoreLabel className="period">
                                              {liveResultInfo.scoreAwayByPeriod[index]}
                                          </TeamScoreLabel>
                                      </ScoreContainer>
                                  );
                              })}
                    </FlexDivRow>
                )
            ) : isCanceled ? (
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
