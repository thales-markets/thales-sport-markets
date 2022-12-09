import SPAAnchor from 'components/SPAAnchor';
import Tooltip from 'components/Tooltip';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { SportMarketInfo } from 'types/markets';
import { formatShortDateWithTime } from 'utils/formatters/date';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { isFifaWCGame } from 'utils/markets';
import { buildMarketLink } from 'utils/routes';
import MatchStatus from './components/MatchStatus';
import Odds from './components/Odds';
import {
    TeamNameLabel,
    MatchInfoConatiner,
    Container,
    OddsWrapper,
    ResultWrapper,
    Result,
    ResultLabel,
    MatchTimeLabel,
    TeamsInfoConatiner,
    TeamLogosConatiner,
    ClubLogo,
    VSLabel,
    TeamNamesConatiner,
} from './styled-components';

type MarketRowCardProps = {
    market: SportMarketInfo;
    language: string;
};

const MarketListCard: React.FC<MarketRowCardProps> = ({ market, language }) => {
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    const isLive = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const isGameRegularlyResolved = market.isResolved && !market.isCanceled;
    const isPendingResolution = isLive && !isGameResolved;
    const noOdds = market.awayOdds == 0 && market.homeOdds == 0 && !isLive && !isGameResolved && !market.isPaused;
    const showOdds = !isPendingResolution && !isGameResolved && !market.isPaused;

    return (
        <Container isResolved={isGameRegularlyResolved}>
            <MatchInfoConatiner data-matomo-category="market-list-card" data-matomo-action="click-market-details">
                <SPAAnchor href={buildMarketLink(market.address, language)}>
                    <MatchTimeLabel>
                        {formatShortDateWithTime(market.maturityDate)}{' '}
                        {isFifaWCGame(market.tags[0]) && (
                            <Tooltip overlay={t(`common.fifa-tooltip`)} iconFontSize={12} marginLeft={2} />
                        )}
                    </MatchTimeLabel>
                    <TeamsInfoConatiner>
                        {!isMobile && (
                            <TeamLogosConatiner>
                                <ClubLogo
                                    height={market.tags[0] == 9018 ? '17px' : ''}
                                    width={market.tags[0] == 9018 ? '27px' : ''}
                                    alt="Home team logo"
                                    src={homeLogoSrc}
                                    onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                                />
                                <VSLabel>VS</VSLabel>
                                <ClubLogo
                                    height={market.tags[0] == 9018 ? '17px' : ''}
                                    width={market.tags[0] == 9018 ? '27px' : ''}
                                    alt="Away team logo"
                                    src={awayLogoSrc}
                                    onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                                />
                            </TeamLogosConatiner>
                        )}
                        <TeamNamesConatiner>
                            <TeamNameLabel>{market.homeTeam}</TeamNameLabel>
                            <TeamNameLabel>{market.awayTeam}</TeamNameLabel>
                        </TeamNamesConatiner>
                    </TeamsInfoConatiner>
                </SPAAnchor>
            </MatchInfoConatiner>
            <OddsWrapper>
                {showOdds && (
                    <Odds
                        title="WINNER"
                        noOdds={noOdds}
                        odds={{
                            homeOdds: market.homeOdds,
                            awayOdds: market.awayOdds,
                            drawOdds: market.drawOdds,
                        }}
                        marketId={market.id}
                        homeTeam={market.homeTeam}
                        awayTeam={market.awayTeam}
                        awayPriceImpact={market.awayPriceImpact}
                        homePriceImpact={market.homePriceImpact}
                        drawPriceImpact={market.drawPriceImpact}
                    />
                )}
                {/* <Odds
                    title="DOUBLE CHANCE"
                    isResolved={market.isResolved && !market.isCanceled}
                    finalResult={market.finalResult}
                    isLive={market.maturityDate < new Date()}
                    isCancelled={market.isCanceled}
                    odds={{
                        homeOdds: market.homeOdds,
                        awayOdds: market.awayOdds,
                        drawOdds: market.drawOdds,
                    }}
                    marketId={market.id}
                    homeTeam={market.homeTeam}
                    awayTeam={market.awayTeam}
                    accountPositions={accountPositions}
                    isPaused={market.isPaused}
                    isApexTopGame={false}
                    awayPriceImpact={market.awayPriceImpact}
                    homePriceImpact={market.homePriceImpact}
                    drawPriceImpact={market.drawPriceImpact}
                />
                <Odds
                    title="TOTAL"
                    isResolved={market.isResolved && !market.isCanceled}
                    finalResult={market.finalResult}
                    isLive={market.maturityDate < new Date()}
                    isCancelled={market.isCanceled}
                    odds={{
                        homeOdds: market.homeOdds,
                        awayOdds: market.awayOdds,
                        drawOdds: market.drawOdds,
                    }}
                    marketId={market.id}
                    homeTeam={market.homeTeam}
                    awayTeam={market.awayTeam}
                    accountPositions={accountPositions}
                    isPaused={market.isPaused}
                    isApexTopGame={false}
                    awayPriceImpact={market.awayPriceImpact}
                    homePriceImpact={market.homePriceImpact}
                    drawPriceImpact={market.drawPriceImpact}
                /> */}
            </OddsWrapper>
            {isGameRegularlyResolved ? (
                <ResultWrapper>
                    <ResultLabel>{t('markets.market-card.result')}:</ResultLabel>
                    <Result>{`${market.homeScore}:${market.awayScore}`}</Result>
                </ResultWrapper>
            ) : (
                <MatchStatus
                    isPendingResolution={isPendingResolution}
                    isCanceled={market.isCanceled}
                    isPaused={market.isPaused}
                />
            )}
        </Container>
    );
};

export default MarketListCard;
