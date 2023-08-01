import { ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { Network } from 'enums/network';
import { getCollateral, getCollateralAddress, getDefaultCollateral } from './collaterals';
import { isMultiCollateralSupportedForNetwork } from './network';
import { Position } from 'enums/markets';

const GAS_ESTIMATION_BUFFER = 1.2; // Adding 20% on gas estimation as a buffer. Used only on Optimism

export const getParlayAMMTransaction: any = async (
    isVoucherSelected: boolean,
    voucherId: number,
    stableIndex: number,
    networkId: Network,
    parlayMarketsAMMContract: ethers.Contract,
    overtimeVoucherContract: ethers.Contract,
    marketsAddresses: string[],
    selectedPositions: Position[],
    sUSDPaid: BigNumber,
    expectedPayout: BigNumber,
    referral?: string | null,
    additionalSlippage?: BigNumber
): Promise<ethers.ContractTransaction> => {
    let finalEstimation = null;
    const isNonDefaultCollateral = getCollateral(networkId, stableIndex) !== getDefaultCollateral(networkId);
    const collateralAddress = getCollateralAddress(networkId, stableIndex);
    const isMultiCollateralSupported = isMultiCollateralSupportedForNetwork(networkId);

    if (isVoucherSelected) {
        const estimation = await overtimeVoucherContract?.estimateGas.buyFromParlayAMMWithVoucher(
            marketsAddresses,
            selectedPositions,
            sUSDPaid,
            additionalSlippage,
            expectedPayout,
            voucherId
        );

        finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.
        return overtimeVoucherContract?.buyFromParlayAMMWithVoucher(
            marketsAddresses,
            selectedPositions,
            sUSDPaid,
            additionalSlippage,
            expectedPayout,
            voucherId,
            { gasLimit: finalEstimation }
        );
    }

    if (isMultiCollateralSupported && isNonDefaultCollateral && collateralAddress) {
        console.log('try');

        const estimation = await parlayMarketsAMMContract?.estimateGas.buyFromParlayWithDifferentCollateralAndReferrer(
            marketsAddresses,
            selectedPositions,
            sUSDPaid,
            additionalSlippage,
            expectedPayout,
            collateralAddress,
            referral || ZERO_ADDRESS
        );

        console.log('estimation: ', estimation);

        finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER);

        return parlayMarketsAMMContract?.buyFromParlayWithDifferentCollateralAndReferrer(
            marketsAddresses,
            selectedPositions,
            sUSDPaid,
            additionalSlippage,
            expectedPayout,
            collateralAddress,
            referral || ZERO_ADDRESS,
            { gasLimit: finalEstimation }
        );
    }

    const estimation = (await referral)
        ? parlayMarketsAMMContract?.estimateGas.buyFromParlayWithReferrer(
              marketsAddresses,
              selectedPositions,
              sUSDPaid,
              additionalSlippage,
              expectedPayout,
              ZERO_ADDRESS,
              referral
          )
        : parlayMarketsAMMContract?.estimateGas.buyFromParlay(
              marketsAddresses,
              selectedPositions,
              sUSDPaid,
              additionalSlippage,
              expectedPayout,
              ZERO_ADDRESS
          );

    finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER);

    return referral
        ? parlayMarketsAMMContract?.buyFromParlayWithReferrer(
              marketsAddresses,
              selectedPositions,
              sUSDPaid,
              additionalSlippage,
              expectedPayout,
              ZERO_ADDRESS,
              referral,
              { gasLimit: finalEstimation }
          )
        : parlayMarketsAMMContract?.buyFromParlay(
              marketsAddresses,
              selectedPositions,
              sUSDPaid,
              additionalSlippage,
              expectedPayout,
              ZERO_ADDRESS,
              { gasLimit: finalEstimation }
          );
};

export const getParlayMarketsAMMQuoteMethod: any = (
    stableIndex: number,
    networkId: Network,
    parlayMarketsAMMContract: ethers.Contract,
    marketsAddresses: string[],
    selectedPositions: Position[],
    sUSDPaid: BigNumber
) => {
    const isNonDefaultCollateral = getCollateral(networkId, stableIndex) !== getDefaultCollateral(networkId);
    const collateralAddress = getCollateralAddress(networkId, stableIndex);
    const isMultiCollateralSupported = isMultiCollateralSupportedForNetwork(networkId);

    if (isMultiCollateralSupported && isNonDefaultCollateral && collateralAddress) {
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
