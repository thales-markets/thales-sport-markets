import { Network } from 'enums/network';
import { ethers, Signer } from 'ethers';
import { Coins } from 'thales-utils';
import { NetworkSettings } from 'types/network';
import liquidityPoolDataContract from 'utils/contracts/liquidityPoolDataContractV2';
import sportsAMMDataContract from 'utils/contracts/sportsAMMDataContract';
import sportsAMMV2Contract from 'utils/contracts/sportsAMMV2Contract';
import sportsAMMV2ManagerContract from 'utils/contracts/sportsAMMV2ManagerContract';
import sportsAMMV2RiskManagerContract from 'utils/contracts/sportsAMMV2RiskManagerContract';
import sUSDContract from 'utils/contracts/sUSDContract';
import { FIFAFavoriteTeam } from './contracts/FIFAFavoriteTeam';
import freeBetHolder from './contracts/freeBetHolder';
import liveTradingProcessorContract from './contracts/liveTradingProcessorContract';
import multiCallContract from './contracts/multiCallContract';
import multiCollateralOnOffRampContract from './contracts/multiCollateralOnOffRampContract';
import multipleCollateral from './contracts/multipleCollateralContract';
import priceFeedContract from './contracts/priceFeedContract';
import resolveBlockerContract from './contracts/resolveBlockerContract';
import stakingThalesBettingProxy from './contracts/stakingThalesBettingProxy';
import stakingThalesContract from './contracts/stakingThalesContract';

type NetworkConnector = {
    initialized: boolean;
    provider: ethers.providers.Provider | undefined;
    signer: Signer | undefined;
    setNetworkSettings: (networkSettings: NetworkSettings) => void;
    paymentTokenContract?: ethers.Contract;
    multipleCollateral?: Record<Coins, ethers.Contract | undefined>;
    marketManagerContract?: ethers.Contract;
    marketDataContract?: ethers.Contract;
    exoticUsdContract?: ethers.Contract;
    sUSDContract?: ethers.Contract;
    favoriteTeamContract?: ethers.Contract;
    liquidityPoolDataContract?: ethers.Contract;
    priceFeedContract?: ethers.Contract;
    multiCollateralOnOffRampContract?: ethers.Contract;
    sportsAMMDataContract?: ethers.Contract;
    sportsAMMV2Contract?: ethers.Contract;
    sportsAMMV2RiskManagerContract?: ethers.Contract;
    liveTradingProcessorContract?: ethers.Contract;
    freeBetHolderContract?: ethers.Contract;
    sportsAMMV2ManagerContract?: ethers.Contract;
    multiCallContract?: ethers.Contract;
    stakingThalesContract?: ethers.Contract;
    stakingThalesBettingProxy?: ethers.Contract;
    resolveBlockerContract?: ethers.Contract;
};

// @ts-ignore
const networkConnector: NetworkConnector = {
    initialized: false,
    setNetworkSettings: function (networkSettings: NetworkSettings) {
        this.initialized = true;
        this.signer = networkSettings.signer;
        this.provider = networkSettings.provider;
        this.sUSDContract = initializeContract(sUSDContract, networkSettings);
        this.favoriteTeamContract = initializeContract(FIFAFavoriteTeam, networkSettings);
        this.liquidityPoolDataContract = initializeContract(liquidityPoolDataContract, networkSettings);
        this.priceFeedContract = initializeContract(priceFeedContract, networkSettings);
        this.multiCollateralOnOffRampContract = initializeContract(multiCollateralOnOffRampContract, networkSettings);

        this.multipleCollateral = {
            sUSD: initializeContract(multipleCollateral.sUSD, networkSettings),
            DAI: initializeContract(multipleCollateral.DAI, networkSettings),
            USDC: initializeContract(multipleCollateral.USDC, networkSettings),
            USDCe: initializeContract(multipleCollateral.USDCe, networkSettings),
            USDT: initializeContract(multipleCollateral.USDT, networkSettings),
            OP: initializeContract(multipleCollateral.OP, networkSettings),
            WETH: initializeContract(multipleCollateral.WETH, networkSettings),
            ETH: initializeContract(multipleCollateral.ETH, networkSettings),
            ARB: initializeContract(multipleCollateral.ARB, networkSettings),
            USDbC: initializeContract(multipleCollateral.USDbC, networkSettings),
            THALES: initializeContract(multipleCollateral.THALES, networkSettings),
            sTHALES: initializeContract(stakingThalesContract, networkSettings),
        };
        this.sportsAMMDataContract = initializeContract(sportsAMMDataContract, networkSettings);
        this.sportsAMMV2Contract = initializeContract(sportsAMMV2Contract, networkSettings);
        this.liveTradingProcessorContract = initializeContract(liveTradingProcessorContract, networkSettings);
        this.sportsAMMV2RiskManagerContract = initializeContract(sportsAMMV2RiskManagerContract, networkSettings);
        this.freeBetHolderContract = initializeContract(freeBetHolder, networkSettings);
        this.sportsAMMV2ManagerContract = initializeContract(sportsAMMV2ManagerContract, networkSettings);
        this.multiCallContract = initializeContract(multiCallContract, networkSettings);
        this.stakingThalesContract = initializeContract(stakingThalesContract, networkSettings);
        this.stakingThalesBettingProxy = initializeContract(stakingThalesBettingProxy, networkSettings);
        this.resolveBlockerContract = initializeContract(resolveBlockerContract, networkSettings);
    },
};

const initializeContract = (contract: any, networkSettings: NetworkSettings) => {
    const contractAddress = contract.addresses[networkSettings.networkId || Network.OptimismMainnet];
    return contractAddress !== ''
        ? new ethers.Contract(contractAddress, contract.abi, networkConnector.provider)
        : undefined;
};

export default networkConnector;
