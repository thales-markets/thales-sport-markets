import Tooltip from 'components/Tooltip';
import { Position, Side } from 'constants/options';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getParlay, removeFromParlay, updateParlay } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import { AvailablePerSide, MarketData, ParlaysMarketPosition } from 'types/markets';
import { isDiscounted, formatMarketOdds } from 'utils/markets';
import { Discount, TeamOptionContainer, Value } from './styled-components';

type PositionDetailsProps = {
    market: MarketData;
    selectedSide: Side;
    availablePerSide: AvailablePerSide;
    position: Position;
    selectedPosition: Position;
    setSelectedPosition: (index: number) => void;
};

const PositionDetails: React.FC<PositionDetailsProps> = ({
    market,
    selectedSide,
    availablePerSide,
    selectedPosition,
    setSelectedPosition,
    position,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    // Redux states
    const selectedOddsType = useSelector(getOddsType);

    const parlay = useSelector(getParlay);
    const addedToParlay = parlay.filter((game: any) => game.sportMarketId == market.gameDetails.gameId)[0];
    // ------------

    // @ts-ignore
    const disabledPosition = !(market.positions[position].sides[selectedSide].odd > 0);

    const showPositionDiscount =
        !!availablePerSide.positions[position].buyImpactPrice &&
        isDiscounted(availablePerSide.positions[position].buyImpactPrice);

    const positionDiscount = showPositionDiscount
        ? Math.ceil(Math.abs(Number(availablePerSide.positions[position].buyImpactPrice) * 100))
        : 0;

    return (
        <TeamOptionContainer
            disabled={disabledPosition}
            selected={selectedPosition == position}
            onClick={() => {
                if (!disabledPosition) {
                    setSelectedPosition(position);
                    if (addedToParlay && addedToParlay.position == position) {
                        dispatch(removeFromParlay(market.gameDetails.gameId));
                    } else {
                        const parlayMarket: ParlaysMarketPosition = {
                            sportMarketId: market.gameDetails.gameId,
                            position: position,
                            homeTeam: market.homeTeam || '',
                            awayTeam: market.awayTeam || '',
                        };
                        dispatch(updateParlay(parlayMarket));
                    }
                }
            }}
        >
            <Value>{position}</Value>
            <Value>{formatMarketOdds(selectedOddsType, market.positions[position].sides[selectedSide].odd)}</Value>
            {showPositionDiscount && (
                <Tooltip
                    overlay={
                        <span>
                            {t(`markets.discounted-per`)}{' '}
                            <a
                                href="https://github.com/thales-markets/thales-improvement-proposals/blob/main/TIPs/TIP-95.md"
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                            >
                                TIP-95
                            </a>
                        </span>
                    }
                    component={
                        <Discount>
                            <span>+{positionDiscount}%</span>
                        </Discount>
                    }
                    iconFontSize={23}
                    marginLeft={2}
                    top={0}
                />
            )}
        </TeamOptionContainer>
    );
};

export default PositionDetails;
