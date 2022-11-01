import PositionSymbol from 'components/PositionSymbol';
import { ODDS_COLOR } from 'constants/ui';
import React, { useEffect, useState } from 'react';
import { Position } from 'constants/options';
import { PositionData, SportMarketInfo } from 'types/markets';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import {
    convertPositionNameToPositionType,
    convertPositionToSymbolType,
    formatMarketOdds,
    getIsApexTopGame,
} from 'utils/markets';
import {
    ClubLogo,
    ClubName,
    MatchInfo,
    MatchLabel,
    MatchLogo,
    ParlayStatus,
    Wrapper,
    ParlayItemStatusContainer,
} from './styled-components';
import { useSelector } from 'react-redux';
import { getOddsType } from 'redux/modules/ui';
import { t } from 'i18next';
import { formatDateWithTime } from 'utils/formatters/date';

const ParlayItem: React.FC<{ market: SportMarketInfo; position: PositionData | undefined; quote: number }> = ({
    market,
    position,
    quote,
}) => {
    const selectedOddsType = useSelector(getOddsType);

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    const isHomeWinner = market.isResolved && market.finalResult == 1 ? true : undefined;
    const isAwayWinner = market.isResolved && market.finalResult == 2 ? true : undefined;

    const positionEnum = convertPositionNameToPositionType(position ? position.side : '');

    const parlayItemQuote = market.isCanceled ? 1 : quote ? quote : 0;
    const parlayStatus = getParlayItemStatus(market);

    const getPositionColor = (position: Position): string => {
        return position === Position.HOME
            ? ODDS_COLOR.HOME
            : position === Position.AWAY
            ? ODDS_COLOR.AWAY
            : ODDS_COLOR.DRAW;
    };

    return (
        <Wrapper>
            <MatchInfo>
                <MatchLogo>
                    <ClubLogo
                        alt={market.homeTeam}
                        src={homeLogoSrc}
                        losingTeam={isAwayWinner == true ? true : undefined}
                        onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                    />
                    <ClubLogo
                        awayTeam={true}
                        alt={market.awayTeam}
                        src={awayLogoSrc}
                        losingTeam={isHomeWinner == true ? true : undefined}
                        onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                    />
                </MatchLogo>
                <MatchLabel>
                    <ClubName>{market.homeTeam}</ClubName>
                    <ClubName>{' VS '}</ClubName>
                    <ClubName>{market.awayTeam}</ClubName>
                </MatchLabel>
            </MatchInfo>
            <ParlayItemStatusContainer>
                <PositionSymbol
                    type={convertPositionToSymbolType(positionEnum, getIsApexTopGame(market.isApex, market.betType))}
                    symbolColor={getPositionColor(positionEnum)}
                    additionalText={{
                        firstText: formatMarketOdds(selectedOddsType, parlayItemQuote),
                        firstTextStyle: {
                            fontSize: '12px',
                            color: getPositionColor(positionEnum),
                            marginLeft: '5px',
                        },
                    }}
                />
                <ParlayStatus>{parlayStatus}</ParlayStatus>
            </ParlayItemStatusContainer>
        </Wrapper>
    );
};

const getParlayItemStatus = (market: SportMarketInfo) => {
    if (market.isCanceled) return t('profile.card.canceled');
    if (market.isResolved) return `${market.homeScore} : ${market.awayScore}`;
    return formatDateWithTime(market.maturityDate);
};

export default ParlayItem;
