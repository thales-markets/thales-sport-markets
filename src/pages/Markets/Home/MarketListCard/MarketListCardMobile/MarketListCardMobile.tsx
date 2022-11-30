import SPAAnchor from 'components/SPAAnchor';
import Tooltip from 'components/Tooltip';
import { ApexBetTypeKeyMapping } from 'constants/markets';
import { t } from 'i18next';
import React from 'react';
import { AccountPosition, SportMarketInfo } from 'types/markets';
import { formatDateWithTime, formatShortDateWithTime } from 'utils/formatters/date';
import { getIsApexTopGame, isApexGame, isFifaWCGame } from 'utils/markets';
import { buildMarketLink } from 'utils/routes';
import MatchStatus from '../components/MatchStatus';
import Odds from '../components/Odds';
import {
    BetTypeContainer,
    Container,
    LinkIcon,
    LinkWrapper,
    MatchInfoLabelMobile,
    MatchInfoMobile,
    OddsWrapperMobile,
} from '../styled-components';

type MarketRowCardProps = {
    market: SportMarketInfo;
    accountPositions?: AccountPosition[];
    language: string;
};

const MarketListCardMobile: React.FC<MarketRowCardProps> = ({ market, accountPositions, language }) => {
    const isApexTopGame = getIsApexTopGame(market.isApex, market.betType);

    return (
        <Container
            isCanceled={market.isCanceled}
            isResolved={market.isResolved && !market.isCanceled && !market.isPaused}
            isMobile={true}
        >
            <MatchInfoMobile>
                <MatchInfoLabelMobile>
                    {formatShortDateWithTime(market.maturityDate)}{' '}
                    {isFifaWCGame(market.tags[0]) && (
                        <Tooltip overlay={t(`common.fifa-tooltip`)} iconFontSize={10} marginLeft={2} />
                    )}
                </MatchInfoLabelMobile>
                <MatchInfoLabelMobile home={true}>{market.homeTeam}</MatchInfoLabelMobile>
                {isApexGame(market.tags[0]) && (
                    <Tooltip overlay={t(`common.h2h-tooltip`)} iconFontSize={10} marginLeft={2} />
                )}
                {isApexTopGame ? (
                    <BetTypeContainer>
                        {t(`common.${ApexBetTypeKeyMapping[market.betType]}`)}
                        <Tooltip
                            overlay={t(`common.top-bet-type-title`, {
                                driver: market.homeTeam,
                                betType: t(`common.${ApexBetTypeKeyMapping[market.betType]}`),
                                race: market.leagueRaceName,
                            })}
                            iconFontSize={17}
                            marginLeft={2}
                        />
                    </BetTypeContainer>
                ) : (
                    <MatchInfoLabelMobile away={true}>{market.awayTeam}</MatchInfoLabelMobile>
                )}
            </MatchInfoMobile>
            <OddsWrapperMobile closedMarket={!market.isOpen || market.isPaused || market.isCanceled}>
                {!market.isCanceled && !market.isPaused && (
                    <Odds
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
                        isApexTopGame={isApexTopGame}
                        awayPriceImpact={market.awayPriceImpact}
                        homePriceImpact={market.homePriceImpact}
                        drawPriceImpact={market.drawPriceImpact}
                        isMobile={true}
                    />
                )}
                {(new Date(market.maturityDate) <= new Date() || market.isCanceled || market.isPaused) && (
                    <MatchStatus
                        isResolved={market.isResolved}
                        isLive={market.maturityDate < new Date()}
                        isCanceled={market.isCanceled}
                        result={`${market.homeScore}${isApexTopGame ? '' : `:${market.awayScore}`}`}
                        startsAt={formatDateWithTime(market.maturityDate)}
                        isPaused={market.isPaused}
                        isMobile={true}
                    />
                )}
                <LinkWrapper>
                    <SPAAnchor href={buildMarketLink(market.address, language)}>
                        <LinkIcon isMobile={true} className={`icon icon--arrow-external`} />
                    </SPAAnchor>
                </LinkWrapper>
            </OddsWrapperMobile>
        </Container>
    );
};

export default MarketListCardMobile;
