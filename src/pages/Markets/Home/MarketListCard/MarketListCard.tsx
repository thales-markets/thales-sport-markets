import Tooltip from 'components/Tooltip';
import { ApexBetTypeKeyMapping } from 'constants/markets';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { AccountPosition, SportMarketInfo } from 'types/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { getIsApexTopGame, isApexGame, isClaimAvailable, isMlsGame } from 'utils/markets';
import MatchStatus from './components/MatchStatus';
import Odds from './components/Odds';
import {
    BetTypeContainer,
    ClubContainer,
    ClubLogo,
    ClubNameLabel,
    ClubVsClubContainer,
    Container,
    VSLabel,
} from './styled-components';

type MarketRowCardProps = {
    market: SportMarketInfo;
    accountPositions?: AccountPosition[];
};

const MarketListCard: React.FC<MarketRowCardProps> = ({ market, accountPositions }) => {
    const claimAvailable = isClaimAvailable(accountPositions);

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    const isApexTopGame = getIsApexTopGame(market.isApex, market.betType);

    return (
        <Container claimBorder={claimAvailable} isCanceled={market.isCanceled} isResolved={market.isResolved}>
            <ClubVsClubContainer>
                <ClubContainer>
                    <ClubLogo
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
                            {isMlsGame(market.tags[0]) && (
                                <Tooltip overlay={t(`common.mls-tooltip`)} iconFontSize={17} marginLeft={2} />
                            )}
                        </VSLabel>
                        <ClubContainer>
                            <ClubLogo
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
                isResolved={market.isResolved}
                finalResult={market.finalResult}
                isLive={market.maturityDate < new Date()}
                isCancelled={market.isCanceled}
                odds={{
                    homeOdds: market.homeOdds,
                    awayOdds: market.awayOdds,
                    drawOdds: market.drawOdds,
                }}
                accountPositions={accountPositions}
                isPaused={market.isPaused}
                isApexTopGame={isApexTopGame}
                awayPriceImpact={market.awayPriceImpact}
                homePriceImpact={market.homePriceImpact}
                drawPriceImpact={market.drawPriceImpact}
            />
            <MatchStatus
                address={market.address}
                isResolved={market.isResolved}
                isLive={market.maturityDate < new Date()}
                isCanceled={market.isCanceled}
                isClaimable={claimAvailable}
                result={`${market.homeScore}${isApexTopGame ? '' : `:${market.awayScore}`}`}
                startsAt={formatDateWithTime(market.maturityDate)}
                isPaused={market.isPaused}
            />
        </Container>
    );
};

export default MarketListCard;
