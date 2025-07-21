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
        levelName: 'Rookie',
        level: 1,
        loyaltyBoost: 5,
        minimumPoints: 200,
        smallBadge: Level1Small,
        largeBadge: Level1Large,
    },
    {
        levelName: 'Amateur',
        level: 2,
        loyaltyBoost: 5,
        minimumPoints: 500,
        smallBadge: Level2Small,
        largeBadge: Level2Large,
    },
    {
        levelName: 'Contender',
        level: 3,
        loyaltyBoost: 5,
        minimumPoints: 1000,
        smallBadge: Level3Small,
        largeBadge: Level3Large,
    },
    {
        levelName: 'Challenger',
        level: 4,
        loyaltyBoost: 5,
        minimumPoints: 2000,
        voucherAmount: 50,
        smallBadge: Level4Small,
        largeBadge: Level4Large,
    },
    {
        levelName: 'Competitor',
        level: 5,
        loyaltyBoost: 5,
        minimumPoints: 5000,
        smallBadge: Level5Small,
        largeBadge: Level5Large,
    },
    {
        levelName: 'Semi-Pro',
        level: 6,
        loyaltyBoost: 10,
        minimumPoints: 10000,
        voucherAmount: 200,
        smallBadge: Level6Small,
        largeBadge: Level6Large,
    },
    {
        levelName: 'Professional',
        level: 7,
        loyaltyBoost: 10,
        minimumPoints: 20000,
        smallBadge: Level7Small,
        largeBadge: Level7Large,
    },
    {
        levelName: 'All-Star',
        level: 8,
        loyaltyBoost: 10,
        minimumPoints: 50000,
        voucherAmount: 500,
        smallBadge: Level8Small,
        largeBadge: Level8Large,
    },
    {
        levelName: 'Champion',
        level: 9,
        loyaltyBoost: 10,
        minimumPoints: 100000,
        smallBadge: Level9Small,
        largeBadge: Level9Large,
    },
    {
        levelName: 'Elite',
        level: 10,
        loyaltyBoost: 10,
        minimumPoints: 200000,
        voucherAmount: 1000,
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
