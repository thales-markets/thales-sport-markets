import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { Network } from 'enums/network';
import { OverdropLevel } from 'types/ui';
import Level1Large from '../assets/images/overdrop/largeBadges/1.webp';
import Level10Large from '../assets/images/overdrop/largeBadges/10.webp';
import Level2Large from '../assets/images/overdrop/largeBadges/2.webp';
import Level3Large from '../assets/images/overdrop/largeBadges/3.webp';
import Level4Large from '../assets/images/overdrop/largeBadges/4.webp';
import Level5Large from '../assets/images/overdrop/largeBadges/5.webp';
import Level6Large from '../assets/images/overdrop/largeBadges/6.webp';
import Level7Large from '../assets/images/overdrop/largeBadges/7.webp';
import Level8Large from '../assets/images/overdrop/largeBadges/8.webp';
import Level9Large from '../assets/images/overdrop/largeBadges/9.webp';
import Level1Small from '../assets/images/overdrop/smallBadges/1.webp';
import Level10Small from '../assets/images/overdrop/smallBadges/10.webp';
import Level2Small from '../assets/images/overdrop/smallBadges/2.webp';
import Level3Small from '../assets/images/overdrop/smallBadges/3.webp';
import Level4Small from '../assets/images/overdrop/smallBadges/4.webp';
import Level5Small from '../assets/images/overdrop/smallBadges/5.webp';
import Level6Small from '../assets/images/overdrop/smallBadges/6.webp';
import Level7Small from '../assets/images/overdrop/smallBadges/7.webp';
import Level8Small from '../assets/images/overdrop/smallBadges/8.webp';
import Level9Small from '../assets/images/overdrop/smallBadges/9.webp';
import test from '../assets/images/overdrop/test.png';

export const OVERDROP_LEVELS: OverdropLevel[] = [
    {
        levelName: 'Newbie',
        level: 0,
        loyaltyBoost: 0,
        minimumPoints: 0,
        smallBadge: test,
        largeBadge: test,
    },
    {
        level: 1,
        levelName: 'Rookie',
        minimumPoints: 1000,
        loyaltyBoost: 1,
        smallBadge: Level1Small,
        largeBadge: Level1Large,
    },
    {
        level: 2,
        levelName: 'Contender',
        minimumPoints: 2000,
        loyaltyBoost: 2,
        voucherAmount: 50,
        smallBadge: Level2Small,
        largeBadge: Level2Large,
    },
    {
        level: 3,
        levelName: 'Challenger',
        minimumPoints: 5000,
        loyaltyBoost: 3,
        smallBadge: Level3Small,
        largeBadge: Level3Large,
    },
    {
        level: 4,
        levelName: 'Competitor',
        minimumPoints: 10000,
        loyaltyBoost: 4,
        voucherAmount: 200,
        smallBadge: Level4Small,
        largeBadge: Level4Large,
    },
    {
        level: 5,
        levelName: 'Semi-Pro',
        minimumPoints: 25000,
        loyaltyBoost: 5,

        smallBadge: Level5Small,
        largeBadge: Level5Large,
    },
    {
        level: 6,
        levelName: 'Prodigy',
        minimumPoints: 50000,
        loyaltyBoost: 6,
        voucherAmount: 500,
        smallBadge: Level6Small,
        largeBadge: Level6Large,
    },
    {
        level: 7,
        levelName: 'All-Star',
        minimumPoints: 100000,
        loyaltyBoost: 7,
        smallBadge: Level7Small,
        largeBadge: Level7Large,
    },
    {
        level: 8,
        levelName: 'Champion',
        minimumPoints: 200000,
        loyaltyBoost: 8,
        voucherAmount: 1000,
        smallBadge: Level8Small,
        largeBadge: Level8Large,
    },
    {
        level: 9,
        levelName: 'Elite',
        minimumPoints: 500000,
        loyaltyBoost: 9,
        smallBadge: Level9Small,
        largeBadge: Level9Large,
    },
    {
        level: 10,
        levelName: 'GOAT',
        minimumPoints: 1000000,
        loyaltyBoost: 10,
        voucherAmount: 3000,
        smallBadge: Level10Small,
        largeBadge: Level10Large,
    },
];

export const OVERDROP_REWARDS_NETWORKS = [Network.OptimismMainnet, Network.Arbitrum, Network.OptimismSepolia];

export const OVERDROP_REWARDS_COLLATERALS = {
    [Network.OptimismSepolia]: CRYPTO_CURRENCY_MAP.USDC,
    [Network.OptimismMainnet]: CRYPTO_CURRENCY_MAP.OP,
    [Network.Arbitrum]: CRYPTO_CURRENCY_MAP.ARB,
    [Network.Base]: CRYPTO_CURRENCY_MAP.USDC,
};
