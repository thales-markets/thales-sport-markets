import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { Wallet } from '@rainbow-me/rainbowkit';
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
    {
        id: WalletConnections.FARCASTER,
        labelKey: 'common.wallet.particle-logins.farcaster-wallet',
    },
];

export const BALANCE_THRESHOLD = 0.00000001;
const FARCASTER_ICON_URL =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cGF0aCBmaWxsPSIjODA1RUZGIiBkPSJNMTYgMEM3LjE2NCAwIDAgNy4xNjQgMCAxNnM3LjE2NCAxNiAxNiAxNnMxNi03LjE2NCAxNi0xNlMxOC44MzYgMCAxNiAwek0xMS40NjcgMjMuNDVMMTAuMDYgMjEuNThhLjYzNi42MzYgMCAwIDEgLjAyMy0uOTA4bDYuNDE4LTUuMzQ0YS40MjQuNDI0IDAgMCAwIDAtLjY0MkwxMC4wMyAxMC4zNDNhLjYzNi42MzYgMCAwIDEgLjA3LS45MDJsMS40MS0xLjg3MWEuNjM2LjYzNiAwIDAgMSAuODk1LS4xMThMMjIgMTUuNzA0YS44NDguODQ4IDAgMCAxIDAgMS4yOTJMMTIuNDE4IDIzLjU0OGEuNjM2LjYzNiAwIDAgMS0uOTUtLjA5OHoiLz48L3N2Zz4=';
export const farcasterRainbowWallet = (options?: any): Wallet => ({
    id: 'farcaster',
    name: 'Farcaster Wallet',
    iconUrl: FARCASTER_ICON_URL, // Base64 encoded SVG icon
    iconBackground: '#FFFFFF', // White background for the icon
    ...(options || {}),
    createConnector: () => farcasterFrame(),
});
