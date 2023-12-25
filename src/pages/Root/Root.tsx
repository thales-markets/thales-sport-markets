import { PLAUSIBLE } from 'constants/analytics';
import dotenv from 'dotenv';
import App from 'pages/Root/App';
import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import ParticleProvider from './Provider/ParticleProvider';
import WagmiProvider from './Provider/WagmiProvider';

dotenv.config();

type RootProps = {
    store: Store;
};

// type RpcProvider = {
//     ankr: string;
//     chainnode: string;
//     blast: string;
// };

// const CHAIN_TO_RPC_PROVIDER_NETWORK_NAME: Record<number, RpcProvider> = {
//     [Network.OptimismMainnet]: {
//         ankr: 'optimism',
//         chainnode: 'optimism-mainnet',
//         blast: 'optimism-mainnet',
//     },
//     [Network.OptimismGoerli]: { ankr: 'optimism_testnet', chainnode: 'optimism-goerli', blast: 'optimism-goerli' },
//     [Network.Arbitrum]: { ankr: 'arbitrum', chainnode: 'arbitrum-one', blast: 'arbitrum-one' },
//     [Network.Base]: { ankr: 'base', chainnode: 'base-mainnet', blast: '' },
// };

// const STALL_TIMEOUT = 2000;

// const { chains, provider } = configureChains(
//     [optimism, optimismGoerli, arbitrum, base],
//     [
//         jsonRpcProvider({
//             rpc: (chain) => ({
//                 http: !!CHAIN_TO_RPC_PROVIDER_NETWORK_NAME[chain.id]?.chainnode
//                     ? `https://${CHAIN_TO_RPC_PROVIDER_NETWORK_NAME[chain.id].chainnode}.chainnodes.org/${
//                           process.env.REACT_APP_CHAINNODE_PROJECT_ID
//                       }`
//                     : chain.rpcUrls.default.http[0],
//             }),
//             stallTimeout: STALL_TIMEOUT,
//             priority: 1,
//         }),
//         infuraProvider({
//             apiKey: process.env.REACT_APP_INFURA_PROJECT_ID || '',
//             stallTimeout: STALL_TIMEOUT,
//             priority: process.env.REACT_APP_PRIMARY_PROVIDER_ID === 'INFURA' ? 0 : 2,
//         }),
//         publicProvider({ stallTimeout: STALL_TIMEOUT, priority: 5 }),
//     ]
// );

// const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || '';
// const connectors = connectorsForWallets([
//     {
//         groupName: 'Recommended',
//         wallets: [
//             metaMaskWallet({ projectId, chains }),
//             walletConnectWallet({ projectId, chains }),
//             rabbyWallet({ chains }),
//             braveWallet({ chains }),
//             ledgerWallet({ projectId, chains }),
//             trustWallet({ projectId, chains }),
//             injectedWallet({ chains }),
//             coinbaseWallet({ appName: 'Overtime', chains }),
//             rainbowWallet({ projectId, chains }),
//             imTokenWallet({ projectId, chains }),
//         ],
//     },
// ]);

// const wagmiClient = createClient({
//     autoConnect: true,
//     connectors,
//     provider,
// });

// const theme = getDefaultTheme();
// const customTheme = merge(darkTheme(), { colors: { modalBackground: ThemeMap[theme].background.primary } });


const Root: React.FC<RootProps> = ({ store }) => {
    PLAUSIBLE.enableAutoPageviews();

    return (
        <Provider store={store}>
            <ParticleProvider>
                <WagmiProvider>
                    <App />
                </WagmiProvider>
            </ParticleProvider>
        </Provider>
    );
};

export default Root;
