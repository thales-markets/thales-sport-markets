export type Coins =
    | 'sUSD'
    | 'DAI'
    | 'USDCe'
    | 'USDC'
    | 'USDT'
    | 'OP'
    | 'WETH'
    | 'ETH'
    | 'ARB'
    | 'USDbC'
    | 'THALES'
    | 'sTHALES';

export type Token = {
    address: string;
    decimals: number;
    symbol: string;
    name: string;
    chainId: number;
    logoURI: string;
};
