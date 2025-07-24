import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { secondsToMinutes } from 'date-fns';
import { SpeedPositions } from 'enums/speedMarkets';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
    Coins,
    countDecimals,
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    roundNumberToDecimals,
} from 'thales-utils';
import { isOverCurrency } from 'utils/collaterals';

type TradingDetailsProps = {
    selectedAsset: string;
    selectedPosition?: SpeedPositions;
    strikePrice: number;
    priceSlippage: number;
    deltaTimeSec: number;
    paidAmount: number;
    profitPerPosition: Record<SpeedPositions, number>;
    selectedCollateral: Coins;
};

const TradingDetails: React.FC<TradingDetailsProps> = ({
    selectedAsset,
    selectedPosition,
    strikePrice,
    priceSlippage,
    deltaTimeSec,
    paidAmount,
    profitPerPosition,
    selectedCollateral,
}) => {
    const { t } = useTranslation();
    const isOver = isOverCurrency(selectedCollateral);

    const isDefaultText = !paidAmount || !selectedPosition;

    return (
        <TradingDetailsText>
            <Trans
                i18nKey={
                    isDefaultText
                        ? 'speed-markets.amm-trading.trading-details-default'
                        : 'speed-markets.amm-trading.trading-details'
                }
                values={{
                    asset: selectedAsset,
                    position:
                        selectedPosition === SpeedPositions.UP
                            ? t('common.above').toUpperCase()
                            : t('common.below').toUpperCase(),
                    strikePrice: strikePrice
                        ? formatCurrencyWithSign(USD_SIGN, strikePrice, 2)
                        : t('common.current-price'),
                    slippage: roundNumberToDecimals(priceSlippage * 100, countDecimals(priceSlippage) - 2),
                    duration: `${secondsToMinutes(deltaTimeSec)} ${
                        secondsToMinutes(deltaTimeSec) === 1
                            ? t('common.time-remaining.minute')
                            : t('common.time-remaining.minutes')
                    }`,
                    payout:
                        selectedPosition && paidAmount
                            ? isOver
                                ? formatCurrencyWithKey(
                                      `$${selectedCollateral}`,
                                      profitPerPosition[selectedPosition] * paidAmount,
                                      2
                                  )
                                : formatCurrencyWithSign(USD_SIGN, profitPerPosition[selectedPosition] * paidAmount, 2)
                            : '',
                }}
                components={{
                    tooltip: (
                        <Tooltip
                            overlay={t('speed-markets.tooltips.slippage')}
                            marginLeft={2}
                            iconFontSize={14}
                            zIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
                        />
                    ),
                }}
            />
        </TradingDetailsText>
    );
};

const TradingDetailsText = styled.span`
    text-align: center;
    font-size: 14px;
    line-height: 16px;
`;

export default TradingDetails;
