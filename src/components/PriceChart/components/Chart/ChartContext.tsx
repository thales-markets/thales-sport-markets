import { ChartContext } from 'constants/chart';
import { SpeedPositions } from 'enums/speedMarkets';
import { ColorType, IChartApi, createChart } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';
import { CandlestickComponent } from './components/CandlestickComponent';

type ChartContextProps = {
    children: React.ReactNode;
    chart: IChartApi | null;
};

type ChartProps = {
    data: any;
    position: SpeedPositions | undefined;
    asset: string;
    selectedPrice?: number;
    selectedDate?: number;
    resolution?: string;
};

const ChartProvider: React.FC<ChartContextProps> = ({ children, chart }) => (
    <ChartContext.Provider value={chart}>{children}</ChartContext.Provider>
);

export const ChartComponent: React.FC<ChartProps> = ({ data, asset }) => {
    const theme: ThemeInterface = useTheme();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [chart, setChart] = useState<IChartApi | undefined>();

    useEffect(() => {
        const chart = createChart(chartContainerRef.current ?? '', {
            layout: {
                background: { type: ColorType.Solid, color: theme.background.primary },
                textColor: theme.chart.labels,
                fontFamily: theme.fontFamily.primary,
            },
            height: 160,
            grid: {
                vertLines: {
                    visible: false,
                    color: theme.borderColor.primary,
                },
                horzLines: {
                    visible: false,
                    color: theme.borderColor.primary,
                },
            },
            timeScale: {
                rightOffset: 3,
                timeVisible: true,
                fixLeftEdge: true,
                barSpacing: 10,
            },
        });
        setChart(chart);
        return () => {
            chart.remove();
        };
    }, [theme]);

    return (
        <ChartContainer>
            <Chart ref={chartContainerRef}>
                {chart && (
                    <ChartProvider chart={chart}>
                        <CandlestickComponent data={data} asset={asset} />
                    </ChartProvider>
                )}
            </Chart>
        </ChartContainer>
    );
};

const ChartContainer = styled.div`
    height: 200;
    position: relative;
`;

const Chart = styled.div``;
