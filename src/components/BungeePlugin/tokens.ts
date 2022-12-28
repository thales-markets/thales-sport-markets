import { Currency } from '@socket.tech/plugin';

export const OP_DAI: Currency = {
    name: 'Dai Stablecoin',
    address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    symbol: 'DAI',
    decimals: 18,
    chainId: 10,
    icon: '',
    logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
};

export const OP_SUSD: Currency = {
    name: 'Synth sUSD',
    address: '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9',
    symbol: 'sUSD',
    decimals: 18,
    chainId: 10,
    icon: '',
    logoURI: 'https://tokens.1inch.io/0x57ab1ec28d129707052df4df418d58a2d46d5f51.png',
};

export const OP_USDC: Currency = {
    name: 'USDCoin',
    address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    symbol: 'USDC',
    decimals: 6,
    chainId: 10,
    icon: '',
    logoURI: 'https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
};

export const OP_USDT: Currency = {
    name: 'Tether USD',
    address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    symbol: 'USDT',
    decimals: 6,
    chainId: 10,
    icon: '',
    logoURI: 'https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
};

export const destinationTokens = [OP_DAI, OP_SUSD, OP_USDC, OP_USDT];
