import { Position } from 'constants/options';
import { BigNumber, ethers } from 'ethers';
import { NetworkId } from 'types/network';
import { getCollateralAddress } from './collaterals';

export const getAMMSportsTransaction: any = (
    isBuy: boolean,
    stableIndex: number,
    networkId: NetworkId,
    sportsAMMContract: ethers.Contract,
    marketAddress: string,
    selectedPosition: Position,
    parsedAmount: BigNumber,
    ammQuote: any,
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
        if (stableIndex !== 0 && collateralAddress) {
            return sportsAMMContract?.buyFromAMMWithDifferentCollateral(
                marketAddress,
                selectedPosition,
                parsedAmount,
                ammQuote,
                additionalSlippage,
                collateralAddress,
                providerOptions
            );
        }

        return sportsAMMContract?.buyFromAMM(
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
