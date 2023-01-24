import PositionSymbol from 'components/PositionSymbol';
import React, { useEffect, useState } from 'react';
import { PositionData, SportMarketInfo } from 'types/markets';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import {
    convertPositionNameToPositionType,
    formatMarketOdds,
    getOddTooltipText,
    getSpreadTotalText,
    getSymbolText,
} from 'utils/markets';
import { ClubLogo, ClubName, MatchInfo, MatchLabel, MatchLogo, StatusContainer } from '../../../../styled-components';
import { Wrapper, ParlayStatus } from './styled-components';
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

    const positionEnum = convertPositionNameToPositionType(position ? position.side : '');

    const parlayItemQuote = market.isCanceled ? 1 : quote ? quote : 0;
    const parlayStatus = getParlayItemStatus(market);

    const symbolText = getSymbolText(positionEnum, market);
    const spreadTotalText = getSpreadTotalText(market, positionEnum);

    return (
        <Wrapper style={{ opacity: market.isCanceled ? 0.5 : 1 }}>
            <MatchInfo>
                <MatchLogo>
                    <ClubLogo
                        alt={market.homeTeam}
                        src={homeLogoSrc}
                        isFlag={market.tags[0] == 9018}
                        losingTeam={false}
                        onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                        customMobileSize={'30px'}
                    />
                    <ClubLogo
                        awayTeam={true}
                        alt={market.awayTeam}
                        src={awayLogoSrc}
                        isFlag={market.tags[0] == 9018}
                        losingTeam={false}
                        onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                        customMobileSize={'30px'}
                    />
                </MatchLogo>
                <MatchLabel>
                    <ClubName>{market.homeTeam}</ClubName>
                    <ClubName>{market.awayTeam}</ClubName>
                </MatchLabel>
            </MatchInfo>
            <StatusContainer>
                <PositionSymbol
                    symbolAdditionalText={{
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
                                      top: '-9px',
                                  },
                              }
                            : undefined
                    }
                    tooltip={<>{getOddTooltipText(positionEnum, market)}</>}
                />
                <ParlayStatus>{parlayStatus}</ParlayStatus>
            </StatusContainer>
        </Wrapper>
    );
};

const getParlayItemStatus = (market: SportMarketInfo) => {
    if (market.isCanceled) return t('profile.card.canceled');
    if (market.isResolved) return `${market.homeScore} : ${market.awayScore}`;
    return formatDateWithTime(market.maturityDate);
};

export default ParlayItem;
