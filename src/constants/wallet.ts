import { HostedWallets, ParticalTypes } from 'enums/wallet';
import MetaMaskIcon from 'assets/images/wallets/metamask.svg';
import WalletConnectIcon from 'assets/images/wallets/wallet_connect.svg';

export const BALANCE_THRESHOLD = 0.00000001;

export const SUPPORTED_HOSTED_WALLETS: HostedWallets[] = [
    HostedWallets.METAMASK,
    HostedWallets.WALLET_CONNECT,
    HostedWallets.INJECTED,
];

export const SUPPORTED_PARTICAL_CONNECTORS: ParticalTypes[] = [
    ParticalTypes.APPLE,
    ParticalTypes.DISCORD,
    ParticalTypes.GITHUB,
    ParticalTypes.GOOGLE,
    ParticalTypes.TWITTER,
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
