import { Coins } from 'thales-utils';

export type Rates = Record<string, number>;

export type CollateralsBalance = Record<Coins, number>;

export type FreeBetBalance = {
    balances: Partial<CollateralsBalance>;
    validity: Partial<Record<Coins, boolean>>;
};
