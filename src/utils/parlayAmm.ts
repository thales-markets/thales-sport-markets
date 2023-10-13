import { GAS_ESTIMATION_BUFFER, ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { Network } from 'enums/network';
import { Position } from 'enums/markets';

export const getParlayAMMTransaction: any = async (
    isVoucherSelected: boolean,
    voucherId: number,
    collateralAddress: string,
    isDefaultCollateral: boolean,
    isEth: boolean,
    networkId: Network,
    parlayMarketsAMMContract: ethers.Contract,
    overtimeVoucherContract: ethers.Contract,
    marketsAddresses: string[],
    selectedPositions: Position[],
    sUSDPaid: BigNumber,
    collateralPaid: BigNumber,
    expectedPayout: BigNumber,
    referral?: string | null,
    additionalSlippage?: BigNumber
): Promise<ethers.ContractTransaction> => {
    let finalEstimation = null;

    if (isVoucherSelected) {
        if (networkId === Network.OptimismMainnet) {
            const estimation = await overtimeVoucherContract?.estimateGas.buyFromParlayAMMWithVoucher(
                marketsAddresses,
                selectedPositions,
                sUSDPaid,
                additionalSlippage,
                expectedPayout,
                voucherId
            );

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.
        }

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

    if (isDefaultCollateral) {
        if (networkId === Network.OptimismMainnet) {
            const estimation = referral
                ? await parlayMarketsAMMContract?.estimateGas.buyFromParlayWithReferrer(
                      marketsAddresses,
                      selectedPositions,
                      sUSDPaid,
                      additionalSlippage,
                      expectedPayout,
                      ZERO_ADDRESS,
                      referral
                  )
                : await parlayMarketsAMMContract?.estimateGas.buyFromParlay(
                      marketsAddresses,
                      selectedPositions,
                      sUSDPaid,
                      additionalSlippage,
                      expectedPayout,
                      ZERO_ADDRESS
                  );

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER);
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
    }

    if (isEth) {
        if (networkId === Network.OptimismMainnet) {
            const estimation = await parlayMarketsAMMContract?.estimateGas.buyFromParlayWithEth(
                marketsAddresses,
                selectedPositions,
                sUSDPaid,
                additionalSlippage,
                expectedPayout,
                collateralAddress,
                referral || ZERO_ADDRESS,
                { value: collateralPaid }
            );

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER);
        }

        return parlayMarketsAMMContract?.buyFromParlayWithEth(
            marketsAddresses,
            selectedPositions,
            sUSDPaid,
            additionalSlippage,
            expectedPayout,
            collateralAddress,
            referral || ZERO_ADDRESS,
            { value: collateralPaid, gasLimit: finalEstimation }
        );
    } else {
        if (networkId === Network.OptimismMainnet) {
            const estimation = await parlayMarketsAMMContract?.estimateGas.buyFromParlayWithDifferentCollateralAndReferrer(
                marketsAddresses,
                selectedPositions,
                sUSDPaid,
                additionalSlippage,
                expectedPayout,
                collateralAddress,
                referral || ZERO_ADDRESS
            );

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER);
        }

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
};

export const getParlayMarketsAMMQuoteMethod: any = (
    collateralAddress: string,
    isDefaultCollateral: boolean,
    parlayMarketsAMMContract: ethers.Contract,
    marketsAddresses: string[],
    selectedPositions: Position[],
    sUSDPaid: BigNumber
) => {
    return isDefaultCollateral
        ? parlayMarketsAMMContract.buyQuoteFromParlay(marketsAddresses, selectedPositions, sUSDPaid)
        : parlayMarketsAMMContract.buyQuoteFromParlayWithDifferentCollateral(
              marketsAddresses,
              selectedPositions,
              sUSDPaid,
              collateralAddress
          );
};
