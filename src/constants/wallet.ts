import MetaMaskIcon from 'assets/images/wallets/metamask.svg';
import WalletConnectIcon from 'assets/images/wallets/wallet_connect.svg';
import { HostedWallets, ParticalTypes } from 'enums/wallet';

export const BALANCE_THRESHOLD = 0.00000001;

export const SUPPORTED_PARTICAL_CONNECTORS: ParticalTypes[] = [
    ParticalTypes.GOOGLE,
    ParticalTypes.TWITTER,
    ParticalTypes.DISCORD,
    ParticalTypes.GITHUB,
    ParticalTypes.APPLE,
];

export const HOSTED_WALLETS_ICONS: { walletId: HostedWallets; image: string }[] = [
    {
        walletId: HostedWallets.METAMASK,
        image: MetaMaskIcon,
    },
    {
        walletId: HostedWallets.INJECTED,
        image: MetaMaskIcon,
    },
    {
        walletId: HostedWallets.WALLET_CONNECT,
        image: WalletConnectIcon,
    },
];

export const HOSTED_WALLETS_LABELS: { walletId: HostedWallets; labelKey: string }[] = [
    {
        walletId: HostedWallets.METAMASK,
        labelKey: 'common.wallet.metamask',
    },
    {
        walletId: HostedWallets.INJECTED,
        labelKey: 'common.wallet.metamask',
    },
    {
        walletId: HostedWallets.WALLET_CONNECT,
        labelKey: 'common.wallet.wallet-connect',
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
