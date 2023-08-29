import { GAS_ESTIMATION_BUFFER, ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { Network } from 'enums/network';
import { getCollateralAddress } from './collaterals';
import { isMultiCollateralSupportedForNetwork } from './network';
import { Position } from 'enums/markets';

export const getAMMSportsTransaction: any = async (
    isVoucherSelected: boolean,
    voucherId: number,
    stableIndex: number,
    networkId: Network,
    sportsAMMContract: ethers.Contract,
    overtimeVoucherContract: ethers.Contract,
    marketAddress: string,
    selectedPosition: Position,
    parsedAmount: BigNumber,
    ammQuote: any,
    referral?: string | null,
    additionalSlippage?: BigNumber
): Promise<ethers.ContractTransaction> => {
    let finalEstimation = null;
    const collateralAddress = getCollateralAddress(networkId, stableIndex);
    const isMultiCollateralSupported = isMultiCollateralSupportedForNetwork(networkId);

    if (isVoucherSelected) {
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

    if (isMultiCollateralSupported && stableIndex !== 0 && collateralAddress) {
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
        : sportsAMMContract?.buyFromAMM(marketAddress, selectedPosition, parsedAmount, ammQuote, additionalSlippage, {
              gasLimit: finalEstimation,
          });
};

export const getAMMSportsEtherspotTransactionInfo: any = (
    isVoucherSelected: boolean,
    voucherId: number,
    stableIndex: number,
    networkId: Network,
    marketAddress: string,
    selectedPosition: Position,
    parsedAmount: BigNumber,
    ammQuote: any,
    referral?: string | null,
    additionalSlippage?: BigNumber
): { methodName: string; data: ReadonlyArray<any> } => {
    const collateralAddress = getCollateralAddress(networkId, stableIndex);
    const isMultiCollateralSupported = isMultiCollateralSupportedForNetwork(networkId);

    if (isVoucherSelected) {
        return {
            methodName: 'buyFromAMMWithVoucher',
            data: [marketAddress, Number(selectedPosition), parsedAmount, voucherId],
        };
    }

    if (isMultiCollateralSupported && stableIndex !== 0 && collateralAddress) {
        return {
            methodName: 'buyFromAMMWithDifferentCollateralAndReferrer',
            data: [
                marketAddress,
                Number(selectedPosition),
                parsedAmount,
                ammQuote,
                additionalSlippage,
                collateralAddress,
                referral || ZERO_ADDRESS,
            ],
        };
    }

    return referral
        ? {
              methodName: 'buyFromAMMWithReferrer',
              data: [marketAddress, Number(selectedPosition), parsedAmount, ammQuote, additionalSlippage, referral],
          }
        : {
              methodName: 'buyFromAMM',
              data: [marketAddress, Number(selectedPosition), parsedAmount, ammQuote, additionalSlippage],
          };
};

export const getSportsAMMQuoteMethod: any = (
    stableIndex: number,
    networkId: Network,
    sportsAMMContract: ethers.Contract,
    marketAddress: string,
    selectedPosition: Position,
    parsedAmount: BigNumber
) => {
    const collateralAddress = getCollateralAddress(networkId, stableIndex);
    const isMultiCollateralSupported = isMultiCollateralSupportedForNetwork(networkId);

    if (isMultiCollateralSupported && stableIndex !== 0 && collateralAddress) {
        return sportsAMMContract.buyFromAmmQuoteWithDifferentCollateral(
            marketAddress,
            selectedPosition,
            parsedAmount,
            collateralAddress
        );
    } else {
        return sportsAMMContract.buyFromAmmQuote(marketAddress, selectedPosition, parsedAmount);
    }
};
