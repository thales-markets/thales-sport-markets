import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getOnImageError, getOnPlayerImageError, getTeamImageSource } from 'utils/images';
import { SportMarket } from '../../types/markets';

type MatchLogosProps = {
    market: SportMarket;
    width?: string;
    logoWidth?: string;
    logoHeight?: string;
};

const MatchLogos: React.FC<MatchLogosProps> = ({ market, width, logoWidth, logoHeight }) => {
    const [homeLogoSrc, setHomeLogoSrc] = useState(
        market.isPlayerPropsMarket
            ? getTeamImageSource(market.playerProps.playerName, market.leagueId)
            : getTeamImageSource(market.homeTeam, market.leagueId)
    );
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.leagueId));

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
                    onError={getOnPlayerImageError(setHomeLogoSrc)}
                    logoWidth={logoWidth}
                    logoHeight={logoHeight}
                />
            ) : (
                <ClubLogo
                    alt={market.homeTeam}
                    src={homeLogoSrc}
                    onError={getOnImageError(setHomeLogoSrc, market.leagueId)}
                    logoWidth={logoWidth}
                    logoHeight={logoHeight}
                />
            )}
            {!market.isOneSideMarket && !market.isPlayerPropsMarket && (
                <ClubLogo
                    awayTeam={true}
                    alt={market.awayTeam}
                    src={awayLogoSrc}
                    onError={getOnImageError(setAwayLogoSrc, market.leagueId)}
                    logoWidth={logoWidth}
                    logoHeight={logoHeight}
                />
            )}
        </Container>
    );
};

const Container = styled.div<{ width?: string }>`
    display: flex;
    position: relative;
    align-items: center;
    width: ${(props) => props.width || '100%'};
    height: 100%;
`;

const ClubLogo = styled.img<{ awayTeam?: boolean; logoWidth?: string; logoHeight?: string }>`
    position: absolute;
    height: ${(props) => props.logoWidth || '30px'};
    width: ${(props) => props.logoHeight || '30px'};
    ${(props) => (props.awayTeam ? `margin-left: 16px;` : '')}
    z-index: ${(props) => (props.awayTeam ? '1' : '2')};
`;

export default MatchLogos;
