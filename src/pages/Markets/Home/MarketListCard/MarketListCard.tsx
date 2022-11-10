import SPAAnchor from 'components/SPAAnchor';
import Tooltip from 'components/Tooltip';
import { ApexBetTypeKeyMapping } from 'constants/markets';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { AccountPosition, SportMarketInfo } from 'types/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { getIsApexTopGame, isApexGame } from 'utils/markets';
import { buildMarketLink } from 'utils/routes';
import MatchStatus from './components/MatchStatus';
import { Result, ResultLabel } from './components/MatchStatus/MatchStatus';
import Odds from './components/Odds';
import {
    BetTypeContainer,
    ClubContainer,
    ClubLogo,
    ClubNameLabel,
    ClubVsClubContainer,
    Container,
    LinkIcon,
    ResultWrapper,
    VSLabel,
} from './styled-components';

type MarketRowCardProps = {
    market: SportMarketInfo;
    accountPositions?: AccountPosition[];
    language: string;
};

const MarketListCard: React.FC<MarketRowCardProps> = ({ market, accountPositions, language }) => {
    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    const isApexTopGame = getIsApexTopGame(market.isApex, market.betType);

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    return (
        <Container isCanceled={market.isCanceled} isResolved={market.isResolved && !market.isCanceled}>
            <MatchStatus
                isResolved={market.isResolved}
                isLive={market.maturityDate < new Date()}
                isCanceled={market.isCanceled}
                result={`${market.homeScore}${isApexTopGame ? '' : `:${market.awayScore}`}`}
                startsAt={formatDateWithTime(market.maturityDate)}
                isPaused={market.isPaused}
            />
            <ClubVsClubContainer>
                <ClubContainer>
                    <ClubLogo
                        height={market.tags[0] == 9018 ? '20px' : ''}
                        width={market.tags[0] == 9018 ? '33px' : ''}
                        alt="Home team logo"
                        src={homeLogoSrc}
                        onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                    />
                    <ClubNameLabel>{market.homeTeam}</ClubNameLabel>
                </ClubContainer>
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
                        <VSLabel>
                            {'VS'}
                            {isApexGame(market.tags[0]) && (
                                <Tooltip overlay={t(`common.h2h-tooltip`)} iconFontSize={17} marginLeft={2} />
                            )}
                        </VSLabel>
                        <ClubContainer>
                            <ClubLogo
                                height={market.tags[0] == 9018 ? '20px' : ''}
                                width={market.tags[0] == 9018 ? '33px' : ''}
                                alt="Away team logo"
                                src={awayLogoSrc}
                                onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                            />
                            <ClubNameLabel>{market.awayTeam}</ClubNameLabel>
                        </ClubContainer>
                    </>
                )}
            </ClubVsClubContainer>
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
            />
            {market.isResolved && !market.isCanceled && (
                <ResultWrapper>
                    <ResultLabel>{t('markets.market-card.result')}:</ResultLabel>
                    <Result isLive={market.maturityDate < new Date()}>{`${market.homeScore}${
                        isApexTopGame ? '' : `:${market.awayScore}`
                    }`}</Result>
                </ResultWrapper>
            )}
            <SPAAnchor href={buildMarketLink(market.address, language)}>
                <LinkIcon className={`icon-exotic icon-exotic--link`} />
            </SPAAnchor>
        </Container>
    );
};

export default MarketListCard;
