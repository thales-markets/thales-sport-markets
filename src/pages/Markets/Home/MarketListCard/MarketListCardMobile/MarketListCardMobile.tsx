import SPAAnchor from 'components/SPAAnchor';
import Tooltip from 'components/Tooltip';
import { ApexBetTypeKeyMapping } from 'constants/markets';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { FlexDivRow } from 'styles/common';
import { AccountPosition, SportMarketInfo } from 'types/markets';
import { formatDateWithTime, formatShortDate, formatTimeOfDate } from 'utils/formatters/date';
import { mapTeamNamesMobile } from 'utils/formatters/string';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { getIsApexTopGame, getIsIndividualCompetition, isApexGame } from 'utils/markets';
import { buildMarketLink } from 'utils/routes';
import MatchStatus from '../components/MatchStatus';
import Odds from '../components/Odds';
import {
    BetTypeContainer,
    ClubLogo,
    ClubVsClubContainer,
    Container,
    LinkIcon,
    LinkWrapper,
    MatchInfoLabelMobile,
    MatchInfoMobile,
    MatchNamesContainerMobile,
    VSLabelMobile,
} from '../styled-components';

type MarketRowCardProps = {
    market: SportMarketInfo;
    accountPositions?: AccountPosition[];
    language: string;
};

const MarketListCardMobile: React.FC<MarketRowCardProps> = ({ market, accountPositions, language }) => {
    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    const isApexTopGame = getIsApexTopGame(market.isApex, market.betType);

    const isIndividualCompetition = getIsIndividualCompetition(market.tags[0]);

    const smallScreen = window.innerWidth < 500;

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    return (
        <Container
            isCanceled={market.isCanceled}
            isResolved={market.isResolved && !market.isCanceled && !market.isPaused}
            isMobile={true}
        >
            <MatchInfoMobile>
                <MatchInfoLabelMobile>{formatShortDate(market.maturityDate)}</MatchInfoLabelMobile>
                <MatchNamesContainerMobile>
                    <MatchInfoLabelMobile>
                        {smallScreen ? mapTeamNamesMobile(market.homeTeam, isIndividualCompetition) : market.homeTeam}
                    </MatchInfoLabelMobile>
                    <VSLabelMobile>
                        {'VS'}
                        {isApexGame(market.tags[0]) && (
                            <Tooltip overlay={t(`common.h2h-tooltip`)} iconFontSize={10} marginLeft={2} />
                        )}
                    </VSLabelMobile>
                    <MatchInfoLabelMobile>
                        {smallScreen ? mapTeamNamesMobile(market.awayTeam, isIndividualCompetition) : market.awayTeam}
                    </MatchInfoLabelMobile>
                </MatchNamesContainerMobile>
                <MatchInfoLabelMobile>{formatTimeOfDate(market.maturityDate)}</MatchInfoLabelMobile>
            </MatchInfoMobile>
            <FlexDivRow>
                <ClubVsClubContainer isMobile={true}>
                    <ClubLogo
                        height={market.tags[0] == 9018 ? '20px' : '32px'}
                        width={market.tags[0] == 9018 ? '33px' : '32px'}
                        alt="Home team logo"
                        src={homeLogoSrc}
                        onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                    />
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
                        <>
                            <ClubLogo
                                height={market.tags[0] == 9018 ? '20px' : '32px'}
                                width={market.tags[0] == 9018 ? '33px' : '32px'}
                                alt="Away team logo"
                                src={awayLogoSrc}
                                onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                            />
                        </>
                    )}
                </ClubVsClubContainer>
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
                        accountPositions={accountPositions}
                        isPaused={market.isPaused}
                        isApexTopGame={isApexTopGame}
                        awayPriceImpact={market.awayPriceImpact}
                        homePriceImpact={market.homePriceImpact}
                        drawPriceImpact={market.drawPriceImpact}
                        isMobile={true}
                    />
                )}
                <MatchStatus
                    isResolved={market.isResolved}
                    isLive={market.maturityDate < new Date()}
                    isCanceled={market.isCanceled}
                    result={`${market.homeScore}${isApexTopGame ? '' : `:${market.awayScore}`}`}
                    startsAt={formatDateWithTime(market.maturityDate)}
                    isPaused={market.isPaused}
                    isMobile={true}
                />
                <LinkWrapper>
                    <SPAAnchor href={buildMarketLink(market.address, language)}>
                        <LinkIcon isMobile={true} className={`icon-exotic icon-exotic--link`} />
                    </SPAAnchor>
                </LinkWrapper>
            </FlexDivRow>
        </Container>
    );
};

export default MarketListCardMobile;
