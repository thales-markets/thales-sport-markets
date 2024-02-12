import { Position } from 'enums/markets';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getOnImageError, getOnPlayerImageError, getTeamImageSource } from 'utils/images';
import { TicketMarket } from '../../../../../../types/markets';

type MatchLogosProps = {
    market: TicketMarket;
    width?: string;
    isHighlighted?: boolean;
};

const MatchLogos: React.FC<MatchLogosProps> = ({ market, width, isHighlighted }) => {
    const [homeLogoSrc, setHomeLogoSrc] = useState(
        market.isPlayerPropsMarket
            ? getTeamImageSource(market.playerProps.playerName, market.leagueId)
            : getTeamImageSource(market.homeTeam, market.leagueId)
    );
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.leagueId));

    console.log();
    useEffect(() => {
        if (market.isPlayerPropsMarket) {
            setHomeLogoSrc(getTeamImageSource(market.playerProps.playerName, market.leagueId));
        } else {
            setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.leagueId));
            setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.leagueId));
        }
    }, [market.homeTeam, market.awayTeam, market.leagueId, market.isPlayerPropsMarket, market.playerProps.playerName]);

    return (
        <Container width={width}>
            {market.isPlayerPropsMarket ? (
                <ClubLogo
                    alt={market.playerProps.playerName}
                    src={homeLogoSrc}
                    isHighlighted={isHighlighted ? isHighlighted : market.position !== Position.AWAY}
                    onError={getOnPlayerImageError(setHomeLogoSrc)}
                />
            ) : (
                <ClubLogo
                    alt={market.homeTeam}
                    src={homeLogoSrc}
                    isHighlighted={isHighlighted ? isHighlighted : market.position !== Position.AWAY}
                    onError={getOnImageError(setHomeLogoSrc, market.leagueId)}
                />
            )}
            {!market.isOneSideMarket && !market.isPlayerPropsMarket && (
                <ClubLogo
                    awayTeam={true}
                    alt={market.awayTeam}
                    src={awayLogoSrc}
                    isHighlighted={isHighlighted ? isHighlighted : market.position !== Position.HOME}
                    onError={getOnImageError(setAwayLogoSrc, market.leagueId)}
                />
            )}
        </Container>
    );
};

const Container = styled.div<{ width?: string }>`
    display: flex;
    position: relative;
    align-items: center;
    width: ${(props) => (props.width ? props.width : '100%')};
    height: 100%;
`;

const ClubLogo = styled.img<{ awayTeam?: boolean; isHighlighted?: boolean }>`
    position: absolute;
    height: 27px;
    width: 27px;
    ${(props) => (props.awayTeam ? `margin-left: 16px;` : '')}
    z-index: ${(props) => (props.awayTeam ? '1' : '2')};
    opacity: ${(props) => (props.isHighlighted ? '1' : '0.4')};
`;

export default MatchLogos;
