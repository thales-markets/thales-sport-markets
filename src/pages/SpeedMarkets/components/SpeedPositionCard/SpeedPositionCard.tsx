import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { SpeedPositions } from 'enums/speedMarkets';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserPosition } from 'types/speedMarkets';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { isUserWinner, isUserWinning } from 'utils/speedMarkets';
import SpeedTimeRemaining from '../SpeedTimeRemaining';

type SpeedPositionCardProps = {
    position: UserPosition;
};

const SpeedPositionCard: React.FC<SpeedPositionCardProps> = ({ position }) => {
    const { t } = useTranslation();

    const isMatured = position.maturityDate < Date.now();
    const hasFinalPrice = position.finalPrice > 0;
    const isUserWon = !!isUserWinner(position.side, position.strikePrice, position.finalPrice);
    const isUserCurrentlyWinning = isUserWinning(position.side, position.strikePrice, position.currentPrice);

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
                {!isMatured ? (
                    // pending
                    <Status isWon={isUserCurrentlyWinning}>
                        {isUserCurrentlyWinning ? 'winning...' : 'losing...'}
                    </Status>
                ) : position.isClaimable ? (
                    <></>
                ) : hasFinalPrice ? (
                    // history
                    <Status isWon={isUserWon}>
                        {isUserWon
                            ? t('speed-markets.user-positions.status-won')
                            : t('speed-markets.user-positions.status-loss')}
                    </Status>
                ) : (
                    // price is missing - pending
                    <Status isWon={false} isUnknown>
                        {t('speed-markets.user-positions.waiting-price')}
                    </Status>
                )}
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
                            <SpeedTimeRemaining end={position.maturityDate} showFullCounter showSecondsCounter />
                        </>
                    )}
                </Time>
            </FlexDivRowCentered>
            <FlexDivRowCentered>
                <Paid>{`${t('speed-markets.user-positions.labels.paid')}: ${formatCurrencyWithSign(
                    USD_SIGN,
                    position.paid
                )}`}</Paid>
                <Payout>{`${t('speed-markets.user-positions.labels.payout')}: ${formatCurrencyWithSign(
                    USD_SIGN,
                    position.payout
                )}`}</Payout>
            </FlexDivRowCentered>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    min-height: 100px;
    max-height: 100px;
    border-radius: 16px;
    background: ${(props) => props.theme.speedMarkets.position.card.background.primary};
    padding: 10px 20px;
    justify-content: space-between;
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

const Payout = styled(Text)``;

const PlayIcon = styled.i`
    rotate: -90deg;
    color: ${(props) => props.theme.speedMarkets.position.card.icon.primary};
    font-size: 12px;
    line-height: 12px;
    margin-right: 5px;
`;

export default SpeedPositionCard;
