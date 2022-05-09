import React, { FC, createContext, useContext } from 'react';
import { MarketInfo } from 'types/markets';

const MarketContext = createContext<MarketInfo | null>(null);

type MarketContextProps = {
    children: React.ReactNode;
    market: MarketInfo;
};

export const MarketProvider: FC<MarketContextProps> = ({ children, market }) => (
    <MarketContext.Provider value={market}>{children}</MarketContext.Provider>
);

export const useMarketContext = () => useContext(MarketContext) as MarketInfo;
