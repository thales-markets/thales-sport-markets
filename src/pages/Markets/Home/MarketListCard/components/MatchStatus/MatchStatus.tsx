import { GAME_STATUS, STATUS_COLOR } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { SportMarketLiveResult } from 'types/markets';

type MatchStatusProps = {
    isPendingResolution: boolean;
    isCanceled: boolean;
    isPaused: boolean;
    liveResultInfo: SportMarketLiveResult | undefined;
};

const MatchStatus: React.FC<MatchStatusProps> = ({ isPendingResolution, isCanceled, isPaused, liveResultInfo }) => {
    const { t } = useTranslation();

    return (
        <Container bottomAlign={isPendingResolution}>
            {isPendingResolution ? (
                <FlexDivRow>
                    {liveResultInfo?.status != GAME_STATUS.FINAL && liveResultInfo?.status != GAME_STATUS.FULL_TIME && (
                        <MatchPeriodContainer>
                            <MatchPeriodLabel>{`${t('markets.market-card.period')}: ${
                                liveResultInfo?.period
                            }`}</MatchPeriodLabel>
                            <FlexDivCentered>
                                <MatchPeriodLabel className="blink">{liveResultInfo?.displayClock}</MatchPeriodLabel>
                            </FlexDivCentered>
                        </MatchPeriodContainer>
                    )}
                    <ScoreContainer>
                        <TeamScoreLabel>{liveResultInfo?.homeScore}</TeamScoreLabel>
                        <TeamScoreLabel>{liveResultInfo?.awayScore}</TeamScoreLabel>
                    </ScoreContainer>
                    {liveResultInfo?.sportId && liveResultInfo?.sportId >= 10
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
            ) : isCanceled ? (
                <Status color={STATUS_COLOR.CANCELED}>{t('markets.market-card.canceled')}</Status>
            ) : isPaused ? (
                <Status color={STATUS_COLOR.PAUSED}>{t('markets.market-card.paused')}</Status>
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
        color: #e26a78;
        animation: blinker 1s step-start infinite;
        font-weight: 700;
        margin-left: 3px;
    }

    @keyframes blinker {
        50% {
            opacity: 0;
        }
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
