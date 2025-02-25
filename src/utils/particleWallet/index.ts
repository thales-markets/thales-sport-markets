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
                    ...particleWagmiWallet({ socialType: 'particle', id: 'particleWalletSDK' } as any)(config),
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
                    ...particleWagmiWallet({ socialType: 'google', id: 'google' } as any)(config),
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
                    ...particleWagmiWallet({ socialType: 'twitter', id: 'twitter' } as any)(config),
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
                    ...particleWagmiWallet({ socialType: 'github', id: 'github' } as any)(config),
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
                    ...particleWagmiWallet({ socialType: 'discord', id: 'discord' } as any)(config),
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
                    ...particleWagmiWallet({ socialType: 'apple', id: 'apple' } as any)(config),
                    ...walletDetails,
                } as any)
        ),
});

export const particleEmailWallet = (): Wallet => ({
    id: 'particle_email',
    name: 'Email',
    iconUrl: async () => '',
    iconBackground: Colors.WHITE,
    installed: true,
    createConnector: (walletDetails: WalletDetailsParams) =>
        createConnector(
            (config) =>
                ({
                    ...particleWagmiWallet({ socialType: 'email', id: 'email' } as any)(config),
                    ...walletDetails,
                } as any)
        ),
});

export const particlePhoneWallet = (): Wallet => ({
    id: 'particle_phone',
    name: 'Phone',
    iconUrl: async () => '',
    installed: true,
    iconBackground: Colors.WHITE,
    createConnector: (walletDetails: WalletDetailsParams) =>
        createConnector(
            (config) =>
                ({
                    ...particleWagmiWallet({ socialType: 'phone', id: 'phone' } as any)(config),
                    ...walletDetails,
                } as any)
        ),
});
