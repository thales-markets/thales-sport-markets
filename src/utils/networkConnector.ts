import { ContractType } from 'enums/contract';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContract } from 'viem';
import { getCollaterals } from './collaterals';

export const getContractInstance = async (
    contractName: string,
    client: any,
    networkId: SupportedNetwork,
    selectedToken?: number
) => {
    switch (contractName) {
        case ContractType.LIQUIDITY_POOL_DATA:
            const liquidityPoolDataContract = await import('utils/contracts/liquidityPoolDataContractV2');
            return getContract({
                abi: liquidityPoolDataContract.default.abi,
                address: liquidityPoolDataContract.default.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.PRICE_FEED:
            const priceFeed = await import('utils/contracts/priceFeedContract');
            return getContract({
                abi: priceFeed.default.abi,
                address: priceFeed.default.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.MULTICOLLATERAL:
            const multiCollateral = await import('utils/contracts/multipleCollateralContract');
            if (!selectedToken) return;
            return getContract({
                abi: multiCollateral.default[getCollaterals(networkId)[selectedToken]].abi,
                address: multiCollateral.default[getCollaterals(networkId)[selectedToken]].addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.MULTICOLLATERAL_ON_OFF_RAMP:
            const multiCollateralOnOffRamp = await import('utils/contracts/multiCollateralOnOffRampContract');
            return getContract({
                abi: multiCollateralOnOffRamp.default.abi,
                address: multiCollateralOnOffRamp.default.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.SPORTS_AMM_DATA:
            const sportsAMM = await import('utils/contracts/sportsAMMDataContract');
            return getContract({
                abi: sportsAMM.default.abi,
                address: sportsAMM.default.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.SPORTS_AMM_V2:
            const sportsAMMV2 = await import('utils/contracts/sportsAMMV2Contract');
            return getContract({
                abi: sportsAMMV2.default.abi,
                address: sportsAMMV2.default.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.SPORTS_AMM_V2_RISK_MANAGER:
            const sportsAMMV2RiskManager = await import('utils/contracts/sportsAMMV2RiskManagerContract');
            return getContract({
                abi: sportsAMMV2RiskManager.default.abi,
                address: sportsAMMV2RiskManager.default.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.LIVE_TRADING_PROCESSOR:
            const liveTradingProcessor = await import('utils/contracts/liveTradingProcessorContract');
            return getContract({
                abi: liveTradingProcessor.default.abi,
                address: liveTradingProcessor.default.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.FREE_BET_HOLDER:
            const freeBetHolder = await import('utils/contracts/freeBetHolder');
            return getContract({
                abi: freeBetHolder.default.abi,
                address: freeBetHolder.default.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.SPORTS_AMM_V2_MANAGER:
            const sportsAMMV2Manager = await import('utils/contracts/sportsAMMV2ManagerContract');
            return getContract({
                abi: sportsAMMV2Manager.default.abi,
                address: sportsAMMV2Manager.default.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.MULTICALL:
            const multiCall = await import('utils/contracts/multiCallContract');
            return getContract({
                abi: multiCall.default.abi,
                address: multiCall.default.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.STAKING_THALES:
            const stakingThales = await import('utils/contracts/stakingThalesContract');
            return getContract({
                abi: stakingThales.default.abi,
                address: stakingThales.default.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.STAKING_THALES_BETTING_PROXY:
            const stakingThalesBettingProxy = await import('utils/contracts/stakingThalesBettingProxy');
            return getContract({
                abi: stakingThalesBettingProxy.default.abi,
                address: stakingThalesBettingProxy.default.addresses[networkId],
                client,
            }) as ViemContract;
        default:
            return undefined;
    }
};
