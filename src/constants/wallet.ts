import { ParticalTypes } from 'types/wallet';

export const SUPPORTED_PARTICAL_CONNECTORS: ParticalTypes[] = [
    ParticalTypes.GOOGLE,
    ParticalTypes.TWITTER,
    ParticalTypes.DISCORD,
    ParticalTypes.GITHUB,
    ParticalTypes.APPLE,
];

export const PARTICAL_WALLETS_LABELS: { id: ParticalTypes; labelKey: string }[] = [
    {
        id: ParticalTypes.GOOGLE,
        labelKey: 'common.wallet.particle-logins.google',
    },
    {
        id: ParticalTypes.TWITTER,
        labelKey: 'common.wallet.particle-logins.twitter',
    },
    {
        id: ParticalTypes.DISCORD,
        labelKey: 'common.wallet.particle-logins.discord',
    },
    {
        id: ParticalTypes.GITHUB,
        labelKey: 'common.wallet.particle-logins.github',
    },
    {
        id: ParticalTypes.APPLE,
        labelKey: 'common.wallet.particle-logins.apple',
    },
];

export const PARTICAL_LOGINS_CLASSNAMES: { socialId: ParticalTypes; className: string }[] = [
    {
        socialId: ParticalTypes.APPLE,
        className: 'icon icon--apple',
    },
    {
        socialId: ParticalTypes.DISCORD,
        className: 'icon icon--discord',
    },
    {
        socialId: ParticalTypes.GITHUB,
        className: 'icon icon--github',
    },
    {
        socialId: ParticalTypes.GOOGLE,
        className: 'icon icon--google',
    },
    {
        socialId: ParticalTypes.TWITTER,
        className: 'icon-homepage icon--x',
    },
];
