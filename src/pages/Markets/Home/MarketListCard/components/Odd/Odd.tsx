import PositionSymbol from 'components/PositionSymbol';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getParlay, removeCombinedMarketFromParlay, removeFromParlay, updateParlay } from 'redux/modules/parlay';
import { ParlaysMarketPosition, SportMarketInfo } from 'types/markets';
import {
    formatMarketOdds,
    getFormattedBonus,
    getOddTooltipText,
    getParentMarketAddress,
    getSymbolText,
    hasBonus,
} from 'utils/markets';
import { isMarketPartOfCombinedMarketFromParlayData } from 'utils/combinedMarkets';
import { getOddsType } from 'redux/modules/ui';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { getIsMobile } from 'redux/modules/app';
import { toast } from 'react-toastify';
import { oddToastOptions } from 'config/toast';
import { Position } from 'enums/markets';
import { ThemeInterface } from 'types/ui';
import { useTheme } from 'styled-components';

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
    const theme: ThemeInterface = useTheme();
    const { trackEvent } = useMatomo();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector(getIsMobile);
    const parlay = useSelector(getParlay);
    const addedToParlay = parlay.filter((game: any) => game.sportMarketAddress == market.address)[0];

    const isMarketPartOfCombinedMarket = isMarketPartOfCombinedMarketFromParlayData(parlay, market);

    const parentMarketAddress = market.parentMarket !== null ? market.parentMarket : market.address;
    const isParentMarketAddressInParlayData = parlay.filter((data) => data.parentMarket == parentMarketAddress);

    const isAddedToParlay =
        addedToParlay &&
        addedToParlay.position == position &&
        addedToParlay.doubleChanceMarketType === market.doubleChanceMarketType &&
        !isMarketPartOfCombinedMarket;
    const noOdd = !odd || odd == 0;
    const showBonus = hasBonus(bonus) && !noOdd;

    const oddTooltipText = getOddTooltipText(position, market);

    const onClick = () => {
        if (noOdd) return;
        if (isParentMarketAddressInParlayData) {
            dispatch(removeCombinedMarketFromParlay(parentMarketAddress));
        }
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
                tags: market.tags,
                doubleChanceMarketType: market.doubleChanceMarketType,
                isOneSideMarket: market.isOneSideMarket,
                tag: market.tags[0],
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
                              color: theme.status.win,
                              backgroundColor: isShownInSecondRow
                                  ? theme.oddsContainerBackground.secondary
                                  : theme.oddsContainerBackground.primary,
                          },
                      }
                    : undefined
            }
            disabled={noOdd}
            flexDirection="column"
            symbolText={getSymbolText(position, market)}
            additionalStyle={market.isOneSideMarket ? { fontSize: 11 } : {}}
            onClick={onClick}
            selected={isAddedToParlay}
            tooltip={!isMobile && <>{oddTooltipText}</>}
        />
    );
};

export default Odd;
