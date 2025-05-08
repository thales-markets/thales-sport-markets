import { CustomStyle } from '@particle-network/authkit';
import { WALLETS_LABELS } from 'constants/wallet';

import { NetworkId } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { ParticalTypes, WalletConnections } from 'types/wallet';
import { getNetworkNameByNetworkId } from 'utils/network';
import { Connector } from 'wagmi';

export const getSpecificConnectorFromConnectorsArray = (
    connectors: readonly Connector[],
    name: string
): Connector | undefined => {
    if (name == WalletConnections.WALLET_CONNECT) {
        return connectors.find((connector: any) => connector.id == name && connector.rkDetails.id == name);
    }
    return connectors.find((connector: any) => connector.id == name);
};

export const getOnRamperUrl = (apiKey: string, walletAddress: string, networkId: SupportedNetwork) => {
    return `https://buy.onramper.com?apiKey=${apiKey}&mode=buy&onlyCryptos=${supportedOnramperTokens(
        networkId
    )}&networkWallets=${getNetworkNameByNetworkId(networkId, true)}:${walletAddress}&${ONRAMPER_STYLE}`;
};

const supportedOnramperTokens = (networkId: SupportedNetwork) => {
    const OP_TOKENS =
        'usdc_optimism,usdt_optimism,dai_optimism,op_optimism,eth_optimism,thales_optimism,weth_optimism,deusdc_optimism';
    const ARB_TOKENS =
        'usdc_arbitrum,usdt_arbitrum,dai_arbitrum,arb_arbitrum,eth_arbitrum,weth_arbitrum,deusdc_arbitrum,wbtc_arbitrum';
    const BASE_TOKENS = 'usdc_base,dai_base,cbbtc_base';
    switch (networkId) {
        case NetworkId.OptimismMainnet:
            return OP_TOKENS;
        case NetworkId.Arbitrum:
            return ARB_TOKENS;
        case NetworkId.Base:
            return BASE_TOKENS;
        default:
            return OP_TOKENS + ',' + ARB_TOKENS + ',' + BASE_TOKENS;
    }
};

const ONRAMPER_STYLE =
    'themeName=dark&containerColor=000000ff&primaryColor=c294f5ff&secondaryColor=000000ff&cardColor=1a1a1a&primaryTextColor=ffffff&secondaryTextColor=ffffff&borderRadius=0.5&wgBorderRadius=1';

// light
export const PARTICLE_STYLE: CustomStyle = {
    theme: {
        dark: {
            themeBackgroundColor: '#000000',
            primaryBtnColor: '#000',
            primaryBtnBackgroundColor: '#c294f5',
            secondaryBtnColor: '#fff',
            secondaryBtnBackgroundColor: '#474747',
            textColor: '#fff',
            secondaryTextColor: '#c294f5',
            iconBorderColor: '#000000',
            accentColor: '#c294f5',
            inputBackgroundColor: '#2b2b2c',
            inputBorderColor: '#c294f5',
            inputPlaceholderColor: '#ffffff',
            cardBorderColor: '#000000',
            cardUnclickableBackgroundColor: '#181818',
            cardUnclickableBorderColor: '#c294f5',
            cardDividerColor: '#252525',
            tagBackgroundColor: '#202327',
            modalBackgroundColor: '#212324',
            tipsBackgroundColor: '#eab98159',
        },
    },
    logo: 'https://wallet.particle.network/favicon.ico',
    projectName: 'Particle Auth',
    subtitle: 'Login to App to continue',
    modalWidth: 400,
    modalHeight: 650,
    primaryBtnBorderRadius: '30px',
    modalBorderRadius: '8px',
    cardBorderRadius: '8px',
};

export const getWalletLabel = (id: ParticalTypes | WalletConnections) => {
    const label = WALLETS_LABELS.find((item: any) => item.id == id)?.labelKey;
    return label ? label : '';
};

export const SUPPORTED_NETWORKS_UNIVERSAL_DEPOSIT = [
    { chainId: 1, name: 'Ethereum', iconName: 'eth' },
    { chainId: 101, name: 'Solana', iconName: 'sol' },
    { chainId: 56, name: 'BNB Chain', iconName: 'bnb' },
    { chainId: 42161, name: 'Arbitrum One', iconName: 'arb' },
    { chainId: 10, name: 'Optimism (OP)', iconName: 'op' },
    { chainId: 137, name: 'Polygon', iconName: 'pol' },
    { chainId: 43114, name: 'Avalanche', iconName: 'avax' },
    { chainId: 8453, name: 'Base', iconName: 'base' },
    { chainId: 59144, name: 'Linea', iconName: 'linea' },
    { chainId: 81457, name: 'Blast', iconName: 'blast' },
    { chainId: 80094, name: 'Berachain', iconName: 'bera' },
    { chainId: 169, name: 'Manta Pacific', iconName: 'manta' },
    { chainId: 34443, name: 'Mode', iconName: 'mode' },
    { chainId: 146, name: 'Sonic', iconName: 'sonic' },
    { chainId: 1030, name: 'Conflux eSpace', iconName: 'con' },
    { chainId: 4200, name: 'Merlin', iconName: 'merlin' },
];
