import PositionSymbol from 'components/PositionSymbol';
import {
    ENETPULSE_SPORTS,
    FIFA_WC_TAG,
    FIFA_WC_U20_TAG,
    JSON_ODDS_SPORTS,
    SPORTS_TAGS_MAP,
    SPORT_PERIODS_MAP,
} from 'constants/tags';
import { GAME_STATUS, STATUS_COLOR } from 'constants/ui';
import { t } from 'i18next';
import useEnetpulseAdditionalDataQuery from 'queries/markets/useEnetpulseAdditionalDataQuery';
import useSportMarketLiveResultQuery from 'queries/markets/useSportMarketLiveResultQuery';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered, FlexDivRow } from 'styles/common';
import { CombinedMarket, SportMarketInfo, SportMarketLiveResult } from 'types/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { formatMarketOdds, getCombinedOddTooltipText, getSpreadAndTotalTextForCombinedMarket } from 'utils/markets';
import { getOrdinalNumberLabel } from 'utils/ui';
import { ClubLogo, ClubName, MatchInfo, MatchLabel, MatchLogo, StatusContainer } from '../../../../styled-components';
import {
    MatchPeriodContainer,
    MatchPeriodLabel,
    ScoreContainer,
    Status,
    TeamScoreLabel,
} from '../../../SinglePosition/styled-components';
import { ParlayStatus, Wrapper } from './styled-components';
import { getCombinedPositionName } from 'utils/combinedMarkets';

const ParlayCombinedItem: React.FC<{ combinedMarket: CombinedMarket }> = ({ combinedMarket }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const selectedOddsType = useSelector(getOddsType);

    const market = combinedMarket.markets[0];

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    const parlayItemQuote = market.isCanceled ? 1 : combinedMarket.totalOdd ? combinedMarket.totalOdd : 0;
    const parlayStatus = getParlayItemStatus(market);

    const symbolText = getCombinedPositionName(combinedMarket.markets, combinedMarket.positions);

    const [liveResultInfo, setLiveResultInfo] = useState<SportMarketLiveResult | undefined>(undefined);
    const isGameStarted = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const isPendingResolution = isGameStarted && !isGameResolved;

    const isEnetpulseSport = ENETPULSE_SPORTS.includes(Number(market.tags[0]));
    const isJsonOddsSport = JSON_ODDS_SPORTS.includes(Number(market.tags[0]));
    const gameDate = new Date(market.maturityDate).toISOString().split('T')[0];

    const tooltipText = getCombinedOddTooltipText(combinedMarket.markets, combinedMarket.positions);

    const spreadAndTotalValues = getSpreadAndTotalTextForCombinedMarket(
        combinedMarket.markets,
        combinedMarket.positions
    );
    const spreadAndTotalText = `${spreadAndTotalValues.spread ? spreadAndTotalValues.spread + '/' : ''}${
        spreadAndTotalValues.total ? spreadAndTotalValues.total : ''
    }`;

    const useLiveResultQuery = useSportMarketLiveResultQuery(market.id, {
        enabled: isAppReady && isPendingResolution && !isEnetpulseSport && !isJsonOddsSport,
    });

    const useEnetpulseLiveResultQuery = useEnetpulseAdditionalDataQuery(market.id, gameDate, market.tags[0], {
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
            <MatchInfo>
                <MatchLogo>
                    <ClubLogo
                        alt={market.homeTeam}
                        src={homeLogoSrc}
                        isFlag={market.tags[0] == FIFA_WC_TAG || market.tags[0] == FIFA_WC_U20_TAG}
                        losingTeam={false}
                        onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                        customMobileSize={'30px'}
                    />
                    <ClubLogo
                        awayTeam={true}
                        alt={market.awayTeam}
                        src={awayLogoSrc}
                        isFlag={market.tags[0] == FIFA_WC_TAG || market.tags[0] == FIFA_WC_U20_TAG}
                        losingTeam={false}
                        onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                        customMobileSize={'30px'}
                    />
                </MatchLogo>
                <MatchLabel>
                    <ClubName>{market.homeTeam}</ClubName>
                    <ClubName>{market.awayTeam}</ClubName>
                </MatchLabel>
            </MatchInfo>
            <StatusContainer>
                <PositionSymbol
                    symbolAdditionalText={{
                        text: formatMarketOdds(selectedOddsType, parlayItemQuote),
                        textStyle: {
                            marginLeft: '10px',
                        },
                    }}
                    symbolText={symbolText ? symbolText : ''}
                    symbolUpperText={
                        spreadAndTotalText
                            ? {
                                  text: spreadAndTotalText,
                                  textStyle: {
                                      top: '-9px',
                                  },
                              }
                            : undefined
                    }
                    tooltip={<>{tooltipText}</>}
                />
                {isPendingResolution && !isMobile ? (
                    isEnetpulseSport ? (
                        <Status color={STATUS_COLOR.STARTED}>{t('markets.market-card.pending')}</Status>
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

const getParlayItemStatus = (market: SportMarketInfo) => {
    if (market.isCanceled) return t('profile.card.canceled');
    if (market.isResolved) return `${market.homeScore} : ${market.awayScore}`;
    return formatDateWithTime(market.maturityDate);
};

export default ParlayCombinedItem;
