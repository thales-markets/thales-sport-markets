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
    LONG_CURRENCY_DECIMALS,
    roundNumberToDecimals,
    SHORT_CURRENCY_DECIMALS,
} from 'thales-utils';
import { getDefaultCollateral, isLpSupported, isStableCurrency } from 'utils/collaterals';
import { useChainId } from 'wagmi';

type TradingDetailsProps = {
    selectedAsset: string;
    selectedPosition?: SpeedPositions;
    strikePrice: number;
    priceSlippage: number;
    deltaTimeSec: number;
    payout: number;
    selectedCollateral: Coins;
};

const TradingDetails: React.FC<TradingDetailsProps> = ({
    selectedAsset,
    selectedPosition,
    strikePrice,
    priceSlippage,
    deltaTimeSec,
    payout,
    selectedCollateral,
}) => {
    const { t } = useTranslation();

    const networkId = useChainId();

    const isDefaultCollateral = selectedCollateral === getDefaultCollateral(networkId);
    const collateralHasLp = isLpSupported(selectedCollateral, true);

    const isDefaultText = !payout;

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
                    payout: payout
                        ? isDefaultCollateral || !collateralHasLp
                            ? formatCurrencyWithSign(USD_SIGN, payout)
                            : formatCurrencyWithKey(
                                  `$${selectedCollateral}`,
                                  payout,
                                  isStableCurrency(selectedCollateral)
                                      ? SHORT_CURRENCY_DECIMALS
                                      : LONG_CURRENCY_DECIMALS
                              )
                        : '',
                }}
                components={{
                    slippageTooltip: (
                        <Tooltip
                            overlay={t('speed-markets.tooltips.slippage')}
                            marginLeft={2}
                            iconFontSize={14}
                            zIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
                        />
                    ),
                    payotuTooltip: !collateralHasLp ? (
                        <Tooltip
                            overlay={t('speed-markets.tooltips.payout-conversion')}
                            marginLeft={2}
                            iconFontSize={14}
                            zIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
                        />
                    ) : (
                        <></>
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
