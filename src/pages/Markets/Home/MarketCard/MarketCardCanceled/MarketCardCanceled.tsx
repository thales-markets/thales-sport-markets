import {
    BetTypeInfo,
    MarketInfoContainer,
    MatchDate,
    MatchInfo,
    MatchInfoColumn,
    MatchInfoLabel,
    MatchParticipantImage,
    MatchParticipantImageContainer,
    MatchParticipantName,
    MatchVSLabel,
} from 'components/common';
import Tags from 'pages/Markets/components/Tags';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SportMarketInfo } from 'types/markets';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { getIsApexTopGame, isApexGame, isMlsGame } from '../../../../../utils/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import Tooltip from 'components/Tooltip';
import { ApexBetTypeKeyMapping } from 'constants/markets';

type MarketCardCanceledProps = {
    market: SportMarketInfo;
};

const MarketCardCanceled: React.FC<MarketCardCanceledProps> = ({ market }) => {
    const { t } = useTranslation();
    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    const isApexTopGame = getIsApexTopGame(market.isApex, market.betType);

    return (
        <MatchInfo>
            <MatchInfoColumn>
                <MatchParticipantImageContainer isCanceled={true}>
                    <MatchParticipantImage
                        alt="Home team logo"
                        src={homeLogoSrc}
                        onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                    />
                </MatchParticipantImageContainer>
                <MatchParticipantName>{market.homeTeam}</MatchParticipantName>
            </MatchInfoColumn>
            <MatchInfoColumn>
                <MarketInfoContainer marginTop={isApexTopGame ? 20 : 0}>
                    <MatchDate>{formatDateWithTime(market.maturityDate)}</MatchDate>
                    <MatchInfoLabel isCanceledMarket={true} isPaused={market.isPaused}>
                        {market.isPaused ? t('markets.market-card.paused') : t('markets.market-card.canceled')}
                    </MatchInfoLabel>
                </MarketInfoContainer>
                {isApexTopGame ? (
                    <BetTypeInfo>
                        {t(`common.top-bet-type-title`, {
                            driver: market.homeTeam,
                            betType: t(`common.${ApexBetTypeKeyMapping[market.betType]}`),
                            race: market.leagueRaceName,
                        })}
                    </BetTypeInfo>
                ) : (
                    <MatchVSLabel>
                        {t('markets.market-card.vs')}
                        {isApexGame(market.tags[0]) && (
                            <Tooltip overlay={t(`common.h2h-tooltip`)} iconFontSize={22} marginLeft={2} />
                        )}
                        {isMlsGame(market.tags[0]) && (
                            <Tooltip overlay={t(`common.mls-tooltip`)} iconFontSize={22} marginLeft={2} />
                        )}
                    </MatchVSLabel>
                )}
                <Tags sport={market.sport} tags={market.tags} />
            </MatchInfoColumn>
            {!isApexTopGame && (
                <MatchInfoColumn>
                    <MatchParticipantImageContainer isCanceled={true}>
                        <MatchParticipantImage
                            alt="Away team logo"
                            src={awayLogoSrc}
                            onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                        />
                    </MatchParticipantImageContainer>
                    <MatchParticipantName>{market.awayTeam}</MatchParticipantName>
                </MatchInfoColumn>
            )}
        </MatchInfo>
    );
};

export default MarketCardCanceled;
