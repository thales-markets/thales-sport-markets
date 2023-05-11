import Tooltip from 'components/Tooltip';
import { oddToastOptions } from 'config/toast';
import { MIN_LIQUIDITY } from 'constants/markets';
import { Position } from 'constants/options';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getParlay, removeCombinedMarketFromParlay, updateParlayWithMultiplePositions } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import { ParlaysMarketPosition, SportMarketInfo } from 'types/markets';
import { floorNumberToDecimals } from 'utils/formatters/number';
import {
    formatMarketOdds,
    getSpreadTotalText,
    getParentMarketAddress,
    getCombinedOddTooltipText,
    getTotalText,
} from 'utils/markets';
import {
    getCombinedPositionName,
    isCombinedMarketWinner,
    isSpecificCombinedPositionAddedToParlay,
} from 'utils/combinedMarkets';
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

type CombinedPositionDetailsProps = {
    markets: SportMarketInfo[];
    totalOdd: number;
    availablePerPosition: number;
    positions: Position[];
};

const CombinedPositionDetails: React.FC<CombinedPositionDetailsProps> = ({
    markets,
    totalOdd,
    availablePerPosition,
    positions,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector(getIsMobile);
    const parlay = useSelector(getParlay);

    const isAddedToParlay = isSpecificCombinedPositionAddedToParlay(parlay, markets, positions);

    const isGameCancelled = markets[0].isCanceled || (markets[0].isOpen && markets[0].isResolved);
    const isGameResolved = markets[0].isResolved || markets[0].isCanceled;
    const isGameRegularlyResolved = markets[0].isResolved && !markets[0].isCanceled;
    const isPendingResolution = !markets[0].isOpen && !isGameResolved;
    const isGamePaused = markets[0].isPaused && !isGameResolved;
    const isGameOpen = !markets[0].isResolved && !markets[0].isCanceled && !markets[0].isPaused && markets[0].isOpen;

    const noLiquidity = !!availablePerPosition && availablePerPosition < MIN_LIQUIDITY;
    const noOdd = !totalOdd || totalOdd == 0;
    const disabledPosition = noOdd || noLiquidity || !isGameOpen;

    const showBonus = false;
    const positionBonus = '0';

    const showOdd = isGameOpen && !noLiquidity;
    const showTooltip = showOdd && !isMobile;

    const symbolText = getCombinedPositionName(markets, positions);
    const spreadTotalText = getSpreadTotalText(markets[0], positions[0]);

    const totalText = getTotalText(markets[1]);

    const oddTooltipText = getCombinedOddTooltipText(markets, positions);

    const parentMarketAddress = markets[0].parentMarket !== null ? markets[0].parentMarket : markets[1].parentMarket;
    const isParentMarketAddressInParlayData = parlay.filter((market) => market.parentMarket == parentMarketAddress);

    const isCombinedPositionWinner = isCombinedMarketWinner(markets, positions);

    const getDetails = () => (
        <Container
            disabled={disabledPosition}
            selected={isAddedToParlay}
            isWinner={isGameRegularlyResolved && isCombinedPositionWinner}
            onClick={() => {
                if (noOdd || disabledPosition) return;
                if (isParentMarketAddressInParlayData) {
                    dispatch(removeCombinedMarketFromParlay(parentMarketAddress));
                }
                if (isAddedToParlay) {
                    dispatch(removeCombinedMarketFromParlay(parentMarketAddress));
                } else {
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
            }}
        >
            <Text>
                {symbolText}
                {spreadTotalText && ` (${spreadTotalText})`}
                {totalText && ` (${totalText})`}
            </Text>
            {showOdd ? (
                <Text>
                    {formatMarketOdds(selectedOddsType, totalOdd)}
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
                            <TooltipFooterInfo>{formatMarketOdds(selectedOddsType, totalOdd)}</TooltipFooterInfo>
                        </TooltipFooterInfoContianer>
                        <TooltipFooterInfoContianer>
                            <TooltipFooterInfoLabel>{t('markets.market-details.liquidity')}:</TooltipFooterInfoLabel>
                            <TooltipFooterInfo>{floorNumberToDecimals(availablePerPosition || 0)}</TooltipFooterInfo>
                        </TooltipFooterInfoContianer>
                    </TooltipFooter>
                </>
            )}
        </TooltipContainer>
    );

    return <>{showTooltip ? <Tooltip overlay={getTooltip()} component={getDetails()} /> : getDetails()}</>;
};

export default CombinedPositionDetails;
