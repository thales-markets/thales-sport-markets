import {
    ApexMatchInfoColumn,
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
    OddsLabel,
    OddsLabelSceleton,
} from 'components/common';
import Tags from 'pages/Markets/components/Tags';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountPosition, PositionType, SportMarketInfo } from 'types/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { ODDS_COLOR } from '../../../../../constants/ui';
import { useSelector } from 'react-redux';
import { getOddsType } from '../../../../../redux/modules/ui';
import { formatMarketOdds, getIsApexTopGame, isApexGame } from '../../../../../utils/markets';
import Tooltip from 'components/Tooltip';
import { ApexBetTypeKeyMapping } from 'constants/markets';

type MarketCardOpenedProps = {
    market: SportMarketInfo;
    accountPositions?: AccountPosition[];
};

const MarketCardOpened: React.FC<MarketCardOpenedProps> = ({ market, accountPositions }) => {
    const { t } = useTranslation();

    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));
    const selectedOddsType = useSelector(getOddsType);

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    const isApexTopGame = getIsApexTopGame(market.isApex, market.betType);

    return (
        <>
            <MatchInfo>
                <MatchInfoColumn isApexTopGame={isApexTopGame}>
                    <MatchParticipantImageContainer>
                        <MatchParticipantImage
                            alt="Home team logo"
                            src={homeLogoSrc}
                            onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                        />
                    </MatchParticipantImageContainer>
                    {!isApexTopGame && (
                        <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={true}>
                            {formatMarketOdds(selectedOddsType, market.homeOdds)}
                            {market.homeOdds == 0 && market.awayOdds !== 0 && (
                                <Tooltip
                                    overlay={<>{t('markets.zero-odds-tooltip')}</>}
                                    iconFontSize={10}
                                    customIconStyling={{ marginTop: '-5px', display: 'flex', marginLeft: '3px' }}
                                />
                            )}
                        </OddsLabel>
                    )}
                    <MatchParticipantName
                        glowColor={ODDS_COLOR.HOME}
                        glow={
                            accountPositions &&
                            !!accountPositions.find((pos) => pos.amount && pos.side === PositionType.home) &&
                            !isApexTopGame
                        }
                    >
                        {market.homeTeam}
                    </MatchParticipantName>
                </MatchInfoColumn>
                <MatchInfoColumn isApexTopGame={isApexTopGame}>
                    <MarketInfoContainer>
                        <MatchDate>{formatDateWithTime(market.maturityDate)}</MatchDate>
                        {market.isPaused && (
                            <MatchInfoLabel isPaused={market.isPaused}>
                                {t('markets.market-card.paused')}
                            </MatchInfoLabel>
                        )}
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
                        <>
                            <MatchVSLabel>
                                {t('markets.market-card.vs')}
                                {isApexGame(market.tags[0]) && (
                                    <Tooltip overlay={t(`common.h2h-tooltip`)} iconFontSize={22} marginLeft={2} />
                                )}
                            </MatchVSLabel>
                            {!market.isPaused && (
                                <OddsLabel
                                    isTwoPositioned={
                                        market.drawOdds === 0 && !(market.awayOdds == 0 && market.homeOdds == 0)
                                    }
                                    isDraw={true}
                                >
                                    {market.awayOdds == 0 && market.homeOdds == 0
                                        ? t('markets.market-card.coming-soon')
                                        : formatMarketOdds(selectedOddsType, market.drawOdds)}
                                </OddsLabel>
                            )}
                            <MatchParticipantName
                                isTwoPositioned={market.drawOdds === 0}
                                glowColor={ODDS_COLOR.DRAW}
                                glow={
                                    accountPositions &&
                                    !!accountPositions.find((pos) => pos.amount && pos.side === PositionType.draw)
                                }
                            >
                                {t('markets.market-card.draw')}
                            </MatchParticipantName>
                        </>
                    )}
                    <Tags sport={market.sport} tags={market.tags} />
                </MatchInfoColumn>
                {!isApexTopGame && (
                    <MatchInfoColumn isApexTopGame={isApexTopGame}>
                        <MatchParticipantImageContainer>
                            <MatchParticipantImage
                                alt="Away team logo"
                                src={awayLogoSrc}
                                onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                            />
                        </MatchParticipantImageContainer>
                        {market ? (
                            <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={false}>
                                {formatMarketOdds(selectedOddsType, market.awayOdds)}
                                {market.homeOdds !== 0 && market.awayOdds == 0 && (
                                    <Tooltip
                                        overlay={<>{t('markets.zero-odds-tooltip')}</>}
                                        iconFontSize={10}
                                        customIconStyling={{ marginTop: '-5px', display: 'flex', marginLeft: '3px' }}
                                    />
                                )}
                            </OddsLabel>
                        ) : (
                            <OddsLabelSceleton />
                        )}
                        <MatchParticipantName
                            glowColor={ODDS_COLOR.AWAY}
                            glow={
                                accountPositions &&
                                !!accountPositions.find((pos) => pos.amount && pos.side === PositionType.away)
                            }
                        >
                            {market.awayTeam}
                        </MatchParticipantName>
                    </MatchInfoColumn>
                )}
            </MatchInfo>
            {isApexTopGame && (
                <MatchInfo>
                    <ApexMatchInfoColumn>
                        <MatchParticipantName
                            glowColor={ODDS_COLOR.HOME}
                            glow={
                                accountPositions &&
                                !!accountPositions.find((pos) => pos.amount && pos.side === PositionType.home)
                            }
                        >
                            {t('common.yes')}
                        </MatchParticipantName>
                        <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={true}>
                            {formatMarketOdds(selectedOddsType, market.homeOdds)}
                            {market.homeOdds == 0 && market.awayOdds !== 0 && (
                                <Tooltip
                                    overlay={<>{t('markets.zero-odds-tooltip')}</>}
                                    iconFontSize={10}
                                    customIconStyling={{ marginTop: '-5px', display: 'flex', marginLeft: '3px' }}
                                />
                            )}
                        </OddsLabel>
                    </ApexMatchInfoColumn>
                    <ApexMatchInfoColumn>
                        <MatchParticipantName
                            glowColor={ODDS_COLOR.AWAY}
                            glow={
                                accountPositions &&
                                !!accountPositions.find((pos) => pos.amount && pos.side === PositionType.away)
                            }
                        >
                            {t('common.no')}
                        </MatchParticipantName>
                        <OddsLabel noOdds={market.awayOdds == 0 && market.homeOdds == 0} homeOdds={false}>
                            {formatMarketOdds(selectedOddsType, market.awayOdds)}
                            {market.homeOdds !== 0 && market.awayOdds == 0 && (
                                <Tooltip
                                    overlay={<>{t('markets.zero-odds-tooltip')}</>}
                                    iconFontSize={10}
                                    customIconStyling={{ marginTop: '-5px', display: 'flex', marginLeft: '3px' }}
                                />
                            )}
                        </OddsLabel>
                    </ApexMatchInfoColumn>
                </MatchInfo>
            )}
        </>
    );
};

export default MarketCardOpened;
