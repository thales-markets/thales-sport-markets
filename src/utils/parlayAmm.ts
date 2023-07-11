import { COLLATERALS_INDEX } from 'constants/currency';
import { ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { Network } from 'enums/network';
import { getCollateralAddress } from './collaterals';
import { isMultiCollateralSupportedForNetwork } from './network';
import { Position } from 'enums/markets';

export const getParlayAMMTransaction: any = (
    isVoucherSelected: boolean,
    voucherId: number,
    stableIndex: COLLATERALS_INDEX,
    networkId: Network,
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
    const isMultiCollateralSupported = isMultiCollateralSupportedForNetwork(networkId);

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

    if (isMultiCollateralSupported && isNonSusdCollateral && collateralAddress) {
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

export const getParlayAMMEtherspotTransactionInfo: any = (
    isVoucherSelected: boolean,
    voucherId: number,
    stableIndex: COLLATERALS_INDEX,
    networkId: Network,
    marketsAddresses: string[],
    selectedPositions: Position[],
    sUSDPaid: BigNumber,
    expectedPayout: BigNumber,
    referral?: string | null,
    additionalSlippage?: BigNumber
): { methodName: string; data: ReadonlyArray<any> } => {
    const isNonSusdCollateral = stableIndex !== COLLATERALS_INDEX.sUSD;
    const collateralAddress = getCollateralAddress(isNonSusdCollateral, networkId, stableIndex);
    const isMultiCollateralSupported = isMultiCollateralSupportedForNetwork(networkId);
    const mappedSelectedPositions = selectedPositions.map((position) => Number(position));

    if (isVoucherSelected) {
        return {
            methodName: 'buyFromParlayAMMWithVoucher',
            data: [marketsAddresses, mappedSelectedPositions, sUSDPaid, additionalSlippage, expectedPayout, voucherId],
        };
    }

    if (isMultiCollateralSupported && isNonSusdCollateral && collateralAddress) {
        return {
            methodName: 'buyFromParlayWithDifferentCollateralAndReferrer',
            data: [
                marketsAddresses,
                mappedSelectedPositions,
                sUSDPaid,
                additionalSlippage,
                expectedPayout,
                collateralAddress,
                referral || ZERO_ADDRESS,
            ],
        };
    }

    return referral
        ? {
              methodName: 'buyFromParlayWithReferrer',
              data: [
                  marketsAddresses,
                  mappedSelectedPositions,
                  sUSDPaid,
                  additionalSlippage,
                  expectedPayout,
                  ZERO_ADDRESS,
                  referral,
              ],
          }
        : {
              methodName: 'buyFromParlay',
              data: [
                  marketsAddresses,
                  mappedSelectedPositions,
                  sUSDPaid,
                  additionalSlippage,
                  expectedPayout,
                  ZERO_ADDRESS,
              ],
          };
};

export const getParlayMarketsAMMQuoteMethod: any = (
    stableIndex: COLLATERALS_INDEX,
    networkId: Network,
    parlayMarketsAMMContract: ethers.Contract,
    marketsAddresses: string[],
    selectedPositions: Position[],
    sUSDPaid: BigNumber
) => {
    const isNonSusdCollateral = stableIndex !== COLLATERALS_INDEX.sUSD;
    const collateralAddress = getCollateralAddress(isNonSusdCollateral, networkId, stableIndex);
    const isMultiCollateralSupported = isMultiCollateralSupportedForNetwork(networkId);

    if (isMultiCollateralSupported && isNonSusdCollateral && collateralAddress) {
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
