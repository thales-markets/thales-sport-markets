import { LiquidityPoolPnlType } from 'enums/liquidityPool';
import useLiquidityPoolPnlsQuery from 'queries/liquidityPool/useLiquidityPoolPnlsQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { Colors, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { formatPercentageWithSign } from 'thales-utils';
import { LiquidityPoolPnls, LiquidityPoolType } from 'types/liquidityPool';
import { ThemeInterface } from 'types/ui';

type PnlProps = {
    lifetimePnl: number;
    type: LiquidityPoolPnlType;
    liquidityPoolAddress: LiquidityPoolType;
};

const PnL: React.FC<PnlProps> = ({ lifetimePnl, type, liquidityPoolAddress }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const [liquidityPoolPnls, setLiquidityPoolPnls] = useState<LiquidityPoolPnls>([]);

    const liquidityPoolPnlsQuery = useLiquidityPoolPnlsQuery(networkId, liquidityPoolAddress, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (liquidityPoolPnlsQuery.isSuccess && liquidityPoolPnlsQuery.data) {
            setLiquidityPoolPnls(
                type === LiquidityPoolPnlType.CUMULATIVE_PNL && liquidityPoolPnlsQuery.data.length > 0
                    ? [
                          {
                              round: '',
                              pnlPerRound: 0,
                              cumulativePnl: 0,
                          },
                          ...liquidityPoolPnlsQuery.data,
                      ]
                    : liquidityPoolPnlsQuery.data
            );
        } else {
            setLiquidityPoolPnls([]);
        }
    }, [liquidityPoolPnlsQuery.isSuccess, liquidityPoolPnlsQuery.data, type]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <TooltipContainer>
                    <TooltipAmount>{formatPercentageWithSign(payload[0].value)}</TooltipAmount>
                </TooltipContainer>
            );
        }
        return null;
    };

    const CustomizedDot: React.FC = (props: any) => {
        const { cx, cy, value } = props;

        return (
            <svg height="8" width="8" overflow="visible">
                <circle
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill={value === 0 ? theme.chart.primary : value > 0 ? theme.status.win : theme.status.loss}
                />
            </svg>
        );
    };

    const noData = liquidityPoolPnls.length === 0;

    const Chart = type === LiquidityPoolPnlType.PNL_PER_ROUND ? BarChart : LineChart;

    return (
        <Container>
            <Header noData={noData}>
                <Title>{t(`liquidity-pool.pnl.${type}.title`)}</Title>
                {type === LiquidityPoolPnlType.CUMULATIVE_PNL && (
                    <LifetimePnlContainer>
                        <LifetimePnlLabel>{t('liquidity-pool.pnl.lifetime-pnl')}:</LifetimePnlLabel>
                        <LifetimePnl
                            color={
                                lifetimePnl === 0
                                    ? theme.status.open
                                    : lifetimePnl > 0
                                    ? theme.status.win
                                    : theme.status.loss
                            }
                        >
                            {formatPercentageWithSign(lifetimePnl)}
                        </LifetimePnl>
                    </LifetimePnlContainer>
                )}
            </Header>
            {!noData ? (
                <ChartContainer>
                    <ResponsiveContainer width="100%" height="100%">
                        <Chart data={liquidityPoolPnls}>
                            <CartesianGrid strokeDasharray="2 2" strokeWidth={0.5} stroke={theme.textColor.secondary} />
                            <XAxis
                                dataKey="round"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: theme.textColor.secondary }}
                                style={{
                                    fontSize: '13px',
                                }}
                            />
                            <YAxis
                                tickFormatter={(val: any) => {
                                    return formatPercentageWithSign(val, val < 0.1 && val > -0.1 ? 2 : 0);
                                }}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: theme.textColor.secondary }}
                                style={{
                                    fontSize: '13px',
                                }}
                                width={55}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: theme.textColor.secondary, fillOpacity: '0.3' }}
                                wrapperStyle={{ outline: 'none' }}
                            />
                            {type === LiquidityPoolPnlType.PNL_PER_ROUND ? (
                                <Bar dataKey="pnlPerRound" radius={[4, 4, 0, 0]} maxBarSize={60}>
                                    {liquidityPoolPnls.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.pnlPerRound > 0 ? Colors.GREEN : Colors.RED}
                                        />
                                    ))}
                                </Bar>
                            ) : (
                                <Line
                                    type="monotone"
                                    dataKey="cumulativePnl"
                                    stroke={theme.chart.primary}
                                    strokeWidth={2}
                                    dot={<CustomizedDot />}
                                />
                            )}
                        </Chart>
                    </ResponsiveContainer>
                </ChartContainer>
            ) : (
                <NoData>{t(`liquidity-pool.pnl.no-data`)}</NoData>
            )}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    width: 100%;
`;

const ChartContainer = styled.div`
    height: 300px;
    width: 100%;
    @media (max-width: 767px) {
        height: 200px;
    }
`;

const TooltipContainer = styled(FlexDivColumnCentered)`
    border-radius: 3px;
    z-index: 999;
    padding: 2px 10px;
    background: ${(props) => props.theme.input.background.primary};
    color: ${(props) => props.theme.textColor.tertiary};
`;

const TooltipAmount = styled(FlexDivColumn)`
    font-weight: bold;
    font-size: 13px;
    text-align: center;
`;

const Header = styled(FlexDivRow)<{ noData?: boolean }>`
    margin: ${(props) => (props.noData ? '20px 0px 5px 0px' : '20px 6px 5px 58px')};
`;

const Title = styled.span`
    color: ${(props) => props.theme.textColor.secondary};
`;

const LifetimePnlContainer = styled(FlexDivRow)`
    align-items: center;
`;

const LifetimePnlLabel = styled.span``;

const LifetimePnl = styled.span<{ color: string }>`
    font-weight: 600;
    margin-left: 6px;
    color: ${(props) => props.color};
`;

const NoData = styled(FlexDivCentered)`
    border: 2px dotted ${(props) => props.theme.textColor.secondary};
    margin-bottom: 10px;
    height: 200px;
    color: ${(props) => props.theme.textColor.secondary};
    padding: 10px;
    text-align: center;
`;

export default PnL;
