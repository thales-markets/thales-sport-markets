import { particleWallet } from '@particle-network/rainbowkit-ext';
import { RainbowKitProvider, connectorsForWallets, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/dist/index.css';
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
} from '@rainbow-me/rainbowkit/dist/wallets/walletConnectors';
import WalletDisclaimer from 'components/WalletDisclaimer';
import { base } from 'constants/network';
import { ThemeMap } from 'constants/ui';
import { Network } from 'enums/network';
import { merge } from 'hammerjs';
import React, { useContext, useMemo } from 'react';
import { getDefaultTheme } from 'redux/modules/ui';
import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { arbitrum, optimism, optimismGoerli } from 'wagmi/dist/chains';
import { infuraProvider } from 'wagmi/dist/providers/infura';
import { jsonRpcProvider } from 'wagmi/dist/providers/jsonRpc';
import { publicProvider } from 'wagmi/dist/providers/public';
import { ParticleContext } from '../ParticleProvider/ParticleProvider';

const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || '';
const STALL_TIMEOUT = 2000;

const theme = getDefaultTheme();
const customTheme = merge(darkTheme(), { colors: { modalBackground: ThemeMap[theme].background.primary } });

type RpcProvider = {
    ankr: string;
    chainnode: string;
    blast: string;
};

const CHAIN_TO_RPC_PROVIDER_NETWORK_NAME: Record<number, RpcProvider> = {
    [Network.OptimismMainnet]: {
        ankr: 'optimism',
        chainnode: 'optimism-mainnet',
        blast: 'optimism-mainnet',
    },
    [Network.OptimismGoerli]: { ankr: 'optimism_testnet', chainnode: 'optimism-goerli', blast: 'optimism-goerli' },
    [Network.Arbitrum]: { ankr: 'arbitrum', chainnode: 'arbitrum-one', blast: 'arbitrum-one' },
    [Network.Base]: { ankr: 'base', chainnode: '', blast: '' },
};

type WagmiProviderProps = {
    children: JSX.Element;
};

const WagmiProvider: React.FC<WagmiProviderProps> = ({ children }) => {
    const particle = useContext(ParticleContext);

    const { chains, provider } = configureChains(
        [optimism, optimismGoerli, arbitrum, base],
        [
            jsonRpcProvider({
                rpc: (chain) => ({
                    http:
                        chain.id === Network.Base
                            ? // Use Ankr as primary RPC provider on Base as Chainnode isn't available
                              `https://rpc.ankr.com/base/${process.env.REACT_APP_ANKR_PROJECT_ID}`
                            : !CHAIN_TO_RPC_PROVIDER_NETWORK_NAME[chain.id]?.chainnode
                            ? chain.rpcUrls.default.http[0]
                            : `https://${CHAIN_TO_RPC_PROVIDER_NETWORK_NAME[chain.id].chainnode}.chainnodes.org/${
                                  process.env.REACT_APP_CHAINNODE_PROJECT_ID
                              }`,
                }),
                stallTimeout: STALL_TIMEOUT,
                priority: 1,
            }),
            infuraProvider({
                apiKey: process.env.REACT_APP_INFURA_PROJECT_ID || '',
                stallTimeout: STALL_TIMEOUT,
                priority: process.env.REACT_APP_PRIMARY_PROVIDER_ID === 'INFURA' ? 0 : 2,
            }),
            publicProvider({ stallTimeout: STALL_TIMEOUT, priority: 5 }),
        ]
    );

    const particleWallets = useMemo(() => {
        return [
            particleWallet({ chains, authType: 'google' }),
            particleWallet({ chains, authType: 'github' }),
            particleWallet({ chains, authType: 'apple' }),
            particleWallet({ chains, authType: 'twitter' }),
            particleWallet({ chains, authType: 'discord' }),
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [particle]);

    const connectors = connectorsForWallets([
        {
            groupName: 'Recommended',
            wallets: [
                metaMaskWallet({ projectId, chains }),
                walletConnectWallet({ projectId, chains }),
                rabbyWallet({ chains }),
                braveWallet({ chains }),
                ledgerWallet({ projectId, chains }),
                trustWallet({ projectId, chains }),
                injectedWallet({ chains }),
                coinbaseWallet({ appName: 'Overtime', chains }),
                rainbowWallet({ projectId, chains }),
                imTokenWallet({ projectId, chains }),
                ...particleWallets,
            ],
        },
    ]);

    const wagmiClient = createClient({
        autoConnect: true,
        connectors,
        provider,
    });

    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider
                chains={chains}
                theme={customTheme}
                appInfo={{
                    appName: 'Overtime',
                    disclaimer: WalletDisclaimer,
                }}
            >
                {children}
            </RainbowKitProvider>
        </WagmiConfig>
    );
};

export default WagmiProvider;
