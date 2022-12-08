import SPAAnchor from 'components/SPAAnchor';
import Tooltip from 'components/Tooltip';
import { t } from 'i18next';
import React, { useState } from 'react';
import { AccountPosition, SportMarketInfo } from 'types/markets';
import { formatShortDateWithTime } from 'utils/formatters/date';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { isFifaWCGame } from 'utils/markets';
import { buildMarketLink } from 'utils/routes';
import { Result, ResultLabel } from './components/MatchStatus/MatchStatus';
import Odds from './components/Odds';
import {
    TeamNameLabel,
    MatchInfoConatiner,
    Container,
    OddsWrapper,
    ResultWrapper,
    MatchTimeLabel,
    TeamsInfoConatiner,
    TeamLogosConatiner,
    ClubLogo,
    VSLabel,
    TeamNamesConatiner,
} from './styled-componentsV2';

type MarketRowCardProps = {
    market: SportMarketInfo;
    accountPositions?: AccountPosition[];
    language: string;
};

const MarketListCard: React.FC<MarketRowCardProps> = ({ market, accountPositions, language }) => {
    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    return (
        <Container isResolved={market.isResolved && !market.isCanceled}>
            <MatchInfoConatiner data-matomo-category="market-list-card" data-matomo-action="click-match-participants">
                <SPAAnchor href={buildMarketLink(market.address, language)}>
                    <MatchTimeLabel>
                        {formatShortDateWithTime(market.maturityDate)}{' '}
                        {isFifaWCGame(market.tags[0]) && (
                            <Tooltip overlay={t(`common.fifa-tooltip`)} iconFontSize={10} marginLeft={2} />
                        )}
                    </MatchTimeLabel>
                    <TeamsInfoConatiner>
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
                        <TeamNamesConatiner>
                            <TeamNameLabel>{market.homeTeam}</TeamNameLabel>
                            <TeamNameLabel>{market.awayTeam}</TeamNameLabel>
                        </TeamNamesConatiner>
                    </TeamsInfoConatiner>
                </SPAAnchor>
            </MatchInfoConatiner>
            <OddsWrapper>
                <Odds
                    title="WINNER"
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
                />
                {market.isResolved && !market.isCanceled && (
                    <ResultWrapper>
                        <ResultLabel>{t('markets.market-card.result')}:</ResultLabel>
                        <Result
                            isLive={market.maturityDate < new Date()}
                        >{`${market.homeScore}:${market.awayScore}`}</Result>
                    </ResultWrapper>
                )}
            </OddsWrapper>
        </Container>
    );
};

export default MarketListCard;
