import { STABLE_DECIMALS } from 'constants/currency';
import { DEFAULT_NETWORK, SUPPORTED_NETWORKS, SUPPORTED_NETWORKS_PARAMS } from 'constants/network';
import { BigNumber } from 'ethers';
import { Network } from 'enums/network';
import { getNavItemFromRoute } from './ui';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import localStore from './localStore';
import { getCollaterals } from './collaterals';
import { NetworkParams } from '../types/network';

export const hasEthereumInjected = () => !!window.ethereum;

export const isNetworkSupported = (networkId: Network): boolean => {
    return !!SUPPORTED_NETWORKS[networkId];
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
    const network = SUPPORTED_NETWORKS_PARAMS[networkId];
    if (network) return network.iconClassName;
    return 'Unknown';
};

export const getNetworkNameByNetworkId = (networkId: Network, shortName = false): string | undefined => {
    const network = SUPPORTED_NETWORKS_PARAMS[networkId];
    return shortName ? network?.shortChainName : network?.chainName;
};

export const getDefaultDecimalsForNetwork = (networkId: Network) => {
    if (networkId == Network.ArbitrumOne || networkId === Network.Base) return STABLE_DECIMALS.USDC;
    return STABLE_DECIMALS.sUSD;
};

export const getDefaultNetworkName = (shortName = false): string => {
    // find should always return Object for default network ID
    const network = SUPPORTED_NETWORKS_PARAMS[DEFAULT_NETWORK.networkId];
    return shortName ? network?.shortChainName : network?.chainName;
};

export const getNetworkKeyByNetworkId = (networkId: Network): string => {
    const network = SUPPORTED_NETWORKS_PARAMS[networkId];
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

export const changeNetwork = async (network: NetworkParams, callback?: VoidFunction): Promise<void> => {
    if (hasEthereumInjected()) {
        try {
            await (window.ethereum as any).request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: network.chainId }],
            });
            callback && callback();
        } catch (switchError: any) {
            if (network && switchError.code === 4902) {
                try {
                    await (window.ethereum as any).request({
                        method: 'wallet_addEthereumChain',
                        params: [network],
                    });
                    await (window.ethereum as any).request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: network.chainId }],
                    });
                    callback && callback();
                } catch (addError) {
                    console.log(addError);
                }
            } else {
                console.log(switchError);
            }
        }
    } else {
        callback && callback();
    }
};
