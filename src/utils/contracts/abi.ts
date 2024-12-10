import { SupportedNetwork } from 'types/network';

export const getContractAbi = (contract: any, networkId: SupportedNetwork) => {
    return contract.abis && contract.abis[networkId] ? contract.abis[networkId] : contract.abi;
};
