import { GAS_ESTIMATION_BUFFER, ZERO_ADDRESS } from 'constants/network';
import { Network } from 'enums/network';
import { BigNumber, ethers } from 'ethers';
import { TradeData } from '../types/markets';
import { executeBiconomyTransaction } from './biconomy';

export const getSportsAMMV2Transaction: any = async (
    isVoucherSelected: boolean,
    voucherId: number,
    collateralAddress: string,
    isDefaultCollateral: boolean,
    isEth: boolean,
    networkId: Network,
    sportsAMMV2Contract: ethers.Contract,
    overtimeVoucherContract: ethers.Contract,
    tradeData: TradeData[],
    sUSDPaid: BigNumber,
    collateralPaid: BigNumber,
    expectedPayout: BigNumber,
    referral?: string | null,
    additionalSlippage?: BigNumber,
    isAA?: boolean
): Promise<any> => {
    let finalEstimation = null;
    const referralAddress = referral || ZERO_ADDRESS;

    if (isVoucherSelected) {
        if (isAA) {
            return executeBiconomyTransaction(collateralAddress, overtimeVoucherContract, 'tradeWithVoucher', [
                tradeData,
                sUSDPaid,
                expectedPayout,
                additionalSlippage,
                voucherId,
            ]);
        } else {
            if (networkId === Network.OptimismMainnet) {
                const estimation = await overtimeVoucherContract.estimateGas.tradeWithVoucher(
                    tradeData,
                    sUSDPaid,
                    additionalSlippage,
                    expectedPayout,
                    voucherId
                );

                finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.
            }

            return overtimeVoucherContract.buyFromParlayAMMWithVoucher(
                tradeData,
                sUSDPaid,
                additionalSlippage,
                expectedPayout,
                voucherId,
                { gasLimit: finalEstimation }
            );
        }
    }

    if (isAA) {
        return executeBiconomyTransaction(collateralAddress, sportsAMMV2Contract, 'trade', [
            tradeData,
            sUSDPaid,
            expectedPayout,
            additionalSlippage,
            ZERO_ADDRESS,
            referralAddress,
            collateralAddress,
            isEth,
        ]);
    } else {
        if (networkId === Network.OptimismMainnet) {
            const estimation = await sportsAMMV2Contract.estimateGas.trade(
                tradeData,
                sUSDPaid,
                expectedPayout,
                additionalSlippage,
                ZERO_ADDRESS,
                referralAddress,
                isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
                isEth,
                { value: isEth ? collateralPaid : 0 }
            );

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER);
        }
        return sportsAMMV2Contract.trade(
            tradeData,
            sUSDPaid,
            expectedPayout,
            additionalSlippage,
            ZERO_ADDRESS,
            referralAddress,
            isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
            isEth,
            { value: isEth ? collateralPaid : 0, gasLimit: finalEstimation }
        );
    }
};

export const getSportsAMMV2QuoteMethod: any = (
    collateralAddress: string,
    isDefaultCollateral: boolean,
    sportsAMMV2Contract: ethers.Contract,
    tradeData: TradeData[],
    sUSDPaid: BigNumber
) => {
    return sportsAMMV2Contract.tradeQuote(tradeData, sUSDPaid, isDefaultCollateral ? ZERO_ADDRESS : collateralAddress);
};
