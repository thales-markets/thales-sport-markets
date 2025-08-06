import ShareSpeedPosition from 'components/ShareSpeedPosition';
import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import { SpeedPositions } from 'enums/speedMarkets';
import useInterval from 'hooks/useInterval';
import { Dispatch } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'thales-utils';
import { UserPosition } from 'types/speedMarkets';
import { ThemeInterface } from 'types/ui';
import { getCollateralByAddress, isOverCurrency } from 'utils/collaterals';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { getPriceId } from 'utils/pyth';
import { refetchPythPrice } from 'utils/queryConnector';
import { isUserWinner, isUserWinning } from 'utils/speedMarkets';
import { useChainId } from 'wagmi';
import ClaimAction from '../ClaimAction';
import SpeedTimeRemaining from '../SpeedTimeRemaining';

type SpeedPositionCardProps = {
    position: UserPosition;
    claimCollateralIndex: number;
    isSubmittingBatch?: boolean;
    isActionInProgress?: boolean;
    setIsActionInProgress?: Dispatch<boolean>;
};

const SpeedPositionCard: React.FC<SpeedPositionCardProps> = ({
    position,
    claimCollateralIndex,
    isSubmittingBatch,
    isActionInProgress,
    setIsActionInProgress,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();

    const isMatured = position.maturityDate < Date.now();
    const hasFinalPrice = position.finalPrice > 0;
    const isUserWon = !!isUserWinner(position.side, position.strikePrice, position.finalPrice);
    const isUserCurrentlyWinning = isUserWinning(position.side, position.strikePrice, position.currentPrice);
    const collateralByAddress = getCollateralByAddress(position.collateralAddress, networkId);
    const collateral = `${isOverCurrency(collateralByAddress) ? '$' : ''}${collateralByAddress}`;

    // refetch Pyth price when position becomes matured and final price is missing
    useInterval(() => {
        // when becomes matured
        if (Date.now() > position.maturityDate && position.finalPrice === 0) {
            refetchPythPrice(getPriceId(networkId, position.asset), millisecondsToSeconds(position.maturityDate));
        }
    }, secondsToMilliseconds(1));

    return (
        <Container>
            <FlexDivRowCentered>
                <AssetPosition>
                    <AssetIcon
                        className={`speedmarkets-logo-icon speedmarkets-logo-icon--${position.asset.toLowerCase()}-logo`}
                    />
                    <Position isUp={position.side === SpeedPositions.UP}>
                        <PositionIcon className="speedmarkets-icon speedmarkets-icon--arrow" />
                        <PositionText>{position.side}</PositionText>
                    </Position>
                </AssetPosition>
                <StatusWrapper isClaimable={position.isClaimable}>
                    {!isMatured ? (
                        // pending
                        <Status isWon={isUserCurrentlyWinning}>
                            {isUserCurrentlyWinning
                                ? t('speed-markets.user-positions.status.winning')
                                : t('speed-markets.user-positions.status.losing')}
                        </Status>
                    ) : position.isClaimable ? (
                        <ClaimWrapper>
                            <ClaimAction
                                positions={[position]}
                                claimCollateralIndex={claimCollateralIndex}
                                isDisabled={isSubmittingBatch}
                                isActionInProgress={isActionInProgress}
                                setIsActionInProgress={setIsActionInProgress}
                            />
                        </ClaimWrapper>
                    ) : hasFinalPrice ? (
                        // history
                        <Status isWon={isUserWon}>
                            {isUserWon
                                ? t('speed-markets.user-positions.status.won')
                                : t('speed-markets.user-positions.status.loss')}
                        </Status>
                    ) : (
                        // price is missing - pending
                        <Status isWon={false} isUnknown>
                            {t('speed-markets.user-positions.status.waiting-price')}
                        </Status>
                    )}
                    <ShareSpeedPosition position={position} />
                </StatusWrapper>
            </FlexDivRowCentered>
            <FlexDivRowCentered>
                <Price>{`${t('speed-markets.user-positions.labels.entry')}: ${formatCurrencyWithSign(
                    USD_SIGN,
                    position.strikePrice
                )}`}</Price>
                <Price>
                    {`${
                        isMatured && hasFinalPrice
                            ? t('speed-markets.user-positions.labels.end')
                            : t('speed-markets.user-positions.labels.price')
                    }: ${
                        isMatured && !hasFinalPrice
                            ? '-'
                            : formatCurrencyWithSign(USD_SIGN, isMatured ? position.finalPrice : position.currentPrice)
                    }`}
                    {isMatured && !hasFinalPrice && (
                        <Tooltip
                            overlay={t('speed-markets.tooltips.final-price-missing')}
                            iconFontSize={14}
                            iconColor={theme.speedMarkets.position.card.textColor.primary}
                            marginLeft={4}
                            zIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
                        />
                    )}
                </Price>
            </FlexDivRowCentered>
            <FlexDivRowCentered>
                <Time>{formatShortDateWithFullTime(position.createdAt)}</Time>
                <Time>
                    {isMatured ? (
                        formatShortDateWithFullTime(position.maturityDate)
                    ) : (
                        <>
                            <PlayIcon className="speedmarkets-icon speedmarkets-icon--indicator-down" />
                            <SpeedTimeRemaining end={position.maturityDate} showFullCounter />
                        </>
                    )}
                </Time>
            </FlexDivRowCentered>
            <FlexDivRowCentered>
                <Paid>{`${t('speed-markets.user-positions.labels.paid')}: ${
                    position.isDefaultCollateral
                        ? formatCurrencyWithSign(USD_SIGN, position.paid)
                        : formatCurrencyWithKey(collateral, position.paid)
                }`}</Paid>
                <Payout isClaimable={position.isClaimable}>{`${t('speed-markets.user-positions.labels.payout')}: ${
                    position.isDefaultCollateral
                        ? formatCurrencyWithSign(USD_SIGN, position.payout)
                        : formatCurrencyWithKey(collateral, position.payout)
                }`}</Payout>
            </FlexDivRowCentered>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    min-height: 102px;
    max-height: 102px;
    border-radius: 16px;
    background: ${(props) => props.theme.speedMarkets.position.card.background.primary};
    padding: 10px 12px;
    justify-content: space-between;
`;

const ClaimWrapper = styled.div`
    width: 100%;
`;

const AssetPosition = styled(FlexDivRow)`
    gap: 6px;
`;
const AssetIcon = styled.i`
    font-size: 25px;
`;
const PositionIcon = styled.i`
    font-size: 12px;
    line-height: 20px;
`;
const PositionText = styled.span`
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    text-align: center;
`;
const Position = styled(FlexDivCentered)<{ isUp: boolean }>`
    gap: 4px;
    ${PositionIcon} {
        rotate: ${(props) => (props.isUp ? '-90deg' : '90deg')};
        color: ${(props) =>
            props.isUp ? props.theme.speedMarkets.position.up : props.theme.speedMarkets.position.down};
    }
    ${PositionText} {
        color: ${(props) =>
            props.isUp ? props.theme.speedMarkets.position.up : props.theme.speedMarkets.position.down};
    }
`;

const StatusWrapper = styled(FlexDivRowCentered)<{ isClaimable: boolean }>`
    ${(props) => (props.isClaimable ? 'width: 50%;' : '')}
    gap: 8px;
`;

const Status = styled.span<{ isWon: boolean; isUnknown?: boolean }>`
    color: ${(props) =>
        props.isUnknown
            ? props.theme.speedMarkets.textColor.primary
            : props.isWon
            ? props.theme.status.win
            : props.theme.status.loss};
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    text-transform: uppercase;
`;

const Text = styled.span`
    color: ${(props) => props.theme.speedMarkets.position.card.textColor.primary};
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
`;

const Price = styled(Text)``;

const Time = styled(Text)``;

const Paid = styled(Text)``;

const Payout = styled(Text)<{ isClaimable: boolean }>`
    ${(props) => (props.isClaimable ? `color: ${props.theme.status.win};` : '')}
`;

const PlayIcon = styled.i`
    rotate: -90deg;
    color: ${(props) => props.theme.speedMarkets.position.card.icon.primary};
    font-size: 12px;
    line-height: 12px;
    margin-right: 5px;
    margin-bottom: 2px;
`;

export default SpeedPositionCard;
