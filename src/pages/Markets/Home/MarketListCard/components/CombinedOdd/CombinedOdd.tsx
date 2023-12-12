import PositionSymbol from 'components/PositionSymbol';
import { oddToastOptions } from 'config/toast';
import { CombinedPositionsMatchingCode, Position } from 'enums/markets';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getCombinedPositions, removeCombinedPosition, updateCombinedPositions } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import { useTheme } from 'styled-components';
import { CombinedMarketPosition, SportMarketInfo } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { checkIfCombinedPositionAlreadyInParlay, getCombinedPositionName } from 'utils/combinedMarkets';
import {
    formatMarketOdds,
    getCombinedOddTooltipText,
    getFormattedBonus,
    getParentMarketAddress,
    getSpreadAndTotalTextForCombinedMarket,
    getSymbolText,
    hasBonus,
} from 'utils/markets';

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
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector(getIsMobile);
    const combinedPositions = useSelector(getCombinedPositions);

    const combinedMarketPositionSymbol = getCombinedPositionName(markets, positions);

    const noOdd = !odd || odd == 0;
    const showBonus = hasBonus(bonus) && !noOdd;

    const oddTooltipText = getCombinedOddTooltipText(markets, positions);

    const parentMarketAddress = markets[0].parentMarket !== null ? markets[0].parentMarket : markets[1].parentMarket;

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

    const { matchingCode } = checkIfCombinedPositionAlreadyInParlay(combinedPosition, combinedPositions);

    const isAddedToParlay = matchingCode == CombinedPositionsMatchingCode.SAME_POSITIONS ? true : false;

    const spreadAndTotalValues = getSpreadAndTotalTextForCombinedMarket(markets, positions);
    const spreadAndTotalText = `${spreadAndTotalValues.spread ? spreadAndTotalValues.spread + '/' : ''}${
        spreadAndTotalValues.total ? spreadAndTotalValues.total : ''
    }`;

    const onClick = () => {
        if (noOdd) return;
        if (isAddedToParlay) {
            dispatch(removeCombinedPosition(parentMarketAddress));
        } else {
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
