import { COLLATERALS_INDEX } from 'constants/currency';
import { ZERO_ADDRESS } from 'constants/network';
import { Position } from 'constants/options';
import { BigNumber, ethers } from 'ethers';
import { NetworkId } from 'types/network';
import { getCollateralAddress } from './collaterals';

export const getParlayAMMTransaction: any = (
    isVoucherSelected: boolean,
    voucherId: number,
    stableIndex: COLLATERALS_INDEX,
    networkId: NetworkId,
    parlayMarketsAMMContract: ethers.Contract,
    overtimeVoucherContract: ethers.Contract,
    marketsAddresses: string[],
    selectedPositions: Position[],
    sUSDPaid: BigNumber,
    expectedPayout: BigNumber,
    referral?: string | null,
    additionalSlippage?: BigNumber,
    providerOptions?: {
        gasLimit: number | null;
    }
): Promise<ethers.ContractTransaction> => {
    const isNonSusdCollateral = stableIndex !== COLLATERALS_INDEX.sUSD;
    const collateralAddress = getCollateralAddress(isNonSusdCollateral, networkId, stableIndex);

    if (isVoucherSelected) {
        return overtimeVoucherContract?.buyFromParlayAMMWithVoucher(
            marketsAddresses,
            selectedPositions,
            sUSDPaid,
            additionalSlippage,
            expectedPayout,
            voucherId,
            providerOptions
        );
    }

    if (isNonSusdCollateral && collateralAddress) {
        return parlayMarketsAMMContract?.buyFromParlayWithDifferentCollateralAndReferrer(
            marketsAddresses,
            selectedPositions,
            sUSDPaid,
            additionalSlippage,
            expectedPayout,
            collateralAddress,
            referral || ZERO_ADDRESS,
            providerOptions
        );
    }

    return referral
        ? parlayMarketsAMMContract?.buyFromParlayWithReferrer(
              marketsAddresses,
              selectedPositions,
              sUSDPaid,
              additionalSlippage,
              expectedPayout,
              ZERO_ADDRESS,
              referral,
              providerOptions
          )
        : parlayMarketsAMMContract?.buyFromParlay(
              marketsAddresses,
              selectedPositions,
              sUSDPaid,
              additionalSlippage,
              expectedPayout,
              ZERO_ADDRESS,
              providerOptions
          );
};

export const getParlayMarketsAMMQuoteMethod: any = (
    stableIndex: COLLATERALS_INDEX,
    networkId: NetworkId,
    parlayMarketsAMMContract: ethers.Contract,
    marketsAddresses: string[],
    selectedPositions: Position[],
    sUSDPaid: BigNumber
) => {
    const isNonSusdCollateral = stableIndex !== COLLATERALS_INDEX.sUSD;
    const collateralAddress = getCollateralAddress(isNonSusdCollateral, networkId, stableIndex);

    if (isNonSusdCollateral && collateralAddress) {
        return parlayMarketsAMMContract.buyQuoteFromParlayWithDifferentCollateral(
            marketsAddresses,
            selectedPositions,
            sUSDPaid,
            collateralAddress
        );
    } else {
        return parlayMarketsAMMContract.buyQuoteFromParlay(marketsAddresses, selectedPositions, sUSDPaid);
    }
};
