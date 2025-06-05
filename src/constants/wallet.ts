import { ParticalTypes, WalletConnections } from 'types/wallet';

export const SUPPORTED_PARTICAL_CONNECTORS_MODAL: ParticalTypes[] = [
    ParticalTypes.GOOGLE,
    ParticalTypes.TWITTER,
    ParticalTypes.DISCORD,
    ParticalTypes.APPLE,
];

export const SUPPORTED_WALLET_CONNECTORS_MODAL: WalletConnections[] = [
    WalletConnections.METAMASK,
    WalletConnections.COINBASE,
    WalletConnections.BINANCE,
];

export const WALLETS_LABELS: { id: ParticalTypes | WalletConnections; labelKey: string }[] = [
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

    {
        id: WalletConnections.METAMASK,
        labelKey: 'common.wallet.particle-logins.browser-wallet',
    },
    {
        id: WalletConnections.COINBASE,
        labelKey: 'common.wallet.particle-logins.coinbase',
    },
    {
        id: WalletConnections.WALLET_CONNECT,
        labelKey: 'common.wallet.particle-logins.wallet-connect',
    },
    {
        id: WalletConnections.BINANCE,
        labelKey: 'common.wallet.particle-logins.binance-wallet',
    },
];

export const BALANCE_THRESHOLD = 0.00000001;
