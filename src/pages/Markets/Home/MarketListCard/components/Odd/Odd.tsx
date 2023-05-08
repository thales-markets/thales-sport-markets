import PositionSymbol from 'components/PositionSymbol';
import { Position } from 'constants/options';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getParlay, removeFromParlay, updateParlay } from 'redux/modules/parlay';
import { ParlaysMarketPosition, SportMarketInfo } from 'types/markets';
import {
    formatMarketOdds,
    getFormattedBonus,
    getOddTooltipText,
    getParentMarketAddress,
    getSymbolText,
    hasBonus,
} from 'utils/markets';
import { getOddsType } from '../../../../../../redux/modules/ui';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { MAIN_COLORS } from 'constants/ui';
import { getIsMobile } from 'redux/modules/app';
import { toast } from 'react-toastify';
import { oddToastOptions } from 'config/toast';

type OddProps = {
    market: SportMarketInfo;
    position: Position;
    odd: number | undefined;
    bonus: number | undefined;
    isShownInSecondRow?: boolean;
};

const Odd: React.FC<OddProps> = ({ market, position, odd, bonus, isShownInSecondRow }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { trackEvent } = useMatomo();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector(getIsMobile);
    const parlay = useSelector(getParlay);
    const addedToParlay = parlay.filter((game: any) => game.sportMarketAddress == market.address)[0];
    const isAddedToParlay =
        addedToParlay &&
        addedToParlay.position == position &&
        addedToParlay.doubleChanceMarketType === market.doubleChanceMarketType;

    const noOdd = !odd || odd == 0;
    const showBonus = hasBonus(bonus) && !noOdd;

    const oddTooltipText = getOddTooltipText(position, market);

    const onClick = () => {
        if (noOdd) return;
        if (isAddedToParlay) {
            dispatch(removeFromParlay(market.address));
        } else {
            trackEvent({
                category: 'position',
                action: showBonus ? 'discount' : 'non-discount',
                value: showBonus ? Number(bonus) : 0,
            });
            const parlayMarket: ParlaysMarketPosition = {
                parentMarket: getParentMarketAddress(market.parentMarket, market.address),
                sportMarketAddress: market.address,
                position: position,
                homeTeam: market.homeTeam || '',
                awayTeam: market.awayTeam || '',
                doubleChanceMarketType: market.doubleChanceMarketType,
            };
            dispatch(updateParlay(parlayMarket));
            if (isMobile) {
                toast(oddTooltipText, oddToastOptions);
            }
        }
    };

    return (
        <PositionSymbol
            symbolAdditionalText={{
                text: formatMarketOdds(selectedOddsType, odd),
                tooltip: noOdd ? t('markets.zero-odds-tooltip') : undefined,
            }}
            symbolUpperText={
                showBonus
                    ? {
                          text: getFormattedBonus(bonus),
                          textStyle: {
                              color: MAIN_COLORS.BONUS,
                              backgroundColor: isShownInSecondRow ? MAIN_COLORS.GRAY : MAIN_COLORS.LIGHT_GRAY,
                          },
                      }
                    : undefined
            }
            disabled={noOdd}
            flexDirection="column"
            symbolText={getSymbolText(position, market)}
            onClick={onClick}
            selected={isAddedToParlay}
            tooltip={!isMobile && <>{oddTooltipText}</>}
        />
    );
};

export default Odd;
