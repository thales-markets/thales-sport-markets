import PositionSymbol from 'components/PositionSymbol';
import { Position } from 'constants/options';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getParlay, removeFromParlay, updateParlay } from 'redux/modules/parlay';
import { ParlaysMarketPosition, SportMarketInfo } from 'types/markets';
import { formatMarketOdds, getSymbolText, isDiscounted } from 'utils/markets';
import { getOddsType } from '../../../../../../redux/modules/ui';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { MAIN_COLORS } from 'constants/ui';

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
    const parlay = useSelector(getParlay);
    const addedToParlay = parlay.filter((game: any) => game.sportMarketAddress == market.address)[0];
    const isAddedToParlay = addedToParlay && addedToParlay.position == position;
    const discount = isDiscounted(priceImpact) && priceImpact ? Math.ceil(Math.abs(priceImpact)) : undefined;
    const disabled = odd == 0;

    const onClick = () => {
        if (disabled) return;
        if (isAddedToParlay) {
            dispatch(removeFromParlay(market.address));
        } else {
            trackEvent({
                category: 'position',
                action: discount ? 'discount' : 'non-discount',
                value: discount ? discount : 0,
            });
            const parlayMarket: ParlaysMarketPosition = {
                parentMarket: market.parentMarket !== null ? market.parentMarket : market.address,
                sportMarketAddress: market.address,
                position: position,
                homeTeam: market.homeTeam || '',
                awayTeam: market.awayTeam || '',
            };
            dispatch(updateParlay(parlayMarket));
        }
    };

    return (
        <PositionSymbol
            symbolBottomText={{
                text: formatMarketOdds(selectedOddsType, odd),
                tooltip: odd == 0 ? t('markets.zero-odds-tooltip') : undefined,
            }}
            symbolUpperText={
                discount
                    ? {
                          text: `+${discount}%`,
                          textStyle: {
                              color: MAIN_COLORS.BONUS,
                          },
                      }
                    : undefined
            }
            disabled={disabled}
            flexDirection="column"
            symbolText={getSymbolText(position, market.betType)}
            onClick={onClick}
            selected={isAddedToParlay}
        />
    );
};

export default Odd;
