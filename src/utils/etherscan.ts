import { NetworkId } from 'types/network';

export const EtherscanNetworkNameById: Record<NetworkId, string> = {
    10: 'optimistic',
    69: 'kovan-optimistic',
};

const getEtherscanBaseURL = (networkId: NetworkId) => {
    const network = EtherscanNetworkNameById[networkId];

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
