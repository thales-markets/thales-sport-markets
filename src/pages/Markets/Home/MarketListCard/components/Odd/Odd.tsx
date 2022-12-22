import PositionSymbol from 'components/PositionSymbol';
import { Position } from 'constants/options';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getParlay, removeFromParlay, updateParlay } from 'redux/modules/parlay';
import { ParlaysMarketPosition, SportMarketInfo } from 'types/markets';
import {
    formatMarketOdds,
    getParentMarketAddress,
    getSpreadTotalText,
    getSymbolText,
    isDiscounted,
} from 'utils/markets';
import { getOddsType } from '../../../../../../redux/modules/ui';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { MAIN_COLORS } from 'constants/ui';
import { getIsMobile } from 'redux/modules/app';
import { BetType } from 'constants/tags';

type OddProps = {
    market: SportMarketInfo;
    position: Position;
    odd: number | undefined;
    priceImpact: number | undefined;
};

const Odd: React.FC<OddProps> = ({ market, position, odd, priceImpact }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { trackEvent } = useMatomo();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector(getIsMobile);
    const parlay = useSelector(getParlay);
    const addedToParlay = parlay.filter((game: any) => game.sportMarketAddress == market.address)[0];
    const isAddedToParlay = addedToParlay && addedToParlay.position == position;
    const discount = isDiscounted(priceImpact) && priceImpact ? Math.ceil(Math.abs(priceImpact)) : undefined;
    const noOdd = !odd || odd == 0;
    const isMainMarket = market.betType === BetType.WINNER;

    const onClick = () => {
        if (noOdd) return;
        if (isAddedToParlay) {
            dispatch(removeFromParlay(market.address));
        } else {
            trackEvent({
                category: 'position',
                action: discount ? 'discount' : 'non-discount',
                value: discount ? discount : 0,
            });
            const parlayMarket: ParlaysMarketPosition = {
                parentMarket: getParentMarketAddress(market.parentMarket, market.address),
                sportMarketAddress: market.address,
                position: position,
                homeTeam: market.homeTeam || '',
                awayTeam: market.awayTeam || '',
            };
            dispatch(updateParlay(parlayMarket));
        }
    };

    const getTooltipText = (
        position: Position,
        betType: BetType,
        total: number,
        spread: number,
        homeTeam: string,
        awayTeam: string
    ) => {
        const spreadTotalText = getSpreadTotalText(betType, spread, total);

        switch (position) {
            case Position.HOME:
                switch (Number(betType)) {
                    case BetType.SPREAD:
                        if (Number(spread) < 0) {
                            return t('markets.market-card.odd-tooltip.spread.minus', {
                                team: homeTeam,
                                spread: -Number(spreadTotalText),
                            });
                        }
                        return t('markets.market-card.odd-tooltip.spread.plus', {
                            team: homeTeam,
                            spread: spreadTotalText,
                        });
                    case BetType.TOTAL:
                        return t('markets.market-card.odd-tooltip.total.over', {
                            team: homeTeam,
                            total: spreadTotalText,
                        });
                    default:
                        return t('markets.market-card.odd-tooltip.winner', {
                            team: homeTeam,
                            spread: spreadTotalText,
                        });
                }
            case Position.AWAY:
                switch (Number(betType)) {
                    case BetType.SPREAD:
                        if (Number(spread) < 0) {
                            return t('markets.market-card.odd-tooltip.spread.plus', {
                                team: awayTeam,
                                spread: -Number(spreadTotalText),
                            });
                        }
                        return t('markets.market-card.odd-tooltip.spread.minus', {
                            team: awayTeam,
                            spread: spreadTotalText,
                        });
                    case BetType.TOTAL:
                        return t('markets.market-card.odd-tooltip.total.under', {
                            team: awayTeam,
                            total: spreadTotalText,
                        });
                    default:
                        return t('markets.market-card.odd-tooltip.winner', {
                            team: awayTeam,
                            spread: spreadTotalText,
                        });
                }
            case Position.DRAW:
                return t('markets.market-card.odd-tooltip.draw');
            default:
                return '';
        }
    };

    return (
        <PositionSymbol
            symbolAdditionalText={{
                text: formatMarketOdds(selectedOddsType, odd),
                tooltip: noOdd ? t('markets.zero-odds-tooltip') : undefined,
            }}
            symbolUpperText={
                discount
                    ? {
                          text: `+${discount}%`,
                          textStyle: {
                              color: MAIN_COLORS.BONUS,
                              backgroundColor: isMobile && !isMainMarket ? MAIN_COLORS.GRAY : MAIN_COLORS.LIGHT_GRAY,
                          },
                      }
                    : undefined
            }
            disabled={noOdd}
            flexDirection="column"
            symbolText={getSymbolText(position, market.betType)}
            onClick={onClick}
            selected={isAddedToParlay}
            tooltip={
                <>
                    {getTooltipText(
                        position,
                        market.betType,
                        market.total,
                        market.spread,
                        market.homeTeam,
                        market.awayTeam
                    )}
                </>
            }
        />
    );
};

export default Odd;
