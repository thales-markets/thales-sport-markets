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
import { base } from 'constants/network';
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
import { arbitrum, optimism, optimismGoerli } from 'wagmi/dist/chains';
import { infuraProvider } from 'wagmi/dist/providers/infura';
import { jsonRpcProvider } from 'wagmi/dist/providers/jsonRpc';
import { publicProvider } from 'wagmi/dist/providers/public';
dotenv.config();

type RootProps = {
    store: Store;
};

type RpcProvider = {
    ankr: string;
    chainnode: string;
    blast: string;
};

const STALL_TIMEOUT = 2000;
const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || '';

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

const theme = getDefaultTheme();
const customTheme = merge(darkTheme(), { colors: { modalBackground: ThemeMap[theme].background.primary } });

const { chains, provider } = configureChains(
    [optimism, optimismGoerli, arbitrum, base],
    [
        jsonRpcProvider({
            rpc: (chain) => ({
                http: !!CHAIN_TO_RPC_PROVIDER_NETWORK_NAME[chain.id]?.chainnode
                    ? `https://${CHAIN_TO_RPC_PROVIDER_NETWORK_NAME[chain.id].chainnode}.chainnodes.org/${
                          process.env.REACT_APP_CHAINNODE_PROJECT_ID
                      }`
                    : chain.rpcUrls.default.http[0],
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
