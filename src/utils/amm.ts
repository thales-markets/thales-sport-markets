import { COLLATERAL_INDEX_TO_COLLATERAL, STABLE_DECIMALS } from 'constants/currency';
import { ZERO_ADDRESS } from 'constants/network';
import { Position } from 'constants/options';
import { BigNumber, ethers } from 'ethers';
import { NetworkId } from 'types/network';
import { getCollateralAddress } from './collaterals';

export const getAMMSportsTransaction: any = (
    isBuy: boolean,
    isVoucherSelected: boolean,
    voucherId: number,
    stableIndex: number,
    networkId: NetworkId,
    sportsAMMContract: ethers.Contract,
    overtimeVoucherContract: ethers.Contract,
    marketAddress: string,
    selectedPosition: Position,
    parsedAmount: BigNumber,
    ammQuote: any,
    referral?: string | null,
    additionalSlippage?: BigNumber,
    providerOptions?: {
        gasLimit: number | null;
    }
): Promise<ethers.ContractTransaction> => {
    const collateralAddress = getCollateralAddress(
        isBuy,
        stableIndex ? stableIndex !== 0 : false,
        networkId,
        stableIndex
    );

    if (isBuy) {
        if (isVoucherSelected) {
            return overtimeVoucherContract?.buyFromAMMWithVoucher(
                marketAddress,
                selectedPosition,
                parsedAmount,
                voucherId
            );
        }

        if (stableIndex !== 0 && collateralAddress) {
            return sportsAMMContract?.buyFromAMMWithDifferentCollateralAndReferrer(
                marketAddress,
                selectedPosition,
                parsedAmount,
                ammQuote,
                additionalSlippage,
                collateralAddress,
                referral || ZERO_ADDRESS,
                providerOptions
            );
        }

        return referral
            ? sportsAMMContract?.buyFromAMMWithReferrer(
                  marketAddress,
                  selectedPosition,
                  parsedAmount,
                  ammQuote,
                  additionalSlippage,
                  referral,
                  providerOptions
              )
            : sportsAMMContract?.buyFromAMM(
                  marketAddress,
                  selectedPosition,
                  parsedAmount,
                  ammQuote,
                  additionalSlippage,
                  providerOptions
              );
    } else {
        return sportsAMMContract?.sellToAMM(
            marketAddress,
            selectedPosition,
            parsedAmount,
            ammQuote,
            additionalSlippage
        );
    }
};

export const getSportsAMMQuoteMethod: any = (
    isBuy: boolean,
    stableIndex: number,
    networkId: NetworkId,
    sportsAMMContract: ethers.Contract,
    marketAddress: string,
    selectedPosition: Position,
    parsedAmount: BigNumber
) => {
    const collateralAddress = getCollateralAddress(
        isBuy,
        stableIndex ? stableIndex !== 0 : false,
        networkId,
        stableIndex
    );

    if (isBuy) {
        if (stableIndex !== 0 && collateralAddress) {
            return sportsAMMContract.buyFromAmmQuoteWithDifferentCollateral(
                marketAddress,
                selectedPosition,
                parsedAmount,
                collateralAddress
            );
        } else {
            return sportsAMMContract.buyFromAmmQuote(marketAddress, selectedPosition, parsedAmount);
        }
    } else {
        return sportsAMMContract.sellToAmmQuote(marketAddress, selectedPosition, parsedAmount);
    }
};

export const getAmountForApproval = (stableIndex: number, amountToApprove: string) => {
    const stable = (COLLATERAL_INDEX_TO_COLLATERAL as any)[stableIndex];

    let collateralDecimals = 18;

    if ((STABLE_DECIMALS as any)[stable]) collateralDecimals = (STABLE_DECIMALS as any)[stable];

    return ethers.utils.parseUnits(amountToApprove, collateralDecimals);
};
