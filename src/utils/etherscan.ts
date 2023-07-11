import { Network } from 'enums/network';

const EtherscanNetworkNameById: Record<Network, string> = {
    [Network.Goerli]: 'goerli',
    [Network.OptimismMainnet]: 'optimistic',
    [Network.Kovan]: 'kovan',
    [Network.OptimismKovan]: '',
    [Network.OptimismGoerli]: 'goerli-optimism',
    [Network.ArbitrumOne]: '',
};

const getEtherscanBaseURL = (networkId: Network) => {
    const network = EtherscanNetworkNameById[networkId];

    if (networkId === Network.ArbitrumOne) {
        return 'https://arbiscan.io/';
    }

    return `https://${network?.toLowerCase()}.etherscan.io`;
};

export const getEtherscanTxLink = (networkId: Network, txId: string) => {
    const baseURL = getEtherscanBaseURL(networkId);

    return `${baseURL}/tx/${txId}`;
};

export const getEtherscanAddressLink = (networkId: Network, address: string) => {
    const baseURL = getEtherscanBaseURL(networkId);

    return `${baseURL}/address/${address}`;
};

export const getEtherscanBlockLink = (networkId: Network, block: string) => {
    const baseURL = getEtherscanBaseURL(networkId);

    return `${baseURL}/block/${block}`;
};

export const getEtherscanTokenLink = (networkId: Network, address: string) => {
    const baseURL = getEtherscanBaseURL(networkId);

    return `${baseURL}/token/${address}`;
};
