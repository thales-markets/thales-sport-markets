import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import App from 'pages/Root/App';
import dotenv from 'dotenv';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';
import '@rainbow-me/rainbowkit/dist/index.css';
import { connectorsForWallets, wallet, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';

dotenv.config();

type RootProps = {
    store: Store;
};

const { chains, provider } = configureChains(
    [chain.optimism],
    [infuraProvider({ apiKey: process.env.REACT_APP_INFURA_PROJECT_ID }), publicProvider()]
);

const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [
            wallet.metaMask({ chains }),
            wallet.walletConnect({ chains }),
            wallet.brave({ chains }),
            wallet.ledger({ chains }),
            wallet.trust({ chains }),
            wallet.coinbase({ appName: 'Overtime', chains }),
            wallet.rainbow({ chains }),
            wallet.imToken({ chains }),
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

const Root: React.FC<RootProps> = ({ store }) => {
    return (
        <Provider store={store}>
            <MatomoProvider value={instance}>
                <WagmiConfig client={wagmiClient}>
                    <RainbowKitProvider chains={chains}>
                        <App />
                    </RainbowKitProvider>
                </WagmiConfig>
            </MatomoProvider>
        </Provider>
    );
};

export default Root;
