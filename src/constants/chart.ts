import { IChartApi } from 'lightweight-charts';
import { createContext } from 'react';

export const ChartContext = createContext<IChartApi | null>(null);
