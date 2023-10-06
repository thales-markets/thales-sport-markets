import { GAS_ESTIMATION_BUFFER, ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { Network } from 'enums/network';
import { getCollateral, getCollateralAddress, getCollateralIndex, getDefaultCollateral } from './collaterals';
import { getIsMultiCollateralSupported } from './network';
import { Position } from 'enums/markets';
import { CRYPTO_CURRENCY_MAP } from '../constants/currency';
import { Coins } from '../types/tokens';

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
    collateralPaid: BigNumber,
    expectedPayout: BigNumber,
    referral?: string | null,
    additionalSlippage?: BigNumber
): Promise<ethers.ContractTransaction> => {
    let finalEstimation = null;
    const isNonDefaultCollateral = getCollateral(networkId, stableIndex) !== getDefaultCollateral(networkId);
    let collateralAddress = getCollateralAddress(networkId, stableIndex);
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

    if (isMultiCollateralSupported && isNonDefaultCollateral && collateralAddress) {
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
    }

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
    let collateralAddress = getCollateralAddress(networkId, stableIndex);
    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
    const isEth = collateralAddress === ZERO_ADDRESS;

    if (isEth) {
        collateralAddress = getCollateralAddress(
            networkId,
            getCollateralIndex(networkId, CRYPTO_CURRENCY_MAP.WETH as Coins)
        );
    }

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
