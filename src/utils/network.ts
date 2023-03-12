import { getContractFactory, predeploys } from '@eth-optimism/contracts';
import { COLLATERALS_INDEX } from 'constants/currency';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { GWEI_UNIT, MAX_GAS_LIMIT, SUPPORTED_NETWORKS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { serializeTransaction, UnsignedTransaction } from 'ethers/lib/utils';
import { NetworkId } from 'types/network';
import networkConnector from 'utils/networkConnector';
import { getNavItemFromRoute } from './ui';
import { getLastSavedOrDefaultStableIndex } from 'redux/modules/parlay';

export const NetworkIdByName: Record<string, NetworkId> = {
    OptimismMainnet: 10,
    Kovan: 42,
    Goerli: 5,
    OptimismGoerli: 420,
    ArbitrumOne: 42161,
};

export const NetworkNameById: Record<NetworkId, string> = {
    10: 'optimism mainnet',
    42: 'kovan',
    5: 'goerli',
    420: 'optimism goerli',
    42161: 'ARBITRUM ONE',
};

export enum Network {
    Mainnet = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Goerli = 5,
    Kovan = 42,
    'Mainnet-Ovm' = 10,
    'Arbitrum' = 42161,
    'Kovan-Ovm' = 69,
    'Goerli-Ovm' = 420,
    'POLYGON-MUMBAI' = 80001,
    'POLYGON-MAINNET' = 137,
}

export const InfuraNetworkNameById: Record<NetworkId, string> = {
    10: 'optimism-mainnet',
    42: 'kovan',
    5: 'goerli',
    420: 'optimism-goerli',
    42161: 'arbitrum-mainnet',
};

export const CollateralByNetworkId: Record<NetworkId, string> = {
    10: 'sUSD',
    42: 'sUSD',
    5: 'sUSD',
    420: 'sUSD',
    42161: 'USDC',
};

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

export const getTransactionPrice = (
    gasPrice: number | null,
    gasLimit: number | null,
    ethPrice: number | null,
    l1Fee?: number | null
) => {
    if (!gasPrice || !gasLimit || !ethPrice) return 0;
    const transsactionPrice = (gasPrice * ethPrice * gasLimit) / GWEI_UNIT;
    const l1TranactionPrice = l1Fee && l1Fee !== null ? (l1Fee * ethPrice) / GWEI_UNIT / GWEI_UNIT : 0;
    return transsactionPrice + l1TranactionPrice;
};

export const gasPriceInWei = (gasPrice: number) => gasPrice * GWEI_UNIT;

export const getInfuraRpcURL = (networkId: NetworkId) => {
    const network = InfuraNetworkNameById[networkId];
    return `https://${network?.toLowerCase()}.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`;
};

export const isNetworkSupported = (networkId: number | string): networkId is NetworkId => {
    return networkId in NetworkNameById;
};

export const formatGwei = (wei: number) => wei / GWEI_UNIT;

export const getL1FeeInWei = async (txRequest: any) => {
    const OVM_GasPriceOracle = getContractFactory('OVM_GasPriceOracle', networkConnector.signer).attach(
        predeploys.OVM_GasPriceOracle
    );
    const unsignedTx = (await networkConnector.signer?.populateTransaction(txRequest)) as UnsignedTransaction;
    if (unsignedTx) {
        const serializedTx = serializeTransaction({
            nonce: unsignedTx.nonce ? parseInt(unsignedTx.nonce.toString(10), 10) : 0,
            value: unsignedTx.value,
            gasPrice: unsignedTx.gasPrice,
            gasLimit: unsignedTx.gasLimit,
            to: unsignedTx.to,
            data: unsignedTx.data,
        });
        const l1FeeInWei = await OVM_GasPriceOracle.getL1Fee(serializedTx);
        return l1FeeInWei.toNumber();
    }
    return null;
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

export const getAreVaultsSupportedForNetworkId = (networkId: NetworkId): boolean => {
    const network = SUPPORTED_NETWORKS.find((item) => item.chainId == networkId);
    if (network) return network.areVaultsSupported;
    return false;
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
