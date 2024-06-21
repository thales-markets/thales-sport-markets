import { HostedWallets, ParticalTypes } from 'enums/wallet';
import MetaMaskIcon from 'assets/images/wallets/metamask.svg';
import WalletConnectIcon from 'assets/images/wallets/wallet_connect.svg';

export const BALANCE_THRESHOLD = 0.00000001;

export const SUPPORTED_PARTICAL_CONNECTORS: ParticalTypes[] = [
    ParticalTypes.GOOGLE,
    ParticalTypes.TWITTER,
    ParticalTypes.DISCORD,
    ParticalTypes.GITHUB,
    ParticalTypes.APPLE,
    ParticalTypes.EMAIL,
    ParticalTypes.PHONE,
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
        className: 'social-icon icon--apple',
    },
    {
        socialId: ParticalTypes.DISCORD,
        className: 'social-icon icon--discord',
    },
    {
        socialId: ParticalTypes.GITHUB,
        className: 'social-icon icon--github',
    },
    {
        socialId: ParticalTypes.GOOGLE,
        className: 'social-icon icon--google',
    },
    {
        socialId: ParticalTypes.TWITTER,
        className: 'social-icon icon--x',
    },
];
