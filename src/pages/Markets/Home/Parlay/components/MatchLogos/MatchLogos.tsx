import { Position } from 'constants/options';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ParlaysMarket } from 'types/markets';
import { getOnImageError, getTeamImageSource } from 'utils/images';

type MatchLogosProps = {
    market: ParlaysMarket;
    width?: string;
    padding?: string;
    isHighlighted?: boolean;
};

const MatchLogos: React.FC<MatchLogosProps> = ({ market, width, padding, isHighlighted }) => {
    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    return (
        <Container isFlag={market.tags[0] == 9018} width={width} padding={padding}>
            <ClubLogo
                alt="Home team logo"
                src={homeLogoSrc}
                isFlag={market.tags[0] == 9018}
                isHighlighted={isHighlighted ? isHighlighted : market.position !== Position.AWAY}
                onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
            />
            <ClubLogo
                awayTeam={true}
                alt="Away team logo"
                src={awayLogoSrc}
                isFlag={market.tags[0] == 9018}
                isHighlighted={isHighlighted ? isHighlighted : market.position !== Position.HOME}
                onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
            />
        </Container>
    );
};

const Container = styled.div<{ isFlag?: boolean; width?: string; padding?: string }>`
    display: flex;
    position: relative;
    align-items: center;
    width: ${(props) => (props.width ? props.width : '100%')};
    height: 100%;
    ${(props) => (props.isFlag && props.padding ? `padding: ${props.padding};` : '')}
`;

const ClubLogo = styled.img<{ isFlag?: boolean; awayTeam?: boolean; isHighlighted?: boolean }>`
    position: absolute;
    ${(props) => (props.isFlag ? 'object-fit: cover;' : '')}
    ${(props) => (props.isFlag ? 'border-radius: 50%;' : '')}
    height: ${(props) => (props.isFlag ? '25px' : '27px')};
    width: ${(props) => (props.isFlag ? '25px' : '27px')};
    ${(props) => (props.awayTeam ? `margin-left: ${props.isFlag ? '23' : '16'}px;` : '')}
    z-index: ${(props) => (props.awayTeam ? '1' : '2')};
    opacity: ${(props) => (props.isHighlighted ? '1' : '0.4')};
`;

export default MatchLogos;
