import type { Wallet, WalletDetailsParams } from '@rainbow-me/rainbowkit';
import { Colors } from 'styles/common';
import { createConnector } from 'wagmi';
import { appleIcon, discordIcon, githubIcon, googleIcon, particleIcon, twitterIcon } from './icons';
import { particleWagmiWallet } from './particleWagmiWallet';

export const particleWallet = (): Wallet => ({
    id: 'particle',
    name: 'Particle Wallet',
    iconUrl: async () => particleIcon,
    iconBackground: Colors.WHITE,
    installed: true,
    createConnector: (walletDetails: WalletDetailsParams) =>
        createConnector(
            (config) =>
                ({
                    ...particleWagmiWallet({ socialType: 'particle', id: 'particleWalletSDK' })(config),
                    ...walletDetails,
                } as any)
        ),
});

export const particleGoogleWallet = (): Wallet => ({
    id: 'particle_google',
    name: 'Google',
    iconUrl: async () => googleIcon,
    iconBackground: Colors.WHITE,
    installed: true,
    createConnector: (walletDetails: WalletDetailsParams) =>
        createConnector(
            (config) =>
                ({
                    ...particleWagmiWallet({ socialType: 'google', id: 'particleWalletSDKGoogle' })(config),
                    ...walletDetails,
                } as any)
        ),
});

export const particleTwitterWallet = (): Wallet => ({
    id: 'particle_twitter',
    name: 'Twitter',
    iconUrl: async () => twitterIcon,
    iconBackground: Colors.WHITE,
    installed: true,
    createConnector: (walletDetails: WalletDetailsParams) =>
        createConnector(
            (config) =>
                ({
                    ...particleWagmiWallet({ socialType: 'twitter', id: 'particleWalletSDKTwitter' })(config),
                    ...walletDetails,
                } as any)
        ),
});

export const particleGithubWallet = (): Wallet => ({
    id: 'particle_github',
    name: 'Github',
    iconUrl: async () => githubIcon,
    iconBackground: Colors.WHITE,
    installed: true,
    createConnector: (walletDetails: WalletDetailsParams) =>
        createConnector(
            (config) =>
                ({
                    ...particleWagmiWallet({ socialType: 'github', id: 'particleWalletGithub' })(config),
                    ...walletDetails,
                } as any)
        ),
});

export const particleDiscordWallet = (): Wallet => ({
    id: 'particle_discord',
    name: 'Discord',
    iconUrl: async () => discordIcon,
    iconBackground: Colors.WHITE,
    installed: true,
    createConnector: (walletDetails: WalletDetailsParams) =>
        createConnector(
            (config) =>
                ({
                    ...particleWagmiWallet({ socialType: 'discord', id: 'particleWalletSDKDiscord' })(config),
                    ...walletDetails,
                } as any)
        ),
});

export const particleAppleWallet = (): Wallet => ({
    id: 'particle_apple',
    name: 'Apple',
    iconUrl: async () => appleIcon,
    iconBackground: Colors.WHITE,
    installed: true,
    createConnector: (walletDetails: WalletDetailsParams) =>
        createConnector(
            (config) =>
                ({
                    ...particleWagmiWallet({ socialType: 'apple', id: 'particleWalletSDKApple' })(config),
                    ...walletDetails,
                } as any)
        ),
});
