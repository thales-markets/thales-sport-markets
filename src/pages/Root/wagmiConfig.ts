import binanceWallet from '@binance/w3w-rainbow-connector-v2';
import { farcasterFrame as farcasterFrameWagmiConnector } from '@farcaster/frame-wagmi-connector';
import { connectorsForWallets, Wallet } from '@rainbow-me/rainbowkit';
import {
    braveWallet,
    coinbaseWallet,
    imTokenWallet,
    injectedWallet,
    ledgerWallet,
    metaMaskWallet,
    rabbyWallet,
    rainbowWallet,
    trustWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { RPC_LIST } from 'constants/network';
import { NetworkId } from 'thales-utils';
import { isMobile } from 'utils/device';
import {
    particleAppleWallet,
    particleDiscordWallet,
    particleGithubWallet,
    particleGoogleWallet,
    particleTwitterWallet,
    particleWallet,
} from 'utils/particleWallet';
import { createConfig, fallback, http } from 'wagmi';
import { arbitrum, base, optimism, optimismSepolia } from 'wagmi/chains';

// Define the Farcaster wallet for RainbowKit as a function returning a Wallet object
const farcasterRainbowWallet = (options?: any): Wallet => ({
    id: 'farcaster',
    name: 'Farcaster Wallet',
    iconUrl:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cGF0aCBmaWxsPSIjODA1RUZGIiBkPSJNMTYgMEM3LjE2NCAwIDAgNy4xNjQgMCAxNnM3LjE2NCAxNiAxNiAxNnMxNi03LjE2NCAxNi0xNlMxOC44MzYgMCAxNiAwek0xMS40NjcgMjMuNDVMMTAuMDYgMjEuNThhLjYzNi42MzYgMCAwIDEgLjAyMy0uOTA4bDYuNDE4LTUuMzQ0YS40MjQuNDI0IDAgMCAwIDAtLjY0MkwxMC4wMyAxMC4zNDNhLjYzNi42MzYgMCAwIDEgLjA3LS45MDJsMS40MS0xLjg3MWEuNjM2LjYzNiAwIDAgMSAuODk1LS4xMThMMjIgMTUuNzA0YS44NDguODQ4IDAgMCAxIDAgMS4yOTJMMTIuNDE4IDIzLjU0OGEuNjM2LjYzNiAwIDAgMS0uOTUtLjA5OHoiLz48L3N2Zz4=', // Simple Farcaster-like SVG icon
    iconBackground: '#FFFFFF', // White background for the icon
    ...(options || {}),
    createConnector: () => farcasterFrameWagmiConnector(),
});

const wallets = [
    metaMaskWallet,
    walletConnectWallet,
    rabbyWallet,
    braveWallet,
    ledgerWallet,
    trustWallet,
    coinbaseWallet,
    rainbowWallet,
    imTokenWallet,
    binanceWallet,
    farcasterRainbowWallet,
];

const socialWallets = [
    particleWallet,
    particleGoogleWallet,
    particleTwitterWallet,
    particleGithubWallet,
    particleAppleWallet,
    particleDiscordWallet,
];

!isMobile() && wallets.push(injectedWallet);

export const wagmiConfig = createConfig({
    chains: [optimism, arbitrum, optimismSepolia, base],
    connectors: connectorsForWallets(
        [
            {
                groupName: 'Wallets',
                wallets,
            },
            {
                groupName: 'Social Login',
                wallets: socialWallets,
            },
        ],
        {
            appName: 'Overtime Sportsbook',
            projectId: import.meta.env.VITE_APP_WALLET_CONNECT_PROJECT_ID || '',
        }
    ),
    transports: {
        [optimism.id]: fallback([http(RPC_LIST.INFURA[NetworkId.OptimismMainnet].http), http()]),
        [arbitrum.id]: fallback([http(RPC_LIST.INFURA[NetworkId.Arbitrum].http), http()]),
        [base.id]: fallback([http(RPC_LIST.INFURA[NetworkId.Base].http), http()]),
        [optimismSepolia.id]: fallback([http(RPC_LIST.INFURA[NetworkId.OptimismSepolia].http), http()]),
    },
});

declare module 'wagmi' {
    interface Register {
        config: typeof wagmiConfig;
    }
}
