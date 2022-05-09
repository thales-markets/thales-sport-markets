import onboard from 'bnc-onboard';
import { Subscriptions } from 'bnc-onboard/dist/src/interfaces';
import { NetworkId } from 'types/network';
import { getInfuraRpcURL, NetworkIdByName } from 'utils/network';
import browserWalletIcon from 'assets/images/browser-wallet.svg';
import disclaimer from 'assets/docs/exotic-markets-disclaimer.pdf';
import i18n from 'i18n';

export const initOnboard = (networkId: NetworkId, subscriptions: Subscriptions) => {
    const infuraRpc = getInfuraRpcURL(networkId);
    const description = i18n.t('common.wallet.disclaimer', { link: disclaimer });

    return onboard({
        hideBranding: true,
        networkId,
        subscriptions,
        darkMode: true,
        walletSelect: {
            description,
            wallets: [
                {
                    name: 'Browser Wallet',
                    iconSrc: browserWalletIcon,
                    type: 'injected',
                    link: 'https://metamask.io',
                    wallet: async (helpers) => {
                        const { createModernProviderInterface } = helpers;
                        const provider = window.ethereum;
                        return {
                            provider,
                            interface: provider ? createModernProviderInterface(provider) : null,
                        };
                    },
                    preferred: true,
                    desktop: true,
                    mobile: true,
                },
                { walletName: 'tally', preferred: true },
                {
                    walletName: 'ledger',
                    rpcUrl: infuraRpc,
                    preferred: true,
                },
                {
                    walletName: 'lattice',
                    appName: 'Thales',
                    rpcUrl: infuraRpc,
                    preferred: true,
                },
                {
                    walletName: 'trezor',
                    appUrl: 'https://thales.markets',
                    email: 'info@thales.markets',
                    rpcUrl: infuraRpc,
                    preferred: true,
                },
                {
                    walletName: 'walletConnect',
                    rpc: {
                        [NetworkIdByName.OptimsimMainnet]: getInfuraRpcURL(NetworkIdByName.OptimsimMainnet),
                        [NetworkIdByName.OptimsimKovan]: getInfuraRpcURL(NetworkIdByName.OptimsimKovan),
                    },
                    preferred: true,
                },
                { walletName: 'coinbase', preferred: true },
                {
                    walletName: 'portis',
                    apiKey: process.env.REACT_APP_PORTIS_APP_ID,
                    preferred: true,
                },
                { walletName: 'trust', rpcUrl: infuraRpc, preferred: true },
                { walletName: 'walletLink', rpcUrl: infuraRpc, preferred: true },
                {
                    walletName: 'torus',
                    preferred: true,
                },
                { walletName: 'status', preferred: true },
                { walletName: 'authereum', preferred: true },
                { walletName: 'imToken', preferred: true },
            ],
        },
        walletCheck: [{ checkName: 'derivationPath' }, { checkName: 'accounts' }, { checkName: 'connect' }],
    });
};
