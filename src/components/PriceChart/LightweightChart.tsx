import SimpleLoader from 'components/SimpleLoader';
import TooltipInfo from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { LINKS } from 'constants/links';
import { SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { hoursToSeconds, minutesToSeconds, secondsToMilliseconds, subDays } from 'date-fns';
import { SpeedPositions } from 'enums/speedMarkets';
import useInterval from 'hooks/useInterval';
import usePythCandlestickQuery from 'queries/prices/usePythCandlestickQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivSpaceBetween } from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { RiskPerAsset, RiskPerAssetAndPosition } from 'types/speedMarkets';
import { ThemeInterface } from 'types/ui';
import { useChainId, useClient } from 'wagmi';
import { ChartComponent } from './components/Chart/ChartContext';
import CurrentPrice from './components/CurrentPrice';

type LightweightChartProps = {
    asset: string;
    position?: SpeedPositions | undefined;
    selectedPrice?: number;
    selectedDate?: number;
    explicitCurrentPrice?: number;
    prevExplicitPrice?: number;
    risksPerAsset?: RiskPerAsset[];
    deltaTimeSec?: number;
    risksPerAssetAndDirection?: RiskPerAssetAndPosition[];
    hideLiquidity?: boolean;
};

const getSpeedMarketsToggleButtons = (now: Date) => [
    { label: '1m', resolution: '1', value: 1, startDate: Number(subDays(now, 1)) },
    { label: '2m', resolution: '2', value: 1, startDate: Number(subDays(now, 1)) },
    { label: '5m', resolution: '5', value: 2, startDate: Number(subDays(now, 2)) },
    { label: '15m', resolution: '15', value: 2, startDate: Number(subDays(now, 2)) },
    // { label: '30m', resolution: '30', value: 4, startDate: Number(subDays(now, 4)) },
    // { label: '1H', resolution: '60', value: 30, startDate: Number(subDays(now, 30)) },
    // { label: '1D', resolution: '1D', value: 365, startDate: Number(subDays(now, 365)) },
];

const SPEED_DEFAULT_TOGGLE_BUTTON_INDEX = 0;
const CHART_REFRESH_INTERVAL_SEC = 30;

const LightweightChart: React.FC<LightweightChartProps> = ({
    asset,
    selectedPrice,
    position,
    selectedDate,
    explicitCurrentPrice,
    prevExplicitPrice,
    deltaTimeSec,
    risksPerAsset,
    risksPerAssetAndDirection,
    hideLiquidity,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();
    const client = useClient();

    const [now, setNow] = useState(new Date());
    const [dateRange, setDateRange] = useState(getSpeedMarketsToggleButtons(now)[SPEED_DEFAULT_TOGGLE_BUTTON_INDEX]);
    const [candleData, setCandleData] = useState<any>();
    const [currentDeltaTimeSec, setCurrentDeltaTimeSec] = useState(deltaTimeSec);

    const exchangeRatesMarketDataQuery = useExchangeRatesQuery({ networkId, client });

    const pythQuery = usePythCandlestickQuery(asset, dateRange.startDate, dateRange.resolution, {
        refetchInterval: secondsToMilliseconds(30),
    });

    const handleDateRangeChange = useCallback(
        (value: number) => setDateRange(getSpeedMarketsToggleButtons(now)[value]),
        [now]
    );

    useInterval(() => {
        setNow(new Date());
    }, secondsToMilliseconds(CHART_REFRESH_INTERVAL_SEC));

    // changing the dateRange on chart when user clicks on speed markets buttons for time
    useEffect(() => {
        if (deltaTimeSec && deltaTimeSec !== prevDeltaTimeSecRef.current) {
            if (deltaTimeSec >= hoursToSeconds(1)) {
                const toggleButtonIndex = 3;
                if (dateRange.resolution !== getSpeedMarketsToggleButtons(now)[toggleButtonIndex].resolution) {
                    handleDateRangeChange(toggleButtonIndex);
                }
            } else if (deltaTimeSec >= minutesToSeconds(30)) {
                const toggleButtonIndex = 2;
                if (dateRange.resolution !== getSpeedMarketsToggleButtons(now)[toggleButtonIndex].resolution) {
                    handleDateRangeChange(toggleButtonIndex);
                }
            } else if (deltaTimeSec >= minutesToSeconds(10)) {
                const toggleButtonIndex = 1;
                if (dateRange.resolution !== getSpeedMarketsToggleButtons(now)[toggleButtonIndex].resolution) {
                    handleDateRangeChange(toggleButtonIndex);
                }
            } else {
                const toggleButtonIndex = 0;
                if (dateRange.resolution !== getSpeedMarketsToggleButtons(now)[toggleButtonIndex].resolution) {
                    handleDateRangeChange(toggleButtonIndex);
                }
                handleDateRangeChange(toggleButtonIndex);
            }
        }
    }, [deltaTimeSec, dateRange.resolution, handleDateRangeChange, now]);

    const candleStickData = useMemo(() => {
        if (pythQuery.isSuccess && pythQuery.data) {
            return pythQuery.data;
        }
    }, [pythQuery.isSuccess, pythQuery.data]);

    const currentPrice = useMemo(() => {
        if (explicitCurrentPrice) {
            return explicitCurrentPrice;
        } else if (exchangeRatesMarketDataQuery.isSuccess && exchangeRatesMarketDataQuery.data) {
            return exchangeRatesMarketDataQuery.data[asset];
        }
    }, [exchangeRatesMarketDataQuery.isSuccess, exchangeRatesMarketDataQuery.data, asset, explicitCurrentPrice]);

    useEffect(() => {
        if (currentPrice && candleStickData && candleStickData.length) {
            const cloneData = [...candleStickData];
            cloneData[cloneData.length - 1].close = currentPrice;
            setCandleData(cloneData);
        }
    }, [currentPrice, candleStickData]);

    // save previous deltaTimeSec
    const prevDeltaTimeSecRef = useRef<number | undefined>(currentDeltaTimeSec);
    useEffect(() => {
        prevDeltaTimeSecRef.current = currentDeltaTimeSec;
        setCurrentDeltaTimeSec(deltaTimeSec);
    }, [deltaTimeSec, currentDeltaTimeSec]);

    const risk = risksPerAsset?.filter((riskPerAsset) => riskPerAsset.currency === asset)[0];
    const liquidity = risk ? formatCurrencyWithSign(USD_SIGN, risk.max - risk.current) : 0;

    const riskPerDirectionUp = risksPerAssetAndDirection?.filter(
        (risk) => risk.currency === asset && risk.position === SpeedPositions.UP
    )[0];
    const liquidityPerUp = riskPerDirectionUp
        ? formatCurrencyWithSign(USD_SIGN, riskPerDirectionUp.max - riskPerDirectionUp.current)
        : 0;
    const riskPerDirectionDown = risksPerAssetAndDirection?.filter(
        (risk) => risk.currency === asset && risk.position === SpeedPositions.DOWN
    )[0];
    const liquidityPerDown = riskPerDirectionDown
        ? formatCurrencyWithSign(USD_SIGN, riskPerDirectionDown.max - riskPerDirectionDown.current)
        : 0;

    const isPriceUp = (explicitCurrentPrice || 0) > (prevExplicitPrice || 0);

    return (
        <Wrapper>
            <FlexDivSpaceBetween>
                {!hideLiquidity && !!liquidity && (
                    <FlexDiv>
                        <span>
                            <Label>{t('common.liquidity')}</Label>
                            <Value margin="0 0 0 4px">{liquidity}</Value>
                        </span>
                        <TooltipInfo
                            overlay={
                                <Trans
                                    i18nKey={'speed-markets.tooltips.liquidity'}
                                    components={{
                                        br: <br />,
                                    }}
                                    values={{
                                        liquidityPerAsset: liquidity,
                                        liquidityPerUp,
                                        liquidityPerDown,
                                    }}
                                />
                            }
                            customIconStyling={{ color: theme.speedMarkets.price.up }}
                            zIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
                        />
                    </FlexDiv>
                )}
            </FlexDivSpaceBetween>
            <ChartContainer>
                {pythQuery.isLoading ? (
                    <SimpleLoader />
                ) : (
                    <ChartComponent
                        resolution={dateRange.resolution}
                        data={candleData}
                        position={position}
                        asset={asset}
                        selectedPrice={selectedPrice}
                        selectedDate={selectedDate}
                    />
                )}
            </ChartContainer>

            <CurrentPrice asset={asset} currentPrice={currentPrice} isPriceUp={isPriceUp} />

            <PythIconWrap>
                <a target="_blank" rel="noreferrer" href={LINKS.Pyth.Benchmarks}>
                    <i className="speedmarkets-icon speedmarkets-icon--pyth" />
                </a>
            </PythIconWrap>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
`;

const ChartContainer = styled.div``;

const Label = styled.span<{ margin?: string }>`
    font-weight: 400;
    font-size: 18px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.primary};
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')};
`;

const Value = styled(Label)`
    color: ${(props) => props.theme.textColor.quaternary};
`;

const PythIconWrap = styled.div`
    position: absolute;
    right: 16px;
    bottom: 2px;
    z-index: 10;
    i {
        font-size: 40px;
        line-height: 18px;
        color: ${(props) => props.theme.textColor.primary};
        overflow: hidden;
    }
`;

export default LightweightChart;
