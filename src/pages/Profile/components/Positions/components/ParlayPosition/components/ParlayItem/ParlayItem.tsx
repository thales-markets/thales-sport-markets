import PositionSymbol from 'components/PositionSymbol';
import React, { useEffect, useState } from 'react';
import { PositionData, SportMarketInfo } from 'types/markets';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { convertPositionNameToPositionType, formatMarketOdds, getSpreadTotalText, getSymbolText } from 'utils/markets';
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
import { Position } from 'constants/options';

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

    const positionEnum = convertPositionNameToPositionType(position ? position.side : '');

    const isHomeWinner = market.isResolved ? market.finalResult == 1 : positionEnum === Position.HOME;
    const isAwayWinner = market.isResolved ? market.finalResult == 2 : positionEnum === Position.AWAY;

    const parlayItemQuote = market.isCanceled ? 1 : quote ? quote : 0;
    const parlayStatus = getParlayItemStatus(market);

    const symbolText = getSymbolText(positionEnum, market.betType);
    const spreadTotalText = getSpreadTotalText(market.betType, market.spread, market.total);

    return (
        <Wrapper>
            <MatchInfo>
                <MatchLogo>
                    <ClubLogo
                        alt={market.homeTeam}
                        src={homeLogoSrc}
                        isFlag={market.tags[0] == 9018}
                        losingTeam={isAwayWinner}
                        onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                        customMobileSize={'35px'}
                    />
                    <ClubLogo
                        awayTeam={true}
                        alt={market.awayTeam}
                        src={awayLogoSrc}
                        isFlag={market.tags[0] == 9018}
                        losingTeam={isHomeWinner}
                        onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                        customMobileSize={'35px'}
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
                    symbolBottomText={{
                        text: formatMarketOdds(selectedOddsType, parlayItemQuote),
                        textStyle: {
                            marginLeft: '10px',
                        },
                    }}
                    symbolText={symbolText}
                    symbolUpperText={
                        spreadTotalText
                            ? {
                                  text: spreadTotalText,
                                  textStyle: {
                                      backgroundColor: '#2f3454',
                                      fontSize: '11px',
                                      top: '-8px',
                                  },
                              }
                            : undefined
                    }
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
