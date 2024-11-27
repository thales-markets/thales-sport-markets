import { ContractType } from 'enums/contract';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { Address, getContract } from 'viem';
import { getCollaterals } from './collaterals';

// Contract import
import freeBetHolder from 'utils/contracts/freeBetHolder';
import liquidityPoolDataContract from 'utils/contracts/liquidityPoolDataContractV2';
import liveTradingProcessor from 'utils/contracts/liveTradingProcessorContract';
import multiCall from 'utils/contracts/multiCallContract';
import multiCollateralOnOffRamp from 'utils/contracts/multiCollateralOnOffRampContract';
import multiCollateral from 'utils/contracts/multipleCollateralContract';
import priceFeed from 'utils/contracts/priceFeedContract';
import sportsAMMData from 'utils/contracts/sportsAMMDataContract';
import sportsAMMV2 from 'utils/contracts/sportsAMMV2Contract';
import sportsAMMV2Manager from 'utils/contracts/sportsAMMV2ManagerContract';
import sportsAMMV2RiskManager from 'utils/contracts/sportsAMMV2RiskManagerContract';
import stakingThalesBettingProxy from 'utils/contracts/stakingThalesBettingProxy';
import stakingThales from 'utils/contracts/stakingThalesContract';

export const getContractWithModifiedResponse = (props: { abi: any; address: Address; client: any }) => {
    const contract = getContract(props) as ViemContract;

    return {
        ...contract,
        read: new Proxy(contract.read, {
            get: (_, functionName) => async (args: any) => {
                const functionABI = props.abi.find((abiFraction: any) => abiFraction.name === functionName);
                const functionResponse: any[] = await contract.read[functionName](args);

                const modifiedResponse = [];

                if (!Array.isArray(functionResponse)) {
                    modifiedResponse[0] = functionResponse;
                } else if (typeof functionResponse === 'object' && functionResponse !== null) {
                    Object.keys(functionResponse).forEach((key: any) => {
                        modifiedResponse[key] = functionResponse[key];
                    });
                } else {
                    modifiedResponse.push(...(functionResponse as any[]));
                }
                // console.log(`functionResponse ${functionName.toString()}`, functionResponse);

                if (functionABI) {
                    functionABI.outputs.forEach((output: any, index: number) => {
                        if (output.name === '') return;
                        modifiedResponse[output.name] = functionResponse[index];
                    });
                }
                // console.log(`Modified Response ${functionName.toString()}`, modifiedResponse);
                return modifiedResponse?.length === 1 ? modifiedResponse[0] : modifiedResponse;
            },
        }),
    };
};

export const getContractInstance = async (
    contractName: string,
    client: any,
    networkId: SupportedNetwork,
    selectedToken?: number
) => {
    switch (contractName) {
        case ContractType.LIQUIDITY_POOL_DATA:
            return getContractWithModifiedResponse({
                abi: liquidityPoolDataContract.abi,
                address: liquidityPoolDataContract.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.PRICE_FEED:
            return getContractWithModifiedResponse({
                abi: priceFeed.abi,
                address: priceFeed.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.MULTICOLLATERAL:
            if (selectedToken == undefined) return;
            return getContractWithModifiedResponse({
                abi: multiCollateral[getCollaterals(networkId)[selectedToken]].abi,
                address: multiCollateral[getCollaterals(networkId)[selectedToken]].addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.MULTICOLLATERAL_ON_OFF_RAMP:
            return getContractWithModifiedResponse({
                abi: multiCollateralOnOffRamp.abi,
                address: multiCollateralOnOffRamp.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.SPORTS_AMM_DATA:
            return getContractWithModifiedResponse({
                abi: sportsAMMData.abi,
                address: sportsAMMData.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.SPORTS_AMM_V2:
            return getContractWithModifiedResponse({
                abi: sportsAMMV2.abi,
                address: sportsAMMV2.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.SPORTS_AMM_V2_RISK_MANAGER:
            return getContractWithModifiedResponse({
                abi: sportsAMMV2RiskManager.abi,
                address: sportsAMMV2RiskManager.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.LIVE_TRADING_PROCESSOR:
            return getContractWithModifiedResponse({
                abi: liveTradingProcessor.abi,
                address: liveTradingProcessor.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.FREE_BET_HOLDER:
            return getContractWithModifiedResponse({
                abi: freeBetHolder.abi,
                address: freeBetHolder.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.SPORTS_AMM_V2_MANAGER:
            return getContractWithModifiedResponse({
                abi: sportsAMMV2Manager.abi,
                address: sportsAMMV2Manager.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.MULTICALL:
            return getContractWithModifiedResponse({
                abi: multiCall.abi,
                address: multiCall.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.STAKING_THALES:
            return getContractWithModifiedResponse({
                abi: stakingThales.abi,
                address: stakingThales.addresses[networkId],
                client,
            }) as ViemContract;
        case ContractType.STAKING_THALES_BETTING_PROXY:
            return getContractWithModifiedResponse({
                abi: stakingThalesBettingProxy.abi,
                address: stakingThalesBettingProxy.addresses[networkId],
                client,
            }) as ViemContract;
        default:
            return undefined;
    }
};
