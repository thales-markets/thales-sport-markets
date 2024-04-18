import { OddsType } from 'enums/markets';
import { formatMarketOdds } from './markets';

export const getParlayQuote = (paid: number, payout: number) => 1 / (payout / paid);

export const formatParlayOdds = (oddsType: OddsType, paid: number, payout: number) =>
    formatMarketOdds(oddsType, getParlayQuote(paid, payout));
