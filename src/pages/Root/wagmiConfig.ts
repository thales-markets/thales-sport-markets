import { connectorsForWallets } from '@rainbow-me/rainbowkit';
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
import { arbitrum, optimism, optimismSepolia } from 'wagmi/chains';

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
    chains: [optimism, arbitrum, optimismSepolia],
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
            appName: 'Speed Markets',
            projectId: import.meta.env.VITE_APP_WALLET_CONNECT_PROJECT_ID || '',
        }
    ),
    transports: {
        [optimism.id]: fallback([http(RPC_LIST.INFURA[NetworkId.OptimismMainnet]), http()]),
        [arbitrum.id]: fallback([http(RPC_LIST.INFURA[NetworkId.Arbitrum]), http()]),
        // [base.id]: fallback([http(RPC_LIST.INFURA[NetworkId.Base]), http()]),
        // [polygon.id]: fallback([http(RPC_LIST.INFURA[NetworkId.PolygonMainnet]), http()]),
        [optimismSepolia.id]: fallback([http(RPC_LIST.INFURA[NetworkId.OptimismSepolia]), http()]),
    },
});

declare module 'wagmi' {
    interface Register {
        config: typeof wagmiConfig;
    }
}
