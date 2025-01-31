import { Network } from 'enums/network';
import { ContractData } from 'types/viem';

// TODO: update this
const sgpTradingProcessorContract: ContractData = {
    addresses: {
        [Network.OptimismMainnet]: '0x',
        [Network.Arbitrum]: '0x',
        [Network.OptimismSepolia]: '0x',
    },
    abi: [],
};

export default sgpTradingProcessorContract;
