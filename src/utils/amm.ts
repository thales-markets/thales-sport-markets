import { ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { Network } from 'enums/network';
import { getCollateralAddress } from './collaterals';
import { isMultiCollateralSupportedForNetwork } from './network';
import { Position } from 'enums/markets';

const GAS_ESTIMATION_BUFFER = 1.2; // Adding 20% on gas estimation as a buffer. Used only on Optimism

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
        const estimation = await overtimeVoucherContract.estimateGas.buyFromAMMWithVoucher(
            marketAddress,
            selectedPosition,
            parsedAmount,
            voucherId
        );

        finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.
        return overtimeVoucherContract?.buyFromAMMWithVoucher(
            marketAddress,
            selectedPosition,
            parsedAmount,
            voucherId,
            { gasLimit: finalEstimation }
        );
    }

    if (isMultiCollateralSupported && stableIndex !== 0 && collateralAddress) {
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

    const estimation = (await referral)
        ? sportsAMMContract?.estimateGas.buyFromAMMWithReferrer(
              marketAddress,
              selectedPosition,
              parsedAmount,
              ammQuote,
              additionalSlippage,
              referral
          )
        : sportsAMMContract?.estimateGas.buyFromAMM(
              marketAddress,
              selectedPosition,
              parsedAmount,
              ammQuote,
              additionalSlippage
          );

    finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER);

    return referral
        ? sportsAMMContract?.buyFromAMMWithReferrer(
              marketAddress,
              selectedPosition,
              parsedAmount,
              ammQuote,
              additionalSlippage,
              referral,
              { gasLimit: estimation }
          )
        : sportsAMMContract?.buyFromAMM(marketAddress, selectedPosition, parsedAmount, ammQuote, additionalSlippage, {
              gasLimit: estimation,
          });
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
