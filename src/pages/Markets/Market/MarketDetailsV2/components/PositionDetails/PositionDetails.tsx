import Tooltip from 'components/Tooltip';
import { Position } from 'constants/options';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getParlay, removeFromParlay, updateParlay } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import { MarketData, ParlaysMarketPosition } from 'types/markets';
import {
    isDiscounted,
    formatMarketOdds,
    getSymbolText,
    convertFinalResultToResultType,
    getSpreadTotalText,
} from 'utils/markets';
import { Discount, Container, Value } from './styled-components';

type PositionDetailsProps = {
    market: MarketData;
    odd?: number;
    availablePerPosition: { available: number; buyImpactPrice?: number };
    position: Position;
};

const PositionDetails: React.FC<PositionDetailsProps> = ({ market, odd, availablePerPosition, position }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    // Redux states
    const selectedOddsType = useSelector(getOddsType);

    const parlay = useSelector(getParlay);
    const addedToParlay = parlay.filter((game: any) => game.sportMarketAddress == market.address)[0];
    const isAddedToParlay = addedToParlay && addedToParlay.position == position;
    // ------------

    const isGameCancelled = market.cancelled || (!market.gameStarted && market.resolved);
    const isGameResolved = market.gameStarted && market.resolved;
    const isGamePaused = market.paused && !isGameResolved && !isGameCancelled;
    const isGameOpen = !market.resolved && !market.cancelled && !market.paused && !market.gameStarted;

    const showDiscount =
        isGameOpen && !!availablePerPosition.buyImpactPrice && isDiscounted(availablePerPosition.buyImpactPrice);
    const positionDiscount = showDiscount ? Math.ceil(Math.abs(Number(availablePerPosition.buyImpactPrice) * 100)) : 0;

    const disabledPosition = !(odd || 0 > 0) || !isGameOpen;

    const symbolText = getSymbolText(position, market.betType);
    const spreadTotalText = getSpreadTotalText(market.betType, market.spread, market.total);

    return (
        <Container
            disabled={disabledPosition}
            selected={isAddedToParlay}
            isWinner={isGameResolved && convertFinalResultToResultType(market.finalResult) == position}
            onClick={() => {
                if (disabledPosition) return;
                if (isGameResolved) {
                    dispatch(removeFromParlay(market.address));
                } else {
                    const parlayMarket: ParlaysMarketPosition = {
                        parentMarket: market.parentMarket !== '' ? market.parentMarket : market.address,
                        sportMarketAddress: market.address,
                        position: position,
                        homeTeam: market.homeTeam || '',
                        awayTeam: market.awayTeam || '',
                    };
                    dispatch(updateParlay(parlayMarket));
                }
            }}
        >
            <Value>
                {symbolText}
                {spreadTotalText && ` (${spreadTotalText})`}
            </Value>
            {!isGameResolved && (
                <Value>
                    {isGameCancelled
                        ? `- ${t('markets.market-card.canceled')} -`
                        : isGamePaused
                        ? `- ${t('markets.market-card.paused')} -`
                        : formatMarketOdds(selectedOddsType, odd)}
                </Value>
            )}
            {showDiscount && (
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
                    component={<Discount>+{positionDiscount}%</Discount>}
                    iconFontSize={23}
                    marginLeft={2}
                    top={0}
                />
            )}
        </Container>
    );
};

export default PositionDetails;
