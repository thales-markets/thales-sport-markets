import { Network } from 'enums/network';
import { NetworkId } from 'types/network';

const EtherscanNetworkNameById: Record<NetworkId, string> = {
    [Network.Goerli]: 'goerli',
    [Network['Mainnet-Ovm']]: 'optimistic',
    [Network.Kovan]: 'kovan',
    [Network['Goerli-Ovm']]: 'goerli-optimism',
    [Network.Arbitrum]: '',
};

const getEtherscanBaseURL = (networkId: NetworkId) => {
    const network = EtherscanNetworkNameById[networkId];

    if (networkId === Network.Arbitrum) {
        return 'https://arbiscan.io/';
    }

    return `https://${network?.toLowerCase()}.etherscan.io`;
};

export const getEtherscanTxLink = (networkId: NetworkId, txId: string) => {
    const baseURL = getEtherscanBaseURL(networkId);

    return `${baseURL}/tx/${txId}`;
};

export const getEtherscanAddressLink = (networkId: NetworkId, address: string) => {
    const baseURL = getEtherscanBaseURL(networkId);

    return `${baseURL}/address/${address}`;
};

export const getEtherscanBlockLink = (networkId: NetworkId, block: string) => {
    const baseURL = getEtherscanBaseURL(networkId);

    return `${baseURL}/block/${block}`;
};

export const getEtherscanTokenLink = (networkId: NetworkId, address: string) => {
    const baseURL = getEtherscanBaseURL(networkId);

    return `${baseURL}/token/${address}`;
};
