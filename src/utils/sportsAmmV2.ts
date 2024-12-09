import { GAS_ESTIMATION_BUFFER, ZERO_ADDRESS } from 'constants/network';
import { Network } from 'enums/network';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { Address, Client, encodeFunctionData } from 'viem';
import { estimateGas } from 'viem/actions';
import { TradeData } from '../types/markets';
import { executeBiconomyTransaction } from './biconomy';

export const getSportsAMMV2Transaction: any = async (
    collateralAddress: string,
    isDefaultCollateral: boolean,
    isEth: boolean,
    networkId: SupportedNetwork,
    sportsAMMV2Contract: ViemContract,
    freeBetHolderContract: ViemContract,
    tradeData: TradeData[],
    buyInAmount: bigint,
    expectedQuote: bigint,
    referral: string | null,
    additionalSlippage: bigint,
    isAA: boolean,
    isFreeBet: boolean,
    isStakedThales: boolean,
    stakingThalesBettingProxyContract: ViemContract,
    client: Client
): Promise<any> => {
    let finalEstimation = null;
    const referralAddress = referral || ZERO_ADDRESS;

    if (isAA) {
        return executeBiconomyTransaction(networkId, collateralAddress, sportsAMMV2Contract, 'trade', [
            tradeData,
            buyInAmount,
            expectedQuote,
            additionalSlippage,
            referralAddress,
            collateralAddress,
            isEth,
        ]);
    } else {
        if (isFreeBet && freeBetHolderContract) {
            const encodedData = encodeFunctionData({
                abi: freeBetHolderContract.abi,
                functionName: 'trade',
                args: [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress, collateralAddress],
            });

            const estimation = await estimateGas(client, {
                to: freeBetHolderContract.address as Address,
                data: encodedData,
            });

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.

            return freeBetHolderContract.write.trade(
                [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress, collateralAddress],
                { value: 0, gasLimit: finalEstimation }
            );
        }

        if (isStakedThales && stakingThalesBettingProxyContract) {
            const encodedData = encodeFunctionData({
                abi: stakingThalesBettingProxyContract.abi,
                functionName: 'trade',
                args: [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress],
            });

            const estimation = await estimateGas(client, {
                to: stakingThalesBettingProxyContract.address as Address,
                data: encodedData,
            });

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.

            return stakingThalesBettingProxyContract.write.trade(
                [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress],
                { gasLimit: finalEstimation }
            );
        }

        if (networkId === Network.OptimismMainnet) {
            const encodedData = encodeFunctionData({
                abi: sportsAMMV2Contract.abi,
                functionName: 'trade',
                args: [
                    tradeData,
                    buyInAmount,
                    expectedQuote,
                    additionalSlippage,
                    referralAddress,
                    collateralAddress,
                    isEth,
                ],
            });

            const estimation = await estimateGas(client, {
                to: sportsAMMV2Contract.address as Address,
                data: encodedData,
                value: isEth ? buyInAmount : undefined,
            });

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.
        }

        return sportsAMMV2Contract.write.trade(
            [
                tradeData,
                buyInAmount,
                expectedQuote,
                additionalSlippage,
                referralAddress,
                isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
                isEth,
            ],
            { value: isEth ? buyInAmount : 0, gasLimit: finalEstimation }
        );
    }
};

export const getSportsAMMV2QuoteMethod: any = (
    collateralAddress: string,
    isDefaultCollateral: boolean,
    sportsAMMV2Contract: ViemContract,
    tradeData: TradeData[],
    buyInAmount: bigint
) => {
    return sportsAMMV2Contract.read.tradeQuote([
        tradeData,
        buyInAmount,
        isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
        false,
    ]);
};
