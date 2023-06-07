import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import App from 'pages/Root/App';
import dotenv from 'dotenv';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';
import '@rainbow-me/rainbowkit/dist/index.css';
import { connectorsForWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import {
    injectedWallet,
    rainbowWallet,
    metaMaskWallet,
    coinbaseWallet,
    walletConnectWallet,
    braveWallet,
    ledgerWallet,
    imTokenWallet,
    trustWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { optimism, optimismGoerli, arbitrum } from 'wagmi/chains';
import { infuraProvider } from 'wagmi/providers/infura';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';
import WalletDisclaimer from 'components/WalletDisclaimer';
import { merge } from 'lodash';

dotenv.config();

type RootProps = {
    store: Store;
};

type RpcProvider = {
    ankr: string;
    chainnode: string;
    blast: string;
};

const CHAIN_TO_RPC_PROVIDER_NETWORK_NAME: Record<number, RpcProvider> = {
    10: {
        ankr: 'optimism',
        chainnode: 'optimism-mainnet',
        blast: 'optimism-mainnet',
    },
    420: { ankr: 'optimism_testnet', chainnode: 'optimism-goerli', blast: 'optimism-goerli' },
    42161: { ankr: 'arbitrum', chainnode: 'arbitrum-one', blast: 'arbitrum-one' },
};

const { chains, provider } = configureChains(
    [optimism, optimismGoerli, arbitrum],
    [
        jsonRpcProvider({
            rpc: (chain) => ({
                http: !CHAIN_TO_RPC_PROVIDER_NETWORK_NAME[chain.id]?.chainnode
                    ? chain.rpcUrls.default.http[0]
                    : `https://${CHAIN_TO_RPC_PROVIDER_NETWORK_NAME[chain.id].chainnode}.chainnodes.org/${
                          process.env.REACT_APP_CHAINNODE_PROJECT_ID
                      }`,
            }),
            stallTimeout: 2000,
        }),
        infuraProvider({ apiKey: process.env.REACT_APP_INFURA_PROJECT_ID || '', stallTimeout: 2000 }),
        publicProvider(),
    ]
);

const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [
            metaMaskWallet({ chains }),
            walletConnectWallet({ chains }),
            braveWallet({ chains }),
            ledgerWallet({ chains }),
            trustWallet({ chains }),
            injectedWallet({ chains }),
            coinbaseWallet({ appName: 'Overtime', chains }),
            rainbowWallet({ chains }),
            imTokenWallet({ chains }),
        ],
    },
]);

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

const instance = createInstance({
    urlBase: 'https://data.thalesmarket.io',
    siteId: process.env.REACT_APP_SITE_ID ? Number(process.env.REACT_APP_SITE_ID) : 6,
    trackerUrl: 'https://data.thalesmarket.io/p.php', // optional, default value: `${urlBase}matomo.php`
    srcUrl: 'https://data.thalesmarket.io/p.js', //
    configurations: {
        disableCookies: true,
        setSecureCookie: true,
        setRequestMethod: 'POST',
    },
    disabled: false, // optional, false by default. Makes all tracking calls no-ops if set to true.
    heartBeat: {
        active: true, // optional, default value: true
        seconds: 10, // optional, default value: `15
    },
    linkTracking: true, // optional, default value: true
});

const customTheme = merge(darkTheme(), { colors: { modalBackground: '#1A1C2B' } });

const Root: React.FC<RootProps> = ({ store }) => {
    return (
        <Provider store={store}>
            <MatomoProvider value={instance}>
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
            </MatomoProvider>
        </Provider>
    );
};

export default Root;
