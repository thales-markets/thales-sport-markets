import Tooltip from 'components/Tooltip';
import { oddToastOptions } from 'config/toast';
import { MIN_LIQUIDITY } from 'constants/markets';
import { Position } from 'constants/options';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getParlay, removeCombinedMarketFromParlay, removeFromParlay, updateParlay } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import { ParlaysMarketPosition, SportMarketInfo } from 'types/markets';
import { floorNumberToDecimals } from 'utils/formatters/number';
import {
    hasBonus,
    formatMarketOdds,
    getSymbolText,
    convertFinalResultToResultType,
    getSpreadTotalText,
    getParentMarketAddress,
    getOddTooltipText,
    getFormattedBonus,
} from 'utils/markets';
import { isMarketPartOfCombinedMarketFromParlayData } from 'utils/combinedMarkets';
import {
    Bonus,
    Container,
    Text,
    Status,
    TooltipContainer,
    TooltipText,
    TooltipFooter,
    TooltipFooterInfo,
    TooltipFooterInfoContianer,
    TooltipFooterInfoLabel,
    TooltipBonusText,
} from './styled-components';

type PositionDetailsProps = {
    market: SportMarketInfo;
    odd?: number;
    availablePerPosition: { available?: number; buyBonus?: number };
    position: Position;
};

const PositionDetails: React.FC<PositionDetailsProps> = ({ market, odd, availablePerPosition, position }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector(getIsMobile);
    const parlay = useSelector(getParlay);
    const addedToParlay = parlay.filter((game: any) => game.sportMarketAddress == market.address)[0];
    const isMarketPartOfCombinedMarket = isMarketPartOfCombinedMarketFromParlayData(parlay, market);

    const isAddedToParlay =
        addedToParlay &&
        addedToParlay.position == position &&
        addedToParlay.doubleChanceMarketType === market.doubleChanceMarketType &&
        !isMarketPartOfCombinedMarket;

    const isGameCancelled = market.isCanceled || (market.isOpen && market.isResolved);
    const isGameResolved = market.isResolved || market.isCanceled;
    const isGameRegularlyResolved = market.isResolved && !market.isCanceled;
    const isPendingResolution = !market.isOpen && !isGameResolved;
    const isGamePaused = market.isPaused && !isGameResolved;
    const isGameOpen = !market.isResolved && !market.isCanceled && !market.isPaused && market.isOpen;

    const noLiquidity = !!availablePerPosition.available && availablePerPosition.available < MIN_LIQUIDITY;
    const noOdd = !odd || odd == 0;
    const disabledPosition = noOdd || noLiquidity || !isGameOpen;

    const showBonus = isGameOpen && hasBonus(availablePerPosition.buyBonus) && !noOdd;
    const positionBonus = showBonus ? getFormattedBonus(availablePerPosition.buyBonus) : '0';

    const showOdd = isGameOpen && !noLiquidity;
    const showTooltip = showOdd && !isMobile;

    const symbolText = getSymbolText(position, market);
    const spreadTotalText = getSpreadTotalText(market, position);

    const oddTooltipText = getOddTooltipText(position, market);

    const parentMarketAddress = market.parentMarket !== null ? market.parentMarket : market.address;
    const isParentMarketAddressInParlayData = parlay.filter((data) => data.parentMarket == parentMarketAddress);

    const getDetails = () => (
        <Container
            disabled={disabledPosition}
            selected={isAddedToParlay}
            isWinner={isGameRegularlyResolved && convertFinalResultToResultType(market.finalResult) == position}
            onClick={() => {
                if (disabledPosition) return;
                if (isParentMarketAddressInParlayData) {
                    dispatch(removeCombinedMarketFromParlay(parentMarketAddress));
                }
                if (isAddedToParlay) {
                    dispatch(removeFromParlay(market.address));
                } else {
                    const parlayMarket: ParlaysMarketPosition = {
                        parentMarket: getParentMarketAddress(market.parentMarket, market.address),
                        sportMarketAddress: market.address,
                        position: position,
                        homeTeam: market.homeTeam || '',
                        awayTeam: market.awayTeam || '',
                        tags: market.tags,
                        doubleChanceMarketType: market.doubleChanceMarketType,
                    };
                    dispatch(updateParlay(parlayMarket));
                    if (isMobile) {
                        toast(oddTooltipText, oddToastOptions);
                    }
                }
            }}
        >
            <Text>
                {symbolText}
                {spreadTotalText && ` (${spreadTotalText})`}
            </Text>
            {showOdd ? (
                <Text>
                    {formatMarketOdds(selectedOddsType, odd)}
                    {noOdd && (
                        <Tooltip overlay={<>{t('markets.zero-odds-tooltip')}</>} iconFontSize={13} marginLeft={3} />
                    )}
                </Text>
            ) : (
                <Status>
                    {isPendingResolution
                        ? `- ${t('markets.market-card.pending')} -`
                        : isGameCancelled
                        ? `- ${t('markets.market-card.canceled')} -`
                        : isGamePaused
                        ? `- ${t('markets.market-card.paused')} -`
                        : noLiquidity
                        ? `${t('markets.market-card.no-liquidity')}`
                        : null}
                </Status>
            )}
            {showBonus && <Bonus>{positionBonus}</Bonus>}
        </Container>
    );

    const getTooltip = () => (
        <TooltipContainer>
            <TooltipText>{oddTooltipText}</TooltipText>
            {isGameOpen && !isMobile && (
                <>
                    {showBonus && (
                        <TooltipBonusText>
                            {t('markets.market-card.odd-tooltip.bonus', { bonus: positionBonus })}
                        </TooltipBonusText>
                    )}
                    <TooltipFooter>
                        <TooltipFooterInfoContianer>
                            <TooltipFooterInfoLabel>{t('markets.market-details.odds')}:</TooltipFooterInfoLabel>
                            <TooltipFooterInfo>{formatMarketOdds(selectedOddsType, odd)}</TooltipFooterInfo>
                        </TooltipFooterInfoContianer>
                        <TooltipFooterInfoContianer>
                            <TooltipFooterInfoLabel>{t('markets.market-details.liquidity')}:</TooltipFooterInfoLabel>
                            <TooltipFooterInfo>
                                {floorNumberToDecimals(availablePerPosition.available || 0)}
                            </TooltipFooterInfo>
                        </TooltipFooterInfoContianer>
                    </TooltipFooter>
                </>
            )}
        </TooltipContainer>
    );

    return <>{showTooltip ? <Tooltip overlay={getTooltip()} component={getDetails()} /> : getDetails()}</>;
};

export default PositionDetails;
