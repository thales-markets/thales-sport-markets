import PositionSymbol from 'components/PositionSymbol';
import { Position } from 'constants/options';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getParlay, removeCombinedMarketFromParlay, updateParlayWithMultiplePositions } from 'redux/modules/parlay';
import { ParlaysMarketPosition, SportMarketInfo } from 'types/markets';
import {
    formatMarketOdds,
    getCombinedOddTooltipText,
    getFormattedBonus,
    getParentMarketAddress,
    getSpreadAndTotalTextForCombinedMarket,
    getSymbolText,
    hasBonus,
} from 'utils/markets';
import { getCombinedPositionName, isSpecificCombinedPositionAddedToParlay } from 'utils/combinedMarkets';
import { getOddsType } from '../../../../../../redux/modules/ui';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { MAIN_COLORS } from 'constants/ui';
import { getIsMobile } from 'redux/modules/app';
import { toast } from 'react-toastify';
import { oddToastOptions } from 'config/toast';

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
    const { trackEvent } = useMatomo();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector(getIsMobile);
    const parlay = useSelector(getParlay);

    const isAddedToParlay = isSpecificCombinedPositionAddedToParlay(parlay, markets, positions);

    const combinedMarketPositionSymbol = getCombinedPositionName(markets, positions);

    const noOdd = !odd || odd == 0;
    const showBonus = hasBonus(bonus) && !noOdd;

    const oddTooltipText = getCombinedOddTooltipText(markets, positions);

    const parentMarketAddress = markets[0].parentMarket !== null ? markets[0].parentMarket : markets[1].parentMarket;

    const isParentMarketAddressInParlayData = parlay.filter((market) => market.parentMarket == parentMarketAddress);

    const spreadAndTotalValues = getSpreadAndTotalTextForCombinedMarket(markets, positions);
    const spreadAndTotalText = `${spreadAndTotalValues.spread ? spreadAndTotalValues.spread + '/' : ''}${
        spreadAndTotalValues.total ? spreadAndTotalValues.total : ''
    }`;

    const onClick = () => {
        if (noOdd) return;
        if (isParentMarketAddressInParlayData) {
            dispatch(removeCombinedMarketFromParlay(parentMarketAddress));
        }
        if (isAddedToParlay) {
            dispatch(removeCombinedMarketFromParlay(parentMarketAddress));
        } else {
            trackEvent({
                category: 'position',
                action: 'combined',
                value: showBonus ? Number(bonus) : 0,
            });
            const parlayMarkets: ParlaysMarketPosition[] = [];

            markets.forEach((market, index) => {
                return parlayMarkets.push({
                    parentMarket: getParentMarketAddress(market.parentMarket, market.address),
                    sportMarketAddress: market.address,
                    position: positions[index],
                    homeTeam: market.homeTeam || '',
                    awayTeam: market.awayTeam || '',
                    doubleChanceMarketType: null,
                    tags: market.tags,
                });
            });
            dispatch(updateParlayWithMultiplePositions(parlayMarkets));
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
                    : {
                          text: spreadAndTotalText,
                          textStyle: {
                              top: '-9px',
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
