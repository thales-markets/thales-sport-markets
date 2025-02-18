import { ContractType } from 'enums/contract';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { NetworkConfig } from 'types/network';
import { ContractData, ViemContract } from 'types/viem';
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
import sgpTradingProcessor from 'utils/contracts/sgpTradingProcessorContract';
import sportsAMMData from 'utils/contracts/sportsAMMDataContract';
import sportsAMMV2 from 'utils/contracts/sportsAMMV2Contract';
import sportsAMMV2Manager from 'utils/contracts/sportsAMMV2ManagerContract';
import sportsAMMV2ResultManager from 'utils/contracts/sportsAMMV2ResultManagerContract';
import sportsAMMV2RiskManager from 'utils/contracts/sportsAMMV2RiskManagerContract';
import stakingThalesBettingProxy from 'utils/contracts/stakingThalesBettingProxy';
import stakingThales from 'utils/contracts/stakingThalesContract';
import liquidityPoolContractV2 from './contracts/liquidityPoolContractV2';
import resolveBlockerContract from './contracts/resolveBlockerContract';

const prepareContractWithModifiedResponse = (props: { abi: any; address: Address; client: any }) => {
    const contract = getContract(props) as ViemContract;

    if (typeof contract.read !== 'object' || contract.read === null) {
        throw new Error('contract.read must be an object');
    }

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

                if (functionABI) {
                    functionABI.outputs.forEach((output: any, index: number) => {
                        if (output.name === '') return;
                        modifiedResponse[output.name] = functionResponse[index];
                    });
                }

                return modifiedResponse?.length === 1 ? modifiedResponse[0] : modifiedResponse;
            },
        }),
    };
};

const getContractWithModifiedResponse = (contractData: ContractData, networkConfig: NetworkConfig) => {
    if (!networkConfig) return;
    return prepareContractWithModifiedResponse({
        abi: contractData.abi,
        address: contractData.addresses[networkConfig?.networkId],
        client: networkConfig?.client,
    }) as ViemContract;
};

export const getContractInstance = (
    contractName: string,
    networkConfig: NetworkConfig,
    selectedToken?: number,
    lpCollateral?: LiquidityPoolCollateral
) => {
    switch (contractName) {
        case ContractType.LIQUIDITY_POOL_DATA:
            return getContractWithModifiedResponse(liquidityPoolDataContract, networkConfig);
        case ContractType.PRICE_FEED:
            return getContractWithModifiedResponse(priceFeed, networkConfig);
        case ContractType.MULTICOLLATERAL:
            if (selectedToken == undefined || selectedToken == -1) return;
            return getContractWithModifiedResponse(
                multiCollateral[getCollaterals(networkConfig.networkId)[selectedToken]],
                networkConfig
            );
        case ContractType.MULTICOLLATERAL_ON_OFF_RAMP:
            return getContractWithModifiedResponse(multiCollateralOnOffRamp, networkConfig);
        case ContractType.SPORTS_AMM_DATA:
            return getContractWithModifiedResponse(sportsAMMData, networkConfig);
        case ContractType.SPORTS_AMM_V2:
            return getContractWithModifiedResponse(sportsAMMV2, networkConfig);
        case ContractType.SPORTS_AMM_V2_RISK_MANAGER:
            return getContractWithModifiedResponse(sportsAMMV2RiskManager, networkConfig);
        case ContractType.SPORTS_AMM_V2_RESULT_MANAGER:
            return getContractWithModifiedResponse(sportsAMMV2ResultManager, networkConfig);
        case ContractType.LIVE_TRADING_PROCESSOR:
            return getContractWithModifiedResponse(liveTradingProcessor, networkConfig);
        case ContractType.SGP_TRADING_PROCESSOR:
            return getContractWithModifiedResponse(sgpTradingProcessor, networkConfig);
        case ContractType.FREE_BET_HOLDER:
            return getContractWithModifiedResponse(freeBetHolder, networkConfig);
        case ContractType.SPORTS_AMM_V2_MANAGER:
            return getContractWithModifiedResponse(sportsAMMV2Manager, networkConfig);
        case ContractType.MULTICALL:
            return getContractWithModifiedResponse(multiCall, networkConfig);
        case ContractType.STAKING_THALES:
            return getContractWithModifiedResponse(stakingThales, networkConfig);
        case ContractType.STAKING_THALES_BETTING_PROXY:
            return getContractWithModifiedResponse(stakingThalesBettingProxy, networkConfig);
        case ContractType.LIQUIDITY_POOL:
            if (!lpCollateral) return;
            return getContractWithModifiedResponse(liquidityPoolContractV2[lpCollateral], networkConfig);
        case ContractType.RESOLVE_BLOCKER:
            return getContractWithModifiedResponse(resolveBlockerContract, networkConfig);
        default:
            return undefined;
    }
};
