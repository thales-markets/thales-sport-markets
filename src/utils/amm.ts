import { GAS_ESTIMATION_BUFFER, ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { Network } from 'enums/network';
import { getCollateralAddress, getCollateralIndex } from './collaterals';
import { getIsMultiCollateralSupported } from './network';
import { Position } from 'enums/markets';
import { CRYPTO_CURRENCY_MAP } from '../constants/currency';
import { Coins } from '../types/tokens';

export const getAMMSportsTransaction: any = async (
    isVoucherSelected: boolean,
    voucherId: number,
    collateralIndex: number,
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
    let collateralAddress = getCollateralAddress(networkId, collateralIndex);
    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
    const isEth = collateralAddress === ZERO_ADDRESS;

    if (isEth) {
        collateralAddress = getCollateralAddress(
            networkId,
            getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.WETH as Coins)
        );
    }

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

    if (isMultiCollateralSupported && collateralIndex !== 0 && collateralAddress) {
        if (isEth) {
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

export const getSportsAMMQuoteMethod: any = (
    collateralIndex: number,
    networkId: Network,
    sportsAMMContract: ethers.Contract,
    marketAddress: string,
    selectedPosition: Position,
    parsedAmount: BigNumber
) => {
    let collateralAddress = getCollateralAddress(networkId, collateralIndex);
    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
    const isEth = collateralAddress === ZERO_ADDRESS;

    if (isEth) {
        collateralAddress = getCollateralAddress(
            networkId,
            getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.WETH as Coins)
        );
    }

    if (isMultiCollateralSupported && collateralIndex !== 0 && collateralAddress) {
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
