import { Position } from 'constants/options';
import { BetType, BetTypeNameMap, DoubleChanceMarketType } from 'constants/tags';
import { STATUS_COLOR } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DoubleChanceMarketsInfo, SportMarketInfo } from 'types/markets';
import { getSpreadTotalText, getVisibilityOfDrawOption } from 'utils/markets';
import { Status } from '../MatchStatus/MatchStatus';
import Odd from '../Odd/Odd';
import { Container, OddsContainer, Title } from './styled-components';

type OddsProps = {
    market: SportMarketInfo;
    doubleChanceMarkets?: SportMarketInfo[];
    isShownInSecondRow?: boolean;
};

const Odds: React.FC<OddsProps> = ({ market, doubleChanceMarkets, isShownInSecondRow }) => {
    const { t } = useTranslation();

    const isLive = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const noOdds = market.awayOdds == 0 && market.homeOdds == 0 && !isLive && !isGameResolved && !market.isPaused;
    const showDrawOdds = getVisibilityOfDrawOption(market.tags, market.betType);
    const spreadTotalText = getSpreadTotalText(market, Position.HOME);

    const mappedDoubleChanceMarkets = doubleChanceMarkets
        ? (Object.assign(
              {},
              ...doubleChanceMarkets.map((item) => ({
                  [item.doubleChanceMarketType as DoubleChanceMarketType]: item,
              }))
          ) as DoubleChanceMarketsInfo)
        : undefined;

    return (
        <Container>
            <Title>
                {t(`markets.market-card.bet-type.${BetTypeNameMap[market.betType as BetType]}`)}
                {spreadTotalText && ` ${spreadTotalText}`}
            </Title>
            {noOdds ? (
                <Status color={STATUS_COLOR.COMING_SOON}>{t('markets.market-card.coming-soon')}</Status>
            ) : (
                <OddsContainer>
                    {mappedDoubleChanceMarkets ? (
                        <>
                            <Odd
                                market={mappedDoubleChanceMarkets[DoubleChanceMarketType.HOME_TEAM_NOT_TO_LOSE]}
                                position={Position.HOME}
                                odd={mappedDoubleChanceMarkets[DoubleChanceMarketType.HOME_TEAM_NOT_TO_LOSE].homeOdds}
                                bonus={
                                    mappedDoubleChanceMarkets[DoubleChanceMarketType.HOME_TEAM_NOT_TO_LOSE].homeBonus
                                }
                                isShownInSecondRow={isShownInSecondRow}
                            />
                            <Odd
                                market={mappedDoubleChanceMarkets[DoubleChanceMarketType.NO_DRAW]}
                                position={Position.HOME}
                                odd={mappedDoubleChanceMarkets[DoubleChanceMarketType.NO_DRAW].homeOdds}
                                bonus={mappedDoubleChanceMarkets[DoubleChanceMarketType.NO_DRAW].homeBonus}
                                isShownInSecondRow={isShownInSecondRow}
                            />
                            <Odd
                                market={mappedDoubleChanceMarkets[DoubleChanceMarketType.AWAY_TEAM_NOT_TO_LOSE]}
                                position={Position.HOME}
                                odd={mappedDoubleChanceMarkets[DoubleChanceMarketType.AWAY_TEAM_NOT_TO_LOSE].homeOdds}
                                bonus={
                                    mappedDoubleChanceMarkets[DoubleChanceMarketType.AWAY_TEAM_NOT_TO_LOSE].homeBonus
                                }
                                isShownInSecondRow={isShownInSecondRow}
                            />
                        </>
                    ) : (
                        <>
                            <Odd
                                market={market}
                                position={Position.HOME}
                                odd={market.homeOdds}
                                bonus={market.homeBonus}
                                isShownInSecondRow={isShownInSecondRow}
                            />
                            {showDrawOdds && (
                                <Odd
                                    market={market}
                                    position={Position.DRAW}
                                    odd={market.drawOdds}
                                    bonus={market.drawBonus}
                                    isShownInSecondRow={isShownInSecondRow}
                                />
                            )}
                            <Odd
                                market={market}
                                position={Position.AWAY}
                                odd={market.awayOdds}
                                bonus={market.awayBonus}
                                isShownInSecondRow={isShownInSecondRow}
                            />
                        </>
                    )}
                </OddsContainer>
            )}
        </Container>
    );
};

export default Odds;
