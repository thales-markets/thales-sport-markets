import { ethers, Signer } from 'ethers';
import { NetworkSettings } from 'types/network';
// import paymentTokenContract from './contracts/paymentTokenContract';
// import marketManagerContract from 'utils/contracts/exoticPositionalMarketManagerContract';
// import marketDataContract from 'utils/contracts/exoticPositionalMarketDataContract';
import sportMarketManagerContract from 'utils/contracts/sportPositionalMarketManagerContract';
import sportMarketDataContract, {
    sportPositionalMarketDataContract,
} from 'utils/contracts/sportPositionalMarketDataContract';
import sportsAMMContract from 'utils/contracts/sportsAMMContract';
import sUSDContract from 'utils/contracts/sUSDContract';
// import thalesBondsContract from 'utils/contracts/thalesBondsContract';
// import tagsContract from 'utils/contracts/exoticPositionalTagsContract';
// import exoticUsdContract from 'utils/contracts/exoticUsdContract';
import { NetworkIdByName } from './network';
import theRundownConsumerContract from 'utils/contracts/theRundownConsumerContract';

type NetworkConnector = {
    initialized: boolean;
    provider: ethers.providers.Provider | undefined;
    signer: Signer | undefined;
    setNetworkSettings: (networkSettings: NetworkSettings) => void;
    paymentTokenContract?: ethers.Contract;
    marketManagerContract?: ethers.Contract;
    marketDataContract?: ethers.Contract;
    sportPositionalMarketDataContract?: ethers.Contract;
    sportMarketManagerContract?: ethers.Contract;
    sportMarketDataContract?: ethers.Contract;
    sportsAMMContract?: ethers.Contract;
    theRundownConsumerContract?: ethers.Contract;
    thalesBondsContract?: ethers.Contract;
    tagsContract?: ethers.Contract;
    exoticUsdContract?: ethers.Contract;
    sUSDContract?: ethers.Contract;
};

// @ts-ignore
const networkConnector: NetworkConnector = {
    initialized: false,
    setNetworkSettings: function (networkSettings: NetworkSettings) {
        this.initialized = true;
        this.signer = networkSettings.signer;
        this.provider = networkSettings.provider;
        // this.paymentTokenContract = initializeContract(paymentTokenContract, networkSettings);
        // this.marketManagerContract = initializeContract(marketManagerContract, networkSettings);
        // this.marketDataContract = initializeContract(marketDataContract, networkSettings);
        this.sportPositionalMarketDataContract = initializeContract(sportPositionalMarketDataContract, networkSettings);
        this.sportMarketManagerContract = initializeContract(sportMarketManagerContract, networkSettings);
        this.sportMarketDataContract = initializeContract(sportMarketDataContract, networkSettings);
        this.theRundownConsumerContract = initializeContract(theRundownConsumerContract, networkSettings);
        this.sportsAMMContract = initializeContract(sportsAMMContract, networkSettings);
        this.sUSDContract = initializeContract(sUSDContract, networkSettings);
        // this.thalesBondsContract = initializeContract(thalesBondsContract, networkSettings);
        // this.tagsContract = initializeContract(tagsContract, networkSettings);
        // this.exoticUsdContract = initializeContract(exoticUsdContract, networkSettings);
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
