import Tooltip from 'components/Tooltip';
import { oddToastOptions } from 'config/toast';
import { MIN_LIQUIDITY } from 'constants/markets';
import { CombinedPositionsMatchingCode, Position } from 'enums/markets';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getCombinedPositions, removeCombinedPosition, updateCombinedPositions } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import { floorNumberToDecimals } from 'thales-utils';
import { CombinedMarketPosition, SportMarketInfo } from 'types/markets';
import {
    checkIfCombinedPositionAlreadyInParlay,
    getCombinedPositionName,
    isCombinedMarketWinner,
} from 'utils/combinedMarkets';
import {
    formatMarketOdds,
    getCombinedOddTooltipText,
    getParentMarketAddress,
    getSpreadTotalText,
    getTotalText,
} from 'utils/markets';
import {
    Bonus,
    Container,
    Status,
    Text,
    TooltipBonusText,
    TooltipContainer,
    TooltipFooter,
    TooltipFooterInfo,
    TooltipFooterInfoContianer,
    TooltipFooterInfoLabel,
    TooltipText,
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
    const combinedPositions = useSelector(getCombinedPositions);

    const isGameStarted = markets[0].maturityDate < new Date();
    const isGameCancelled = markets[0].isCanceled || (!isGameStarted && markets[0].isResolved);
    const isGameResolved = markets[0].isResolved || markets[0].isCanceled;
    const isGameRegularlyResolved = markets[0].isResolved && !markets[0].isCanceled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const isGamePaused = markets[0].isPaused && !isGameResolved;
    const isGameOpen = !markets[0].isResolved && !markets[0].isCanceled && !markets[0].isPaused && !isGameStarted;

    const noLiquidity = availablePerPosition !== undefined && availablePerPosition < MIN_LIQUIDITY;
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

    const isCombinedPositionWinner = isCombinedMarketWinner(markets, positions);

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
        totalOdd: totalOdd ? totalOdd : 0,
        totalBonus: 0,
        positionName: symbolText || '',
    };

    const { matchingCode } = checkIfCombinedPositionAlreadyInParlay(combinedPosition, combinedPositions);

    const isAddedToParlay = matchingCode === CombinedPositionsMatchingCode.SAME_POSITIONS;

    const getDetails = () => (
        <Container
            disabled={disabledPosition}
            selected={isAddedToParlay}
            isWinner={isGameRegularlyResolved && isCombinedPositionWinner}
            onClick={() => {
                if (noOdd || disabledPosition) return;
                if (isAddedToParlay) {
                    dispatch(removeCombinedPosition(parentMarketAddress));
                } else {
                    dispatch(updateCombinedPositions(combinedPosition));
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
