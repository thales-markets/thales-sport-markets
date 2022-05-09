import { ethers, Signer } from 'ethers';
import { NetworkSettings } from 'types/network';
import paymentTokenContract from './contracts/paymentTokenContract';
import marketManagerContract from 'utils/contracts/exoticPositionalMarketManagerContract';
import marketDataContract from 'utils/contracts/exoticPositionalMarketDataContract';
import thalesBondsContract from 'utils/contracts/thalesBondsContract';
import tagsContract from 'utils/contracts/exoticPositionalTagsContract';
import exoticUsdContract from 'utils/contracts/exoticUsdContract';
import { NetworkIdByName } from './network';

type NetworkConnector = {
    initialized: boolean;
    provider: ethers.providers.Provider | undefined;
    signer: Signer | undefined;
    setNetworkSettings: (networkSettings: NetworkSettings) => void;
    paymentTokenContract?: ethers.Contract;
    marketManagerContract?: ethers.Contract;
    marketDataContract?: ethers.Contract;
    thalesBondsContract?: ethers.Contract;
    tagsContract?: ethers.Contract;
    exoticUsdContract?: ethers.Contract;
};

// @ts-ignore
const networkConnector: NetworkConnector = {
    initialized: false,

    setNetworkSettings: function (networkSettings: NetworkSettings) {
        this.initialized = true;
        this.signer = networkSettings.signer;
        this.provider = networkSettings.provider;
        this.paymentTokenContract = initializeContract(paymentTokenContract, networkSettings);
        this.marketManagerContract = initializeContract(marketManagerContract, networkSettings);
        this.marketDataContract = initializeContract(marketDataContract, networkSettings);
        this.thalesBondsContract = initializeContract(thalesBondsContract, networkSettings);
        this.tagsContract = initializeContract(tagsContract, networkSettings);
        this.exoticUsdContract = initializeContract(exoticUsdContract, networkSettings);
    },
};

const initializeContract = (contract: any, networkSettings: NetworkSettings) =>
    contract.addresses[networkSettings.networkId || NetworkIdByName.OptimsimMainnet] !== ''
        ? new ethers.Contract(
              contract.addresses[networkSettings.networkId || NetworkIdByName.OptimsimMainnet],
              contract.abi,
              networkConnector.provider
          )
        : undefined;

export default networkConnector;
