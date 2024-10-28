import { GAS_ESTIMATION_BUFFER, ZERO_ADDRESS } from 'constants/network';
import { Network } from 'enums/network';
import { BigNumber, ethers } from 'ethers';
import { ViemContract } from 'types/viem';
import { TradeData } from '../types/markets';
import { executeBiconomyTransaction } from './biconomy';

export const getSportsAMMV2Transaction: any = async (
    collateralAddress: string,
    isDefaultCollateral: boolean,
    isEth: boolean,
    networkId: Network,
    sportsAMMV2Contract: ethers.Contract,
    freeBetHolderContract: ethers.Contract,
    tradeData: TradeData[],
    buyInAmount: BigNumber,
    expectedQuote: BigNumber,
    referral: string | null,
    additionalSlippage: BigNumber,
    isAA: boolean,
    isFreeBet: boolean,
    isStakedThales: boolean,
    stakingThalesBettingProxyContract: ethers.Contract
): Promise<any> => {
    let finalEstimation = null;
    const referralAddress = referral || ZERO_ADDRESS;

    if (isAA) {
        return executeBiconomyTransaction(collateralAddress, sportsAMMV2Contract, 'trade', [
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
            const estimation = await freeBetHolderContract.estimateGas.trade(
                tradeData,
                buyInAmount,
                expectedQuote,
                additionalSlippage,
                referralAddress,
                collateralAddress,
                { value: 0 }
            );

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.

            return freeBetHolderContract.trade(
                tradeData,
                buyInAmount,
                expectedQuote,
                additionalSlippage,
                referralAddress,
                collateralAddress,
                { value: 0, gasLimit: finalEstimation }
            );
        }

        if (isStakedThales && stakingThalesBettingProxyContract) {
            const estimation = await stakingThalesBettingProxyContract.estimateGas.trade(
                tradeData,
                buyInAmount,
                expectedQuote,
                additionalSlippage,
                referralAddress
            );

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.

            return stakingThalesBettingProxyContract.trade(
                tradeData,
                buyInAmount,
                expectedQuote,
                additionalSlippage,
                referralAddress,
                { gasLimit: finalEstimation }
            );
        }

        if (networkId === Network.OptimismMainnet) {
            const estimation = await sportsAMMV2Contract.estimateGas.trade(
                tradeData,
                buyInAmount,
                expectedQuote,
                additionalSlippage,
                referralAddress,
                isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
                isEth,
                { value: isEth ? buyInAmount : 0 }
            );

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.
        }

        return sportsAMMV2Contract.trade(
            tradeData,
            buyInAmount,
            expectedQuote,
            additionalSlippage,
            referralAddress,
            isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
            isEth,
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
