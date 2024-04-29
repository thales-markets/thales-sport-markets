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
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { getOnImageError, getOnPlayerImageError, getTeamImageSource } from 'utils/images';
import { formatMarketOdds } from 'utils/markets';
import { getPositionTextV2, getTitleText } from 'utils/marketsV2';
import { buildMarketLink } from 'utils/routes';
import { getTicketMarketStatus } from 'utils/tickets';
import { getOrdinalNumberLabel } from 'utils/ui';
import web3 from 'web3';
import {
    MatchPeriodContainer,
    MatchPeriodLabel,
    ScoreContainer,
    Status,
    TeamScoreLabel,
} from '../../../../../Positions/components/SinglePosition/styled-components';
import {
    ClubLogo,
    MarketTypeInfo,
    MatchInfo,
    MatchLabel,
    MatchLogo,
    Odd,
    PositionInfo,
    PositionText,
} from '../../../../styled-components';
import { ParlayStatus, Wrapper } from './styled-components';

const TicketItem: React.FC<{ market: TicketMarket }> = ({ market }) => {
    const theme: ThemeInterface = useTheme();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const selectedOddsType = useSelector(getOddsType);
    const language = i18n.language;

    const [homeLogoSrc, setHomeLogoSrc] = useState(
        market.isPlayerPropsMarket
            ? getTeamImageSource(market.playerProps.playerName, market.leagueId)
            : getTeamImageSource(market.homeTeam, market.leagueId)
    );
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.leagueId));

    useEffect(() => {
        if (market.isPlayerPropsMarket) {
            setHomeLogoSrc(getTeamImageSource(market.playerProps.playerName, market.leagueId));
        } else {
            setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.leagueId));
            setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.leagueId));
        }
    }, [market.homeTeam, market.awayTeam, market.leagueId, market.isPlayerPropsMarket, market.playerProps.playerName]);

    const parlayItemQuote = market.isCanceled ? 1 : market.odd;
    const parlayStatus = getTicketMarketStatus(market);

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
                <MatchInfo style={{ cursor: 'pointer' }}>
                    <MatchLogo>
                        {market.isPlayerPropsMarket ? (
                            <ClubLogo
                                alt={market.playerProps.playerName}
                                src={homeLogoSrc}
                                losingTeam={false}
                                onError={getOnPlayerImageError(setHomeLogoSrc)}
                                customMobileSize={'24px'}
                            />
                        ) : (
                            <ClubLogo
                                alt={market.homeTeam}
                                src={homeLogoSrc}
                                losingTeam={false}
                                onError={getOnImageError(setHomeLogoSrc, market.leagueId)}
                                customMobileSize={'24px'}
                            />
                        )}

                        {!market.isOneSideMarket && !market.isPlayerPropsMarket && (
                            <ClubLogo
                                awayTeam={true}
                                alt={market.awayTeam}
                                src={awayLogoSrc}
                                losingTeam={false}
                                onError={getOnImageError(setAwayLogoSrc, market.leagueId)}
                                customMobileSize={'30px'}
                            />
                        )}
                    </MatchLogo>
                    <MatchLabel>
                        {market.isOneSideMarket
                            ? fixOneSideMarketCompetitorName(market.homeTeam)
                            : !market.isPlayerPropsMarket
                            ? market.homeTeam + ' - ' + market.awayTeam
                            : market.playerProps.playerName}
                    </MatchLabel>
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
            {!isPendingResolution && <ParlayStatus>{parlayStatus}</ParlayStatus>}
        </Wrapper>
    );
};

export default TicketItem;
