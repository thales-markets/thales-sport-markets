import onboard from 'bnc-onboard';
import { Subscriptions } from 'bnc-onboard/dist/src/interfaces';
import { NetworkId } from 'types/network';
import { getInfuraRpcURL, NetworkIdByName } from 'utils/network';
import browserWalletIcon from 'assets/images/browser-wallet.svg';
import disclaimer from 'assets/docs/overtime-markets-disclaimer.pdf';
import i18n from 'i18n';

const torusIcon =
    '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"> <path fill="#FFFFFF" d="M364.55,100.266H159.723c-37.708,0-68.275,30.5-68.275,68.126v204.374c0,37.627,30.567,68.127,68.275,68.127 H364.55c37.707,0,68.275-30.5,68.275-68.127V168.392C432.825,130.766,402.257,100.266,364.55,100.266z"/> <g> <path fill="#3D5BA9" d="M358.342,111.736H165.93c-35.422,0-64.136,28.715-64.136,64.137v192.412 c0,35.422,28.714,64.136,64.136,64.136h192.412c35.422,0,64.136-28.714,64.136-64.136V175.873 C422.478,140.451,393.764,111.736,358.342,111.736z M281.195,373.589c-0.022,12.083-9.836,21.854-21.918,21.828h-24.209 c-12.16,0.132-22.125-9.614-22.268-21.772V231.712h-39.404c-12.158,0.131-22.125-9.614-22.268-21.773v-25.914 c0.025-12.082,9.842-21.855,21.924-21.83h86.225c12.082-0.025,21.896,9.748,21.918,21.83V373.589z M333.426,231.208 c-19.078,0.035-34.574-15.399-34.61-34.479c0-18.989,15.35-34.404,34.341-34.479c19.044-0.074,34.543,15.302,34.614,34.343 C367.846,215.637,352.469,231.133,333.426,231.208z"/> <path fill="#FFFFFF" d="M259.277,162.194h-86.225c-12.082-0.025-21.898,9.748-21.924,21.83v25.914 c0.143,12.159,10.109,21.904,22.268,21.773h39.404v141.933c0.143,12.158,10.107,21.904,22.268,21.772h24.209 c12.082,0.025,21.896-9.745,21.918-21.828V184.024C281.173,171.942,271.359,162.169,259.277,162.194z"/> <path fill="#FFFFFF" d="M333.156,162.25c-18.991,0.074-34.341,15.489-34.341,34.479c0.036,19.08,15.532,34.515,34.61,34.479 c19.043-0.075,34.42-15.571,34.345-34.615C367.699,177.552,352.2,162.176,333.156,162.25z"/> </g> </svg>';

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
                        [NetworkIdByName.Kovan]: getInfuraRpcURL(NetworkIdByName.Kovan),
                        [NetworkIdByName.Goerli]: getInfuraRpcURL(NetworkIdByName.Goerli),
                        [NetworkIdByName.OptimismMainnet]: getInfuraRpcURL(NetworkIdByName.OptimismMainnet),
                        [NetworkIdByName.OptimismKovan]: getInfuraRpcURL(NetworkIdByName.OptimismKovan),
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
                    svg: torusIcon,
                },
                { walletName: 'status', preferred: true },
                { walletName: 'authereum', preferred: true },
                { walletName: 'imToken', preferred: true },
            ],
        },
        walletCheck: [{ checkName: 'derivationPath' }, { checkName: 'accounts' }, { checkName: 'connect' }],
    });
};
