import { Network } from 'enums/network';
import { ethers, Signer } from 'ethers';
import { NetworkSettings } from 'types/network';
import { Coins } from 'types/tokens';
import liquidityPoolContract from 'utils/contracts/liquidityPoolContract';
import liquidityPoolDataContract from 'utils/contracts/liquidityPoolDataContract';
import parlayAMMLiquidityPoolContract from 'utils/contracts/parlayAMMLiquidityPoolContract';
import parlayAMMLiquidityPoolDataContract from 'utils/contracts/parlayAMMLiquidityPoolDataContract';
import parlayMarketDataContract from 'utils/contracts/parlayMarketDataContract';
import sportPositionalMarketDataContract from 'utils/contracts/sportPositionalMarketDataContract';
import sportMarketManagerContract from 'utils/contracts/sportPositionalMarketManagerContract';
import sportsAMMContract from 'utils/contracts/sportsAMMContract';
import sportVaultDataContract from 'utils/contracts/sportVaultDataContract';
import sUSDContract from 'utils/contracts/sUSDContract';
import { FIFAFavoriteTeam } from './contracts/FIFAFavoriteTeam';
import multiCollateralOnOffRampContract from './contracts/multiCollateralOnOffRampContract';
import multipleCollateral from './contracts/multipleCollateralContract';
import overtimeVoucherContract from './contracts/overtimeVoucherContract';
import { overtimeVoucherEscrowContract } from './contracts/overtimeVoucherEscrowContract';
import parlayMarketsAMMContract from './contracts/parlayMarketsAMMContract';
import priceFeedContract from './contracts/priceFeedContract';

type NetworkConnector = {
    initialized: boolean;
    provider: ethers.providers.Provider | undefined;
    signer: Signer | undefined;
    setNetworkSettings: (networkSettings: NetworkSettings) => void;
    paymentTokenContract?: ethers.Contract;
    multipleCollateral?: Record<Coins, ethers.Contract | undefined>;
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
    priceFeedContract?: ethers.Contract;
    multiCollateralOnOffRampContract?: ethers.Contract;
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
        };
    },
};

const initializeContract = (contract: any, networkSettings: NetworkSettings) => {
    const contractAddress = contract.addresses[networkSettings.networkId || Network.OptimismMainnet];
    return contractAddress !== ''
        ? new ethers.Contract(contractAddress, contract.abi, networkConnector.provider)
        : undefined;
};

export default networkConnector;
