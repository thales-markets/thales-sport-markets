export const OP_SUSD = {
    address: '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9',
    decimals: 18,
    symbol: 'sUSD',
    name: 'Synth sUSD',
    logoURI: 'https://tokens.1inch.io/0x57ab1ec28d129707052df4df418d58a2d46d5f51.png',
};

export const OP_ETH = {
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    decimals: 18,
    symbol: 'ETH',
    name: 'Ethereum',
    logoURI: 'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png',
};

export const OP_DAI = {
    address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai stable coin',
    logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
};

export const OP_USDC = {
    address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
};

export const OP_USDT = {
    address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether USD',
    logoURI: 'https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
};

export const AVAILABLE_TOKENS = [OP_SUSD, OP_DAI, OP_USDC, OP_USDT];

export const ONE_INCH_EXCHANGE_URL = 'https://api.1inch.exchange/v4.0/';
export const APPROVE_SPENDER_SUFFIX = '/approve/spender';
export const QUOTE_SUFFIX = '/quote';
export const SWAP_SUFFIX = '/swap';
