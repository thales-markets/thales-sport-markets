import MatchLogosV2 from 'components/MatchLogosV2';
import SPAAnchor from 'components/SPAAnchor';
import { GAME_STATUS } from 'constants/ui';
import { Sport } from 'enums/sports';
import i18n from 'i18n';
import { t } from 'i18next';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { RootState } from 'redux/rootReducer';
import { useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { formatDateWithTime } from 'thales-utils';
import { SportMarket, SportMarketScore, TicketMarket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { formatMarketOdds } from 'utils/markets';
import { getPositionTextV2, getTeamNameV2, getTitleText } from 'utils/marketsV2';
import { buildMarketLink } from 'utils/routes';
import { getLeaguePeriodType, getLeagueSport } from 'utils/sports';
import { getOrdinalNumberLabel } from 'utils/ui';
import {
    MarketTypeInfo,
    MatchInfo,
    MatchPeriodContainer,
    MatchPeriodLabel,
    MatchScoreContainer,
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

const TicketMarketDetails: React.FC<{ market: TicketMarket }> = ({ market }) => {
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const selectedOddsType = useSelector(getOddsType);
    const language = i18n.language;

    const parlayItemQuote = market.isCancelled ? 1 : market.odd;

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
            {!isMobile &&
                scoreData.homeScoreByPeriod.map((_, index) => {
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
                    <Odd>{formatMarketOdds(selectedOddsType, parlayItemQuote)}</Odd>
                </PositionInfo>
            </SelectionInfoContainer>
            {market.isCancelled ? (
                <TicketMarketStatus>{t('profile.card.canceled')}</TicketMarketStatus>
            ) : (market.isResolved || market.isGameFinished) && !market.isPlayerPropsMarket ? (
                <MatchScoreContainer>{getScoreComponent(market)}</MatchScoreContainer>
            ) : market.isResolved && market.isPlayerPropsMarket ? (
                <TicketMarketStatus>{market.homeScore}</TicketMarketStatus>
            ) : isPendingResolution ? (
                liveScore ? (
                    <MatchScoreContainer>
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
