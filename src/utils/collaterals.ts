import { currencyKeyToAssetIconMap } from 'constants/currency';

export type StablecoinKey = 'sUSD' | 'USDC' | 'USDT' | 'DAI';

export const getStableIcon = (currencyKey: StablecoinKey) => currencyKeyToAssetIconMap[currencyKey];
