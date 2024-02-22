import PositionSymbol from 'components/PositionSymbol';
import { BetTypeNameMap, ENETPULSE_SPORTS, JSON_ODDS_SPORTS, SPORTS_TAGS_MAP, SPORT_PERIODS_MAP } from 'constants/tags';
import { GAME_STATUS } from 'constants/ui';
import { BetType } from 'enums/markets';
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
import { formatDateWithTime } from 'thales-utils';
import { SportMarketLiveResult, TicketMarket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { getOnImageError, getOnPlayerImageError, getTeamImageSource } from 'utils/images';
import { formatMarketOdds, getLineInfoV2, getOddTooltipTextV2, getSymbolTextV2 } from 'utils/markets';
import { getOrdinalNumberLabel } from 'utils/ui';
import SPAAnchor from '../../../../../../../../components/SPAAnchor';
import { buildMarketLink } from '../../../../../../../../utils/routes';
import {
    MatchPeriodContainer,
    MatchPeriodLabel,
    ScoreContainer,
    Status,
    TeamScoreLabel,
} from '../../../../../Positions/components/SinglePosition/styled-components';
import { ClubLogo, ClubName, MatchInfo, MatchLabel, MatchLogo, StatusContainer } from '../../../../styled-components';
import { ParlayStatus, Wrapper } from './styled-components';

const ParlayItem: React.FC<{ market: TicketMarket }> = ({ market }) => {
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

    const positionEnum = market.position;

    const parlayItemQuote = market.isCanceled ? 1 : market.odd;
    const parlayStatus = getTicketMarketStatus(market);

    const symbolText = getSymbolTextV2(positionEnum, market);
    const lineInfo = getLineInfoV2(market, positionEnum);

    const [liveResultInfo, setLiveResultInfo] = useState<SportMarketLiveResult | undefined>(undefined);
    const isGameStarted = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const isPendingResolution = isGameStarted && !isGameResolved;

    const isEnetpulseSport = ENETPULSE_SPORTS.includes(Number(market.leagueId));
    const isJsonOddsSport = JSON_ODDS_SPORTS.includes(Number(market.leagueId));
    const gameDate = new Date(market.maturityDate).toISOString().split('T')[0];

    const useLiveResultQuery = useSportMarketLiveResultQuery(market.gameId, {
        enabled: isAppReady && isPendingResolution && !isEnetpulseSport && !isJsonOddsSport,
    });

    const useEnetpulseLiveResultQuery = useEnetpulseAdditionalDataQuery(market.gameId, gameDate, market.leagueId, {
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
                                customMobileSize={'30px'}
                            />
                        ) : (
                            <ClubLogo
                                alt={market.homeTeam}
                                src={homeLogoSrc}
                                losingTeam={false}
                                onError={getOnImageError(setHomeLogoSrc, market.leagueId)}
                                customMobileSize={'30px'}
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
                        <ClubName isOneSided={market.isOneSideMarket}>
                            {!market.isPlayerPropsMarket
                                ? market.isOneSideMarket
                                    ? fixOneSideMarketCompetitorName(market.homeTeam)
                                    : market.homeTeam
                                : `${market.playerProps.playerName} (${BetTypeNameMap[market.typeId as BetType]})`}
                        </ClubName>
                        {!market.isOneSideMarket && !market.isPlayerPropsMarket && (
                            <ClubName>{market.awayTeam}</ClubName>
                        )}
                    </MatchLabel>
                </MatchInfo>
            </SPAAnchor>
            <StatusContainer>
                <PositionSymbol
                    symbolAdditionalText={{
                        text: formatMarketOdds(selectedOddsType, parlayItemQuote),
                        textStyle: {
                            marginLeft: '10px',
                        },
                    }}
                    symbolText={symbolText}
                    symbolUpperText={
                        lineInfo && !market.isOneSideMarket && !market.isYesNoPlayerPropsMarket
                            ? {
                                  text: lineInfo,
                                  textStyle: {
                                      top: '-9px',
                                  },
                              }
                            : undefined
                    }
                    tooltip={<>{getOddTooltipTextV2(positionEnum, market)}</>}
                    additionalStyle={
                        market.isOneSideMarket || market.isOneSidePlayerPropsMarket || market.isYesNoPlayerPropsMarket
                            ? { fontSize: 11 }
                            : {}
                    }
                />
                {isPendingResolution && !isMobile ? (
                    isEnetpulseSport ? (
                        <Status color={theme.status.started}>{t('markets.market-card.pending')}</Status>
                    ) : (
                        <FlexDivRow>
                            {liveResultInfo?.status != GAME_STATUS.FINAL &&
                                liveResultInfo?.status != GAME_STATUS.FULL_TIME &&
                                !isEnetpulseSport && (
                                    <MatchPeriodContainer>
                                        <MatchPeriodLabel>{`${getOrdinalNumberLabel(
                                            Number(liveResultInfo?.period)
                                        )} ${t(
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
                <ParlayStatus>{parlayStatus}</ParlayStatus>
            </StatusContainer>
        </Wrapper>
    );
};

const getTicketMarketStatus = (market: TicketMarket) => {
    if (market.isCanceled) return t('profile.card.canceled');
    if (market.isResolved) {
        if (market.isPlayerPropsMarket) {
            return market.playerProps.score;
        }
        return `${market.homeScore} : ${market.awayScore}`;
    }
    return formatDateWithTime(Number(market.maturityDate));
};

export default ParlayItem;
