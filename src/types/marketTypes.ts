import { MarketType } from 'enums/marketTypes';

export type MarketTypeInfo = {
    id: MarketType;
    key: string;
    name: string;
    shortName?: string;
    description?: string;
    tooltipKey?: string;
};
