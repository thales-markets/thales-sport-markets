import { Position } from 'enums/markets';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ParlaysMarket } from 'types/markets';
import { getOnImageError, getOnPlayerImageError, getTeamImageSource } from 'utils/images';

type MatchLogosProps = {
    market: ParlaysMarket;
    width?: string;
    isHighlighted?: boolean;
};

const MatchLogos: React.FC<MatchLogosProps> = ({ market, width, isHighlighted }) => {
    const [homeLogoSrc, setHomeLogoSrc] = useState(
        market.playerName === null
            ? getTeamImageSource(market.homeTeam, market.tags[0])
            : getTeamImageSource(market.playerName, market.tags[0])
    );
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    console.log();
    useEffect(() => {
        if (market.playerName === null) {
            setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
            setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
        } else {
            setHomeLogoSrc(getTeamImageSource(market.playerName, market.tags[0]));
        }
    }, [market.homeTeam, market.awayTeam, market.tags, market.playerName]);

    return (
        <Container width={width}>
            {market.playerName === null ? (
                <ClubLogo
                    alt={market.homeTeam}
                    src={homeLogoSrc}
                    isHighlighted={isHighlighted ? isHighlighted : market.position !== Position.AWAY}
                    onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                />
            ) : (
                <ClubLogo
                    alt={market.playerName}
                    src={homeLogoSrc}
                    isHighlighted={isHighlighted ? isHighlighted : market.position !== Position.AWAY}
                    onError={getOnPlayerImageError(setHomeLogoSrc)}
                />
            )}
            {!market.isOneSideMarket && market.playerName === null && (
                <ClubLogo
                    awayTeam={true}
                    alt={market.awayTeam}
                    src={awayLogoSrc}
                    isHighlighted={isHighlighted ? isHighlighted : market.position !== Position.HOME}
                    onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
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
