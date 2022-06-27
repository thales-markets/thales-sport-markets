import React from 'react';
import { AccountPosition, SportMarketInfo } from 'types/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { getTeamImageSource } from 'utils/images';
import { isClaimAvailable } from 'utils/markets';
import MatchStatus from './components/MatchStatus';
import Odds from './components/Odds';
import { ClubContainer, ClubLogo, ClubNameLabel, ClubVsClubContainer, Container, VSLabel } from './styled-components';

type MarketRowCardProps = {
    market: SportMarketInfo;
    accountPosition?: AccountPosition;
};

const MarketListCard: React.FC<MarketRowCardProps> = ({ market, accountPosition }) => {
    console.log('accountPosition ', accountPosition);
    const claimAvailable = isClaimAvailable(market, accountPosition);

    return (
        <Container backgroundColor={'rgba(48, 54, 86, 0.5)'}>
            <ClubVsClubContainer>
                <ClubContainer>
                    <ClubLogo src={getTeamImageSource(market.homeTeam, market.tags[0])} />
                    <ClubNameLabel>{market.homeTeam}</ClubNameLabel>
                </ClubContainer>
                <VSLabel>{'VS'}</VSLabel>
                <ClubContainer>
                    <ClubLogo src={getTeamImageSource(market.awayTeam, market.tags[0])} />
                    <ClubNameLabel>{market.awayTeam}</ClubNameLabel>
                </ClubContainer>
            </ClubVsClubContainer>
            <Odds
                isResolved={market.isResolved}
                finalResult={market.finalResult}
                odds={{
                    homeOdds: market.homeOdds / 1e18,
                    awayOdds: market.awayOdds / 1e18,
                    drawOdds: market.drawOdds / 1e18,
                }}
            />
            <MatchStatus
                isResolved={market.isResolved}
                isLive={false}
                isClaimable={claimAvailable}
                result={`${market.homeScore}:${market.awayScore}`}
                startsAt={formatDateWithTime(market.maturityDate)}
            />
        </Container>
    );
};

export default MarketListCard;
