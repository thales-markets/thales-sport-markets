import PositionSymbol from 'components/PositionSymbol';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getCombinedPositions, getParlay, removeCombinedPosition, updateCombinedPositions } from 'redux/modules/parlay';
import { CombinedMarketPosition, SportMarketInfo } from 'types/markets';
import {
    formatMarketOdds,
    getCombinedOddTooltipText,
    getFormattedBonus,
    getParentMarketAddress,
    getSpreadAndTotalTextForCombinedMarket,
    getSymbolText,
    hasBonus,
} from 'utils/markets';
import { compareCombinedPositionsFromParlayData, getCombinedPositionName } from 'utils/combinedMarkets';
import { getOddsType } from 'redux/modules/ui';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { getIsMobile } from 'redux/modules/app';
import { toast } from 'react-toastify';
import { oddToastOptions } from 'config/toast';
import { CombinedPositionsMatchingCode, Position } from 'enums/markets';
import { ThemeInterface } from 'types/ui';
import { useTheme } from 'styled-components';

type CombinedMarketOddsProps = {
    markets: SportMarketInfo[];
    positions: Position[];
    odd: number | undefined;
    bonus: number | undefined;
    isShownInSecondRow?: boolean;
};

const CombinedOdd: React.FC<CombinedMarketOddsProps> = ({ markets, positions, odd, bonus, isShownInSecondRow }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();
    const { trackEvent } = useMatomo();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector(getIsMobile);
    const combinedPositions = useSelector(getCombinedPositions);
    const parlay = useSelector(getParlay);

    const combinedMarketPositionSymbol = getCombinedPositionName(markets, positions);

    const noOdd = !odd || odd == 0;
    const showBonus = hasBonus(bonus) && !noOdd;

    const oddTooltipText = getCombinedOddTooltipText(markets, positions);

    const parentMarketAddress = markets[0].parentMarket !== null ? markets[0].parentMarket : markets[1].parentMarket;

    const isParentMarketAddressInParlayData =
        !!parlay.find((data) => data.parentMarket == parentMarketAddress) ||
        !!combinedPositions.find((item) => item.markets.find((market) => market.parentMarket == parentMarketAddress));

    const combinedPosition: CombinedMarketPosition = {
        markets: markets.map((market, index) => {
            return {
                parentMarket: getParentMarketAddress(market.parentMarket, market.address),
                sportMarketAddress: market.address,
                betType: market.betType,
                position: positions[index],
                homeTeam: market.homeTeam || '',
                awayTeam: market.awayTeam || '',
                doubleChanceMarketType: null,
                tags: market.tags,
            };
        }),
        totalOdd: odd ? odd : 0,
        totalBonus: bonus,
        positionName: combinedMarketPositionSymbol || '',
    };

    const isAddedToParlay = combinedPositions.find(
        (item) =>
            compareCombinedPositionsFromParlayData(item, combinedPosition) ==
            CombinedPositionsMatchingCode.SAME_POSITIONS
    )
        ? true
        : false;

    const spreadAndTotalValues = getSpreadAndTotalTextForCombinedMarket(markets, positions);
    const spreadAndTotalText = `${spreadAndTotalValues.spread ? spreadAndTotalValues.spread + '/' : ''}${
        spreadAndTotalValues.total ? spreadAndTotalValues.total : ''
    }`;

    const onClick = () => {
        if (noOdd) return;
        if (isAddedToParlay || isParentMarketAddressInParlayData) {
            dispatch(removeCombinedPosition(parentMarketAddress));
            dispatch(updateCombinedPositions(combinedPosition));
        } else {
            trackEvent({
                category: 'position',
                action: 'combined',
                value: showBonus ? Number(bonus) : 0,
            });
            dispatch(updateCombinedPositions(combinedPosition));
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
                    : {
                          text: spreadAndTotalText,
                          textStyle: {
                              top: '-9px',
                              backgroundColor: isShownInSecondRow
                                  ? theme.oddsContainerBackground.secondary
                                  : theme.oddsContainerBackground.primary,
                          },
                      }
            }
            disabled={noOdd}
            flexDirection="column"
            symbolText={getSymbolText(
                positions[0],
                markets[0],
                combinedMarketPositionSymbol ? combinedMarketPositionSymbol : undefined
            )}
            onClick={onClick}
            selected={isAddedToParlay}
            tooltip={!isMobile && <>{oddTooltipText}</>}
        />
    );
};

export default CombinedOdd;
