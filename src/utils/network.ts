import { SUPPORTED_NETWORKS, SUPPORTED_NETWORKS_PARAMS } from 'constants/network';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { Network } from 'enums/network';
import { localStore } from 'thales-utils';
import { SupportedNetwork } from '../types/network';
import { getCollaterals } from './collaterals';
import { getNavItemFromRoute } from './ui';

export const isNetworkSupported = (networkId: SupportedNetwork): boolean => {
    return !!SUPPORTED_NETWORKS[networkId];
};

export const isTestNetwork = (networkId: SupportedNetwork): boolean => {
    return networkId === Network.OptimismSepolia;
};

export const checkAllowance = async (amount: bigint, token: any, walletAddress: string, spender: string) => {
    try {
        const approved = await token.read.allowance([walletAddress, spender]);
        return approved >= amount;
    } catch (err: any) {
        console.log(err);
        return false;
    }
};

export const getNetworkIconClassNameByNetworkId = (networkId: Network): string => {
    const network = SUPPORTED_NETWORKS_PARAMS[networkId];
    if (network) return network.iconClassName;
    return 'Unknown';
};

export const getNetworkNameByNetworkId = (networkId: Network, shortName = false): string | undefined => {
    const network = SUPPORTED_NETWORKS_PARAMS[networkId];
    return shortName ? network?.shortChainName : network?.chainName;
};

export const isRouteAvailableForNetwork = (route: string, networkId: Network): boolean => {
    const navItem = getNavItemFromRoute(route);
    if (navItem && navItem?.supportedNetworks?.includes(networkId)) return true;
    return false;
};

export const getDefaultCollateralIndexForNetworkId = (networkId: SupportedNetwork): number => {
    const lsSelectedCollateralIndex = localStore.get(`${LOCAL_STORAGE_KEYS.COLLATERAL_INDEX}${networkId}`);
    return lsSelectedCollateralIndex && getCollaterals(networkId).length > Number(lsSelectedCollateralIndex)
        ? Number(lsSelectedCollateralIndex)
        : 0;
};

export const getIsMultiCollateralSupported = (networkId: SupportedNetwork): boolean =>
    getCollaterals(networkId).length > 1;
