import { STABLE_DECIMALS } from 'constants/currency';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { NetworkNameById, SUPPORTED_NETWORKS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { Network } from 'enums/network';
import { getNavItemFromRoute } from './ui';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import localStore from './localStore';
import { getCollaterals } from './collaterals';

export const hasEthereumInjected = () => !!window.ethereum;

export async function getDefaultNetworkId(): Promise<Network> {
    try {
        if (hasEthereumInjected()) {
            const provider = new ethers.providers.Web3Provider(<any>window.ethereum, 'any');
            const networkId = (await provider.getNetwork()).chainId;
            return (networkId || DEFAULT_NETWORK_ID) as Network;
        }
        return DEFAULT_NETWORK_ID;
    } catch (e) {
        console.log(e);
        return DEFAULT_NETWORK_ID;
    }
}

export const isNetworkSupported = (networkId: number | string): networkId is Network => {
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

export const getNetworkIconClassNameByNetworkId = (networkId: Network): string => {
    const network = SUPPORTED_NETWORKS.find((item) => item.chainId == networkId);
    if (network) return network.iconClassName;
    return 'Unknown';
};

export const getNetworkNameByNetworkId = (networkId: Network, shortName = false): string | undefined => {
    const network = SUPPORTED_NETWORKS.find((item) => item.chainId == networkId);
    return shortName ? network?.shortChainName : network?.chainName;
};

export const getDefaultDecimalsForNetwork = (networkId: Network) => {
    if (networkId == Network.ArbitrumOne) return STABLE_DECIMALS.USDC;
    return STABLE_DECIMALS.sUSD;
};

export const getDefaultNetworkName = (shortName = false): string => {
    // find should always return Object for default network ID
    const network = SUPPORTED_NETWORKS.find((item) => item.chainId === DEFAULT_NETWORK_ID) || SUPPORTED_NETWORKS[0];
    return shortName ? network?.shortChainName : network?.chainName;
};

export const getNetworkKeyByNetworkId = (networkId: Network): string => {
    const network = SUPPORTED_NETWORKS.find((item) => item.chainId == networkId);
    return network?.chainKey || 'optimism_mainnet';
};

export const isRouteAvailableForNetwork = (route: string, networkId: Network): boolean => {
    const navItem = getNavItemFromRoute(route);
    if (navItem && navItem?.supportedNetworks?.includes(networkId)) return true;
    return false;
};

export const getDefaultCollateralIndexForNetworkId = (networkId: Network): number => {
    const lsSelectedStableIndex = localStore.get(LOCAL_STORAGE_KEYS.STABLE_INDEX);
    return networkId === Network.ArbitrumOne ? 0 : (lsSelectedStableIndex as number) || 0;
};

export const isMultiCollateralSupportedForNetwork = (networkId: Network) => getCollaterals(networkId).length > 1;
