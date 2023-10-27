import { GAS_ESTIMATION_BUFFER, ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { Network } from 'enums/network';
import { Position } from 'enums/markets';
import { executeBiconomyTransaction } from './biconomy';

export const getAMMSportsTransaction: any = async (
    isVoucherSelected: boolean,
    voucherId: number,
    collateralAddress: string,
    isDefaultCollateral: boolean,
    isEth: boolean,
    networkId: Network,
    sportsAMMContract: ethers.Contract,
    overtimeVoucherContract: ethers.Contract,
    marketAddress: string,
    selectedPosition: Position,
    parsedAmount: BigNumber,
    ammQuote: any,
    referral?: string | null,
    additionalSlippage?: BigNumber,
    isAA?: boolean
): Promise<any> => {
    let finalEstimation = null;

    if (isVoucherSelected) {
        if (isAA) {
            return executeBiconomyTransaction(networkId, overtimeVoucherContract, 'buyFromAMMWithVoucher', [
                marketAddress,
                selectedPosition,
                parsedAmount,
                voucherId,
            ]);
        } else {
            if (networkId === Network.OptimismMainnet) {
                const estimation = await overtimeVoucherContract.estimateGas.buyFromAMMWithVoucher(
                    marketAddress,
                    selectedPosition,
                    parsedAmount,
                    voucherId
                );

                finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.
            }

            return overtimeVoucherContract?.buyFromAMMWithVoucher(
                marketAddress,
                selectedPosition,
                parsedAmount,
                voucherId,
                { gasLimit: finalEstimation }
            );
        }
    }

    if (isDefaultCollateral) {
        if (isAA) {
            return executeBiconomyTransaction(
                networkId,
                sportsAMMContract,
                referral ? 'buyFromAMMWithReferrer' : 'buyFromAMM',
                referral
                    ? [marketAddress, selectedPosition, parsedAmount, ammQuote, additionalSlippage, referral]
                    : [marketAddress, selectedPosition, parsedAmount, ammQuote, additionalSlippage]
            );
        } else {
            if (networkId === Network.OptimismMainnet) {
                const estimation = referral
                    ? await sportsAMMContract?.estimateGas.buyFromAMMWithReferrer(
                          marketAddress,
                          selectedPosition,
                          parsedAmount,
                          ammQuote,
                          additionalSlippage,
                          referral
                      )
                    : await sportsAMMContract?.estimateGas.buyFromAMM(
                          marketAddress,
                          selectedPosition,
                          parsedAmount,
                          ammQuote,
                          additionalSlippage
                      );

                finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER);
            }

            return referral
                ? sportsAMMContract?.buyFromAMMWithReferrer(
                      marketAddress,
                      selectedPosition,
                      parsedAmount,
                      ammQuote,
                      additionalSlippage,
                      referral,
                      { gasLimit: finalEstimation }
                  )
                : sportsAMMContract?.buyFromAMM(
                      marketAddress,
                      selectedPosition,
                      parsedAmount,
                      ammQuote,
                      additionalSlippage,
                      {
                          gasLimit: finalEstimation,
                      }
                  );
        }
    }

    if (isEth) {
        if (isAA) {
            return executeBiconomyTransaction(networkId, sportsAMMContract, 'buyFromAMMWithEthAndReferrer', [
                marketAddress,
                selectedPosition,
                parsedAmount,
                ammQuote,
                additionalSlippage,
                collateralAddress,
                referral || ZERO_ADDRESS,
                { value: ammQuote },
            ]);
        } else {
            if (networkId === Network.OptimismMainnet) {
                const estimation = await sportsAMMContract?.estimateGas.buyFromAMMWithEthAndReferrer(
                    marketAddress,
                    selectedPosition,
                    parsedAmount,
                    ammQuote,
                    additionalSlippage,
                    collateralAddress,
                    referral || ZERO_ADDRESS,
                    { value: ammQuote }
                );

                finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER);
            }

            return sportsAMMContract?.buyFromAMMWithEthAndReferrer(
                marketAddress,
                selectedPosition,
                parsedAmount,
                ammQuote,
                additionalSlippage,
                collateralAddress,
                referral || ZERO_ADDRESS,
                { value: ammQuote, gasLimit: finalEstimation }
            );
        }
    } else {
        if (isAA) {
            return executeBiconomyTransaction(
                networkId,
                sportsAMMContract,
                'buyFromAMMWithDifferentCollateralAndReferrer',
                [
                    marketAddress,
                    selectedPosition,
                    parsedAmount,
                    ammQuote,
                    additionalSlippage,
                    collateralAddress,
                    referral || ZERO_ADDRESS,
                ]
            );
        } else {
            if (networkId === Network.OptimismMainnet) {
                const estimation = await sportsAMMContract?.estimateGas.buyFromAMMWithDifferentCollateralAndReferrer(
                    marketAddress,
                    selectedPosition,
                    parsedAmount,
                    ammQuote,
                    additionalSlippage,
                    collateralAddress,
                    referral || ZERO_ADDRESS
                );

                finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER);
            }

            return sportsAMMContract?.buyFromAMMWithDifferentCollateralAndReferrer(
                marketAddress,
                selectedPosition,
                parsedAmount,
                ammQuote,
                additionalSlippage,
                collateralAddress,
                referral || ZERO_ADDRESS,
                { gasLimit: finalEstimation }
            );
        }
    }
};

export const getSportsAMMQuoteMethod: any = (
    collateralAddress: string,
    isDefaultCollateral: boolean,
    sportsAMMContract: ethers.Contract,
    marketAddress: string,
    selectedPosition: Position,
    parsedAmount: BigNumber
) => {
    return isDefaultCollateral
        ? sportsAMMContract.buyFromAmmQuote(marketAddress, selectedPosition, parsedAmount)
        : sportsAMMContract.buyFromAmmQuoteWithDifferentCollateral(
              marketAddress,
              selectedPosition,
              parsedAmount,
              collateralAddress
          );
};
