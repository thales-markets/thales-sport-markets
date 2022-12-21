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
    getParentMarketAddress,
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
    const isGameResolved = market.resolved || market.cancelled;
    const isGameRegularlyResolved = market.resolved && !market.cancelled;
    const isPendingResolution = market.gameStarted && !isGameResolved;
    const isGamePaused = market.paused && !isGameResolved;
    const isGameOpen = !market.resolved && !market.cancelled && !market.paused && !market.gameStarted;

    const showDiscount =
        isGameOpen && !!availablePerPosition.buyImpactPrice && isDiscounted(availablePerPosition.buyImpactPrice);
    const positionDiscount = showDiscount ? Math.ceil(Math.abs(Number(availablePerPosition.buyImpactPrice) * 100)) : 0;

    const noOdd = !odd || odd == 0;
    const disabledPosition = noOdd || !isGameOpen;

    const symbolText = getSymbolText(position, market.betType);
    const spreadTotalText = getSpreadTotalText(market.betType, market.spread, market.total);

    return (
        <Container
            disabled={disabledPosition}
            selected={isAddedToParlay}
            isWinner={isGameRegularlyResolved && convertFinalResultToResultType(market.finalResult) == position}
            onClick={() => {
                if (disabledPosition) return;
                if (isAddedToParlay) {
                    dispatch(removeFromParlay(market.address));
                } else {
                    const parlayMarket: ParlaysMarketPosition = {
                        parentMarket: getParentMarketAddress(market.parentMarket, market.address),
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
            {!isGameRegularlyResolved && (
                <Value>
                    {isPendingResolution ? (
                        `- ${t('markets.market-card.pending')} -`
                    ) : isGameCancelled ? (
                        `- ${t('markets.market-card.canceled')} -`
                    ) : isGamePaused ? (
                        `- ${t('markets.market-card.paused')} -`
                    ) : (
                        <>
                            {formatMarketOdds(selectedOddsType, odd)}
                            {noOdd && (
                                <Tooltip
                                    overlay={<>{t('markets.zero-odds-tooltip')}</>}
                                    iconFontSize={13}
                                    marginLeft={3}
                                />
                            )}
                        </>
                    )}
                </Value>
            )}
            {showDiscount && <Discount>+{positionDiscount}%</Discount>}
        </Container>
    );
};

export default PositionDetails;
