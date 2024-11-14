import { ContractType } from 'enums/contract';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { Address, getContract } from 'viem';
import { getCollaterals } from './collaterals';

export const getContractWithModifiedResponse = async (props: { abi: any; address: Address; client: any }) => {
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
                console.log(`functionResponse ${functionName.toString()}`, functionResponse);

                if (functionABI) {
                    functionABI.outputs.forEach((output: any, index: number) => {
                        if (output.name === '') return;
                        modifiedResponse[output.name] = functionResponse[index];
                    });
                }
                console.log(`Modified Response ${functionName.toString()}`, modifiedResponse);
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
            const liquidityPoolDataContract = await import('utils/contracts/liquidityPoolDataContractV2');
            return (await getContractWithModifiedResponse({
                abi: liquidityPoolDataContract.default.abi,
                address: liquidityPoolDataContract.default.addresses[networkId],
                client,
            })) as ViemContract;
        case ContractType.PRICE_FEED:
            const priceFeed = await import('utils/contracts/priceFeedContract');
            return (await getContractWithModifiedResponse({
                abi: priceFeed.default.abi,
                address: priceFeed.default.addresses[networkId],
                client,
            })) as ViemContract;
        case ContractType.MULTICOLLATERAL:
            const multiCollateral = await import('utils/contracts/multipleCollateralContract');
            if (!selectedToken) return;
            return (await getContractWithModifiedResponse({
                abi: multiCollateral.default[getCollaterals(networkId)[selectedToken]].abi,
                address: multiCollateral.default[getCollaterals(networkId)[selectedToken]].addresses[networkId],
                client,
            })) as ViemContract;
        case ContractType.MULTICOLLATERAL_ON_OFF_RAMP:
            const multiCollateralOnOffRamp = await import('utils/contracts/multiCollateralOnOffRampContract');
            return (await getContractWithModifiedResponse({
                abi: multiCollateralOnOffRamp.default.abi,
                address: multiCollateralOnOffRamp.default.addresses[networkId],
                client,
            })) as ViemContract;
        case ContractType.SPORTS_AMM_DATA:
            const sportsAMM = await import('utils/contracts/sportsAMMDataContract');
            return (await getContractWithModifiedResponse({
                abi: sportsAMM.default.abi,
                address: sportsAMM.default.addresses[networkId],
                client,
            })) as ViemContract;
        case ContractType.SPORTS_AMM_V2:
            const sportsAMMV2 = await import('utils/contracts/sportsAMMV2Contract');
            return (await getContractWithModifiedResponse({
                abi: sportsAMMV2.default.abi,
                address: sportsAMMV2.default.addresses[networkId],
                client,
            })) as ViemContract;
        case ContractType.SPORTS_AMM_V2_RISK_MANAGER:
            const sportsAMMV2RiskManager = await import('utils/contracts/sportsAMMV2RiskManagerContract');
            return (await getContractWithModifiedResponse({
                abi: sportsAMMV2RiskManager.default.abi,
                address: sportsAMMV2RiskManager.default.addresses[networkId],
                client,
            })) as ViemContract;
        case ContractType.LIVE_TRADING_PROCESSOR:
            const liveTradingProcessor = await import('utils/contracts/liveTradingProcessorContract');
            return (await getContractWithModifiedResponse({
                abi: liveTradingProcessor.default.abi,
                address: liveTradingProcessor.default.addresses[networkId],
                client,
            })) as ViemContract;
        case ContractType.FREE_BET_HOLDER:
            const freeBetHolder = await import('utils/contracts/freeBetHolder');
            return (await getContractWithModifiedResponse({
                abi: freeBetHolder.default.abi,
                address: freeBetHolder.default.addresses[networkId],
                client,
            })) as ViemContract;
        case ContractType.SPORTS_AMM_V2_MANAGER:
            const sportsAMMV2Manager = await import('utils/contracts/sportsAMMV2ManagerContract');
            return (await getContractWithModifiedResponse({
                abi: sportsAMMV2Manager.default.abi,
                address: sportsAMMV2Manager.default.addresses[networkId],
                client,
            })) as ViemContract;
        case ContractType.MULTICALL:
            const multiCall = await import('utils/contracts/multiCallContract');
            return (await getContractWithModifiedResponse({
                abi: multiCall.default.abi,
                address: multiCall.default.addresses[networkId],
                client,
            })) as ViemContract;
        case ContractType.STAKING_THALES:
            const stakingThales = await import('utils/contracts/stakingThalesContract');
            return (await getContractWithModifiedResponse({
                abi: stakingThales.default.abi,
                address: stakingThales.default.addresses[networkId],
                client,
            })) as ViemContract;
        case ContractType.STAKING_THALES_BETTING_PROXY:
            const stakingThalesBettingProxy = await import('utils/contracts/stakingThalesBettingProxy');
            return (await getContractWithModifiedResponse({
                abi: stakingThalesBettingProxy.default.abi,
                address: stakingThalesBettingProxy.default.addresses[networkId],
                client,
            })) as ViemContract;
        default:
            return undefined;
    }
};
