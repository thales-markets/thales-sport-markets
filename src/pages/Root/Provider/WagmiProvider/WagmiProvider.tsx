import { particleWallet } from '@particle-network/rainbowkit-ext';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { base } from '@rainbow-me/rainbowkit/dist/css/reset.css';
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
import { useMemo } from 'react';
import { configureChains, createClient } from 'wagmi';
import { arbitrum, optimism, optimismGoerli } from 'wagmi/dist/chains';
import { infuraProvider } from 'wagmi/dist/providers/infura';
import { jsonRpcProvider } from 'wagmi/dist/providers/jsonRpc';
import { publicProvider } from 'wagmi/dist/providers/public';

const WagmiProvider: React.FC = () => {
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

    const connectors = useMemo(() => {
        return connectorsForWallets([
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chains]);

    const wagmiClient = createClient({
        autoConnect: true,
        connectors,
        provider,
    });
};

export default WagmiProvider;

