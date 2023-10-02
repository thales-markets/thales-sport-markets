import { GAS_ESTIMATION_BUFFER, ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { Network } from 'enums/network';
import { getCollateral, getCollateralAddress, getDefaultCollateral } from './collaterals';
import { isMultiCollateralSupportedForNetwork } from './network';
import { Position } from 'enums/markets';
import { CRYPTO_CURRENCY_MAP } from '../constants/currency';
import { StablecoinKey } from '../types/tokens';

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

export const getParlayAMMEtherspotTransactionInfo: any = (
    isVoucherSelected: boolean,
    voucherId: number,
    stableIndex: number,
    networkId: Network,
    marketsAddresses: string[],
    selectedPositions: Position[],
    sUSDPaid: BigNumber,
    expectedPayout: BigNumber,
    referral?: string | null,
    additionalSlippage?: BigNumber
): { methodName: string; data: ReadonlyArray<any> } => {
    const isNonSusdCollateral = getCollateral(networkId, stableIndex) !== (CRYPTO_CURRENCY_MAP.sUSD as StablecoinKey);
    const collateralAddress = getCollateralAddress(networkId, stableIndex);
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
