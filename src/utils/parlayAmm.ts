import { COLLATERALS_INDEX } from 'constants/currency';
import { ZERO_ADDRESS } from 'constants/network';
import { Position } from 'constants/options';
import { BigNumber, ethers } from 'ethers';
import { NetworkId } from 'types/network';
import { getCollateralAddress } from './collaterals';

export const getParlayAMMTransaction: any = (
    isBuy: boolean,
    isVoucherSelected: boolean,
    voucherAddress: number,
    stableIndex: COLLATERALS_INDEX,
    networkId: NetworkId,
    parlayMarketsAMMContract: ethers.Contract,
    marketsAddresses: string[],
    selectedPositions: Position[],
    sUSDPaid: BigNumber,
    expectedPayout: BigNumber,
    referral?: string | null,
    additionalSlippage?: BigNumber
): Promise<ethers.ContractTransaction> => {
    const isNonSusdCollateral = stableIndex !== COLLATERALS_INDEX.sUSD;
    const collateralAddress = getCollateralAddress(isBuy, isNonSusdCollateral, networkId, stableIndex);

    if (isBuy) {
        if (isNonSusdCollateral && collateralAddress) {
            return parlayMarketsAMMContract?.buyFromParlayWithDifferentCollateralAndReferrer(
                marketsAddresses,
                selectedPositions,
                sUSDPaid,
                additionalSlippage,
                expectedPayout,
                collateralAddress,
                referral || ZERO_ADDRESS
            );
        }

        return referral
            ? parlayMarketsAMMContract?.buyFromParlayWithReferrer(
                  marketsAddresses,
                  selectedPositions,
                  sUSDPaid,
                  additionalSlippage,
                  expectedPayout,
                  isVoucherSelected ? voucherAddress : ZERO_ADDRESS,
                  referral
              )
            : parlayMarketsAMMContract?.buyFromParlay(
                  marketsAddresses,
                  selectedPositions,
                  sUSDPaid,
                  additionalSlippage,
                  expectedPayout,
                  isVoucherSelected ? voucherAddress : ZERO_ADDRESS
              );
    } else {
        // Sell not supported yet, this is just placeholder
        return parlayMarketsAMMContract?.buyFromParlay([], [], 0, 0, 0, ZERO_ADDRESS);
    }
};

export const getParlayMarketsAMMQuoteMethod: any = (
    isBuy: boolean,
    stableIndex: COLLATERALS_INDEX,
    networkId: NetworkId,
    parlayMarketsAMMContract: ethers.Contract,
    marketsAddresses: string[],
    selectedPositions: Position[],
    sUSDPaid: BigNumber
) => {
    const isNonSusdCollateral = stableIndex !== COLLATERALS_INDEX.sUSD;
    const collateralAddress = getCollateralAddress(isBuy, isNonSusdCollateral, networkId, stableIndex);

    if (isBuy) {
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
    } else {
        // Sell not supported yet
    }
};
