import PositionSymbol from 'components/PositionSymbol';
import { Position } from 'constants/options';
import { ODDS_COLOR } from 'constants/ui';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromParlay } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { ParlaysMarket } from 'types/markets';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { convertPositionToSymbolType, formatMarketOdds, getIsApexTopGame, getPositionOdds } from 'utils/markets';
import { XButton } from '../styled-components';

type MatchInfoProps = { market: ParlaysMarket };

const MatchInfo: React.FC<MatchInfoProps> = ({ market }) => {
    const dispatch = useDispatch();
    const selectedOddsType = useSelector(getOddsType);

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    const getPositionColor = (position: Position): string => {
        return position === Position.HOME
            ? ODDS_COLOR.HOME
            : position === Position.AWAY
            ? ODDS_COLOR.AWAY
            : ODDS_COLOR.DRAW;
    };

    return (
        <>
            <MatchLogo isFlag={market.tags[0] == 9018}>
                <ClubLogo
                    alt="Home team logo"
                    src={homeLogoSrc}
                    isFlag={market.tags[0] == 9018}
                    onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                />
                <ClubLogo
                    awayTeam={true}
                    alt="Away team logo"
                    src={awayLogoSrc}
                    isFlag={market.tags[0] == 9018}
                    onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                />
            </MatchLogo>
            <MatchLabel>
                <ClubName>{market.homeTeam}</ClubName>
                <ClubName>{market.awayTeam}</ClubName>
            </MatchLabel>
            <PositionSymbol
                type={convertPositionToSymbolType(market.position, getIsApexTopGame(market.isApex, market.betType))}
                symbolColor={getPositionColor(market.position)}
                additionalText={{
                    firstText: formatMarketOdds(selectedOddsType, getPositionOdds(market)),
                    firstTextStyle: {
                        fontSize: '11px',
                        color: getPositionColor(market.position),
                        marginLeft: '5px',
                    },
                }}
            />
            <XButton
                onClick={() => {
                    dispatch(removeFromParlay(market.id));
                }}
                className={`icon icon--cross-button`}
            />
        </>
    );
};

const MatchLogo = styled.div<{ isFlag?: boolean }>`
    display: flex;
    position: relative;
    align-items: center;
    width: 120px;
    height: 100%;
    ${(props) => (props?.isFlag ? 'padding-left: 4px;' : '')}
`;

const ClubLogo = styled.img<{ isFlag?: boolean; awayTeam?: boolean }>`
    position: absolute;
    ${(props) => (props?.isFlag ? 'object-fit: cover;' : '')}
    ${(props) => (props?.isFlag ? 'border-radius: 50%;' : '')}
    height: ${(props) => (props?.isFlag ? '25px' : '35px')};
    width: ${(props) => (props?.isFlag ? '25px' : '35px')};
    ${(props) => (props?.awayTeam ? `margin-left: ${props.isFlag ? '23' : '20'}px;` : '')}
    z-index: ${(props) => (props?.awayTeam ? '1' : '2')};
`;

const MatchLabel = styled.div`
    display: block;
    width: 100%;
    margin-right: 5px;
`;

const ClubName = styled.span`
    display: block;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 300;
    font-size: 10px;
    line-height: 11px;
    text-transform: uppercase;
    color: #ffffff;
`;

export default MatchInfo;
