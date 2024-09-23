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
} from '@rainbow-me/rainbowkit/wallets';
import WalletDisclaimer from 'components/WalletDisclaimer';
import { PLAUSIBLE } from 'constants/analytics';
import { optimismSepolia } from 'constants/network';
import { ThemeMap } from 'constants/ui';
import dotenv from 'dotenv';
import { Network } from 'enums/network';
import { merge } from 'lodash';
import App from 'pages/Root/App';
import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { getDefaultTheme } from 'redux/modules/ui';
import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { arbitrum, optimism } from 'wagmi/dist/chains';
import { infuraProvider } from 'wagmi/dist/providers/infura';
import { jsonRpcProvider } from 'wagmi/dist/providers/jsonRpc';
import { publicProvider } from 'wagmi/dist/providers/public';
dotenv.config();

type RootProps = {
    store: Store;
};

const STALL_TIMEOUT = 2000;
const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || '';

const CHAIN_TO_RPC_PROVIDER_URL: Record<number, string | undefined> = {
    [Network.OptimismMainnet]: process.env.REACT_APP_OPTIMISM_RPC_URL,
    [Network.Arbitrum]: process.env.REACT_APP_ARBITRUM_RPC_URL,
    [Network.Base]: process.env.REACT_APP_BASE_RPC_URL,
};
const isRpcProviderSet = Object.values(CHAIN_TO_RPC_PROVIDER_URL).filter((url) => url && url !== '').length;

const theme = getDefaultTheme();
const customTheme = merge(darkTheme(), { colors: { modalBackground: ThemeMap[theme].background.primary } });

const { chains, provider } = configureChains(
    [optimism, arbitrum, optimismSepolia],
    [
        jsonRpcProvider({
            rpc: (chain) => {
                const rpcProvider = CHAIN_TO_RPC_PROVIDER_URL[chain.id];
                return {
                    http: rpcProvider
                        ? rpcProvider
                        : chain.id === Network.OptimismSepolia
                        ? `https://optimism-sepolia.blastapi.io/${process.env.REACT_APP_BLAST_PROJECT_ID}`
                        : chain.rpcUrls.default.http[0],
                };
            },
            stallTimeout: STALL_TIMEOUT,
            priority: 1,
        }),
        infuraProvider({
            apiKey: '0739756f41e243a5b8388f36aa64ce3e' || '',
            stallTimeout: STALL_TIMEOUT,
            priority: process.env.REACT_APP_PRIMARY_PROVIDER_ID === 'INFURA' && !isRpcProviderSet ? 0 : 2,
        }),
        publicProvider({ stallTimeout: STALL_TIMEOUT, priority: 5 }),
    ]
);

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
            particleWallet({ chains, authType: 'google' }),
            particleWallet({ chains, authType: 'github' }),
            particleWallet({ chains, authType: 'apple' }),
            particleWallet({ chains, authType: 'twitter' }),
            particleWallet({ chains, authType: 'discord' }),
            particleWallet({ chains, authType: 'email' }),
            particleWallet({ chains, authType: 'phone' }),
        ],
    },
]);

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

const Root: React.FC<RootProps> = ({ store }) => {
    PLAUSIBLE.enableAutoPageviews();

    return (
        <Provider store={store}>
            <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider
                    chains={chains}
                    theme={customTheme}
                    appInfo={{
                        appName: 'Overtime',
                        disclaimer: WalletDisclaimer,
                    }}
                >
                    <App />
                </RainbowKitProvider>
            </WagmiConfig>
        </Provider>
    );
};

export default Root;
