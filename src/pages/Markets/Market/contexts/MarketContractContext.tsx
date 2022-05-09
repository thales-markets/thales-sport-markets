import React, { createContext, useContext } from 'react';
import { ethers } from 'ethers';

const MarketContractContext = createContext<ethers.Contract | null>(null);

type MarketContractContextProps = {
    children: React.ReactNode;
    contract: ethers.Contract;
};

export const BOMContractProvider: React.FC<MarketContractContextProps> = ({ children, contract }) => (
    <MarketContractContext.Provider value={contract}>{children}</MarketContractContext.Provider>
);

export const useMarketContractContext = () => useContext(MarketContractContext) as ethers.Contract;
