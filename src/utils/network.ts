import { COLLATERALS_INDEX } from 'constants/currency';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { MAX_GAS_LIMIT, NetworkNameById, SUPPORTED_NETWORKS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { NetworkId } from 'types/network';
import { getNavItemFromRoute } from './ui';
import { getLastSavedOrDefaultStableIndex } from 'redux/modules/parlay';
import { Network } from 'enums/network';

export const hasEthereumInjected = () => !!window.ethereum;

export async function getDefaultNetworkId(): Promise<NetworkId> {
    try {
        if (hasEthereumInjected()) {
            const provider = new ethers.providers.Web3Provider(<any>window.ethereum, 'any');
            const networkId = (await provider.getNetwork()).chainId;
            return (networkId || DEFAULT_NETWORK_ID) as NetworkId;
        }
        return DEFAULT_NETWORK_ID;
    } catch (e) {
        console.log(e);
        return DEFAULT_NETWORK_ID;
    }
}

export const isNetworkSupported = (networkId: number | string): networkId is NetworkId => {
    return networkId in NetworkNameById;
};

export const checkAllowance = async (amount: BigNumber, token: any, walletAddress: string, spender: string) => {
    try {
        const approved = await token.allowance(walletAddress, spender);
        return approved.gte(amount);
    } catch (err: any) {
        console.log(err);
        return false;
    }
};

export const getNetworkIconClassNameByNetworkId = (networkId: NetworkId): string => {
    const network = SUPPORTED_NETWORKS.find((item) => item.chainId == networkId);
    if (network) return network.iconClassName;
    return 'Unknown';
};

export const getNetworkNameByNetworkId = (networkId: NetworkId, shortName = false): string | undefined => {
    const network = SUPPORTED_NETWORKS.find((item) => item.chainId == networkId);
    return shortName ? network?.shortChainName : network?.chainName;
};

export const getDefaultNetworkName = (shortName = false): string => {
    // find should always return Object for default network ID
    const network = SUPPORTED_NETWORKS.find((item) => item.chainId === DEFAULT_NETWORK_ID) || SUPPORTED_NETWORKS[0];
    return shortName ? network?.shortChainName : network?.chainName;
};

export const getNetworkKeyByNetworkId = (networkId: NetworkId): string => {
    const network = SUPPORTED_NETWORKS.find((item) => item.chainId == networkId);
    return network?.chainKey || 'optimism_mainnet';
};

export const isRouteAvailableForNetwork = (route: string, networkId: NetworkId): boolean => {
    const navItem = getNavItemFromRoute(route);
    if (navItem && navItem?.supportedNetworks?.includes(networkId)) return true;
    return false;
};

export const getDefaultCollateralIndexForNetworkId = (networkId: NetworkId) => {
    return networkId == Network.Arbitrum ? COLLATERALS_INDEX.USDC : getLastSavedOrDefaultStableIndex();
};

export const isMultiCollateralSupportedForNetwork = (networkId: NetworkId) => {
    const network = SUPPORTED_NETWORKS.find((item) => item.chainId == networkId && item.isMultiCollateralSupported);
    if (network) return true;
    return false;
};

export const getMaxGasLimitForNetwork = (networkId: NetworkId) => {
    if (networkId == Network.Arbitrum) return undefined;
    return MAX_GAS_LIMIT;
};

export const delay = (interval: number) => {
    return new Promise((resolve) => setTimeout(resolve, interval));
};
