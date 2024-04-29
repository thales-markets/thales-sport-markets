import SPAAnchor from 'components/SPAAnchor';
import { ENETPULSE_SPORTS, JSON_ODDS_SPORTS, SPORTS_TAGS_MAP, SPORT_PERIODS_MAP } from 'constants/tags';
import { GAME_STATUS } from 'constants/ui';
import i18n from 'i18n';
import { t } from 'i18next';
import useEnetpulseAdditionalDataQuery from 'queries/markets/useEnetpulseAdditionalDataQuery';
import useSportMarketLiveResultQuery from 'queries/markets/useSportMarketLiveResultQuery';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { RootState } from 'redux/rootReducer';
import { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivRow } from 'styles/common';
import { SportMarketLiveResult, TicketMarket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { formatMarketOdds } from 'utils/markets';
import { getMatchLabel, getPositionTextV2, getTitleText } from 'utils/marketsV2';
import { buildMarketLink } from 'utils/routes';
import { getTicketMarketStatus } from 'utils/tickets';
import { getOrdinalNumberLabel } from 'utils/ui';
import web3 from 'web3';
import MatchLogosV2 from '../../../../../../../Markets/Home/Parlay/components/MatchLogosV2';
import {
    MatchPeriodContainer,
    MatchPeriodLabel,
    ScoreContainer,
    Status,
    TeamScoreLabel,
} from '../../../../../Positions/components/SinglePosition/styled-components';
import {
    MarketTypeInfo,
    MatchInfo,
    MatchLabel,
    Odd,
    ParlayStatus,
    PositionInfo,
    PositionText,
    Wrapper,
} from './styled-components';

const TicketItem: React.FC<{ market: TicketMarket }> = ({ market }) => {
    const theme: ThemeInterface = useTheme();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const selectedOddsType = useSelector(getOddsType);
    const language = i18n.language;

    const parlayItemQuote = market.isCanceled ? 1 : market.odd;

    const [liveResultInfo, setLiveResultInfo] = useState<SportMarketLiveResult | undefined>(undefined);
    const isGameStarted = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const isPendingResolution = isGameStarted && !isGameResolved;

    const gameIdString = web3.utils.hexToAscii(market.gameId);
    const isEnetpulseSport = ENETPULSE_SPORTS.includes(Number(market.leagueId));
    const isJsonOddsSport = JSON_ODDS_SPORTS.includes(Number(market.leagueId));
    const gameDate = new Date(market.maturityDate).toISOString().split('T')[0];

    const useLiveResultQuery = useSportMarketLiveResultQuery(gameIdString, {
        enabled: isAppReady && isPendingResolution && !isEnetpulseSport && !isJsonOddsSport,
    });

    const useEnetpulseLiveResultQuery = useEnetpulseAdditionalDataQuery(gameIdString, gameDate, market.leagueId, {
        enabled: isAppReady && isEnetpulseSport,
    });

    useEffect(() => {
        if (isEnetpulseSport) {
            if (useEnetpulseLiveResultQuery.isSuccess && useEnetpulseLiveResultQuery.data) {
                setLiveResultInfo(useEnetpulseLiveResultQuery.data);
            }
        } else {
            if (useLiveResultQuery.isSuccess && useLiveResultQuery.data) {
                setLiveResultInfo(useLiveResultQuery.data);
            }
        }
    }, [
        useLiveResultQuery,
        useLiveResultQuery.data,
        useEnetpulseLiveResultQuery,
        useEnetpulseLiveResultQuery.data,
        isEnetpulseSport,
    ]);

    const displayClockTime = liveResultInfo?.displayClock.replaceAll("'", '');
    return (
        <Wrapper style={{ opacity: market.isCanceled ? 0.5 : 1 }}>
            <SPAAnchor href={buildMarketLink(market.gameId, language)}>
                <MatchInfo>
                    <MatchLogosV2 market={market} width={'50px'} logoWidth={'24px'} logoHeight={'24px'} />
                    <MatchLabel>{getMatchLabel(market)} </MatchLabel>
                </MatchInfo>
            </SPAAnchor>
            <MarketTypeInfo>{getTitleText(market)}</MarketTypeInfo>
            <PositionInfo>
                <PositionText>{getPositionTextV2(market, market.position, true)}</PositionText>
                <Odd>{formatMarketOdds(selectedOddsType, parlayItemQuote)}</Odd>
            </PositionInfo>
            {isPendingResolution && !isMobile ? (
                isEnetpulseSport ? (
                    <Status color={theme.status.started}>{t('markets.market-card.pending')}</Status>
                ) : (
                    <FlexDivRow>
                        {liveResultInfo?.status != GAME_STATUS.FINAL &&
                            liveResultInfo?.status != GAME_STATUS.FULL_TIME &&
                            !isEnetpulseSport && (
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
            ) : (
                <></>
            )}
            {!isPendingResolution && <ParlayStatus>{getTicketMarketStatus(market)}</ParlayStatus>}
        </Wrapper>
    );
};

export default TicketItem;
