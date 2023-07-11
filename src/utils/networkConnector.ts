import { ethers, Signer } from 'ethers';
import { NetworkSettings } from 'types/network';
import sportMarketManagerContract from 'utils/contracts/sportPositionalMarketManagerContract';
import sportPositionalMarketDataContract from 'utils/contracts/sportPositionalMarketDataContract';
import sportsAMMContract from 'utils/contracts/sportsAMMContract';
import sUSDContract from 'utils/contracts/sUSDContract';
import multipleCollateral from './contracts/multipleCollateralContract';
import overtimeVoucherContract from './contracts/overtimeVoucherContract';
import parlayMarketsAMMContract from './contracts/parlayMarketsAMMContract';
import { FIFAFavoriteTeam } from './contracts/FIFAFavoriteTeam';
import liquidityPoolContract from 'utils/contracts/liquidityPoolContract';
import { overtimeVoucherEscrowContract } from './contracts/overtimeVoucherEscrowContract';
import sportVaultDataContract from 'utils/contracts/sportVaultDataContract';
import liquidityPoolDataContract from 'utils/contracts/liquidityPoolDataContract';
import parlayMarketDataContract from 'utils/contracts/parlayMarketDataContract';
import parlayAMMLiquidityPoolContract from 'utils/contracts/parlayAMMLiquidityPoolContract';
import parlayAMMLiquidityPoolDataContract from 'utils/contracts/parlayAMMLiquidityPoolDataContract';
import { Network } from 'enums/network';

type NetworkConnector = {
    initialized: boolean;
    provider: ethers.providers.Provider | undefined;
    signer: Signer | undefined;
    setNetworkSettings: (networkSettings: NetworkSettings) => void;
    paymentTokenContract?: ethers.Contract;
    multipleCollateral?: Array<ethers.Contract | undefined>;
    marketManagerContract?: ethers.Contract;
    marketDataContract?: ethers.Contract;
    sportPositionalMarketDataContract?: ethers.Contract;
    sportMarketManagerContract?: ethers.Contract;
    sportsAMMContract?: ethers.Contract;
    exoticUsdContract?: ethers.Contract;
    sUSDContract?: ethers.Contract;
    overtimeVoucherContract?: ethers.Contract;
    overtimeVoucherEscrowContract?: ethers.Contract;
    parlayMarketsAMMContract?: ethers.Contract;
    favoriteTeamContract?: ethers.Contract;
    liquidityPoolContract?: ethers.Contract;
    sportVaultDataContract?: ethers.Contract;
    liquidityPoolDataContract?: ethers.Contract;
    parlayMarketDataContract?: ethers.Contract;
    parlayAMMLiquidityPoolContract?: ethers.Contract;
    parlayAMMLiquidityPoolDataContract?: ethers.Contract;
};

// @ts-ignore
const networkConnector: NetworkConnector = {
    initialized: false,
    setNetworkSettings: function (networkSettings: NetworkSettings) {
        this.initialized = true;
        this.signer = networkSettings.signer;
        this.provider = networkSettings.provider;
        this.sportPositionalMarketDataContract = initializeContract(sportPositionalMarketDataContract, networkSettings);
        this.sportMarketManagerContract = initializeContract(sportMarketManagerContract, networkSettings);
        this.sportsAMMContract = initializeContract(sportsAMMContract, networkSettings);
        this.sUSDContract = initializeContract(sUSDContract, networkSettings);
        this.overtimeVoucherContract = initializeContract(overtimeVoucherContract, networkSettings);
        this.overtimeVoucherEscrowContract = initializeContract(overtimeVoucherEscrowContract, networkSettings);
        this.parlayMarketsAMMContract = initializeContract(parlayMarketsAMMContract, networkSettings);
        this.favoriteTeamContract = initializeContract(FIFAFavoriteTeam, networkSettings);
        this.liquidityPoolContract = initializeContract(liquidityPoolContract, networkSettings);
        this.sportVaultDataContract = initializeContract(sportVaultDataContract, networkSettings);
        this.liquidityPoolDataContract = initializeContract(liquidityPoolDataContract, networkSettings);
        this.parlayMarketDataContract = initializeContract(parlayMarketDataContract, networkSettings);
        this.parlayAMMLiquidityPoolContract = initializeContract(parlayAMMLiquidityPoolContract, networkSettings);
        this.parlayAMMLiquidityPoolDataContract = initializeContract(
            parlayAMMLiquidityPoolDataContract,
            networkSettings
        );

        this.multipleCollateral = [
            initializeContract(multipleCollateral['sUSD'], networkSettings),
            initializeContract(multipleCollateral['DAI'], networkSettings),
            initializeContract(multipleCollateral['USDC'], networkSettings),
            initializeContract(multipleCollateral['USDT'], networkSettings),
        ];
    },
};

const initializeContract = (contract: any, networkSettings: NetworkSettings) => {
    const contractAddress = contract.addresses[networkSettings.networkId || Network.OptimismMainnet];
    return contractAddress !== ''
        ? new ethers.Contract(contractAddress, contract.abi, networkConnector.provider)
        : undefined;
};

export default networkConnector;
