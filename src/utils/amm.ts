import { COLLATERAL_INDEX_TO_COLLATERAL, STABLE_DECIMALS } from 'constants/currency';
import { ZERO_ADDRESS } from 'constants/network';
import { Position } from 'constants/options';
import { BigNumber, ethers } from 'ethers';
import { NetworkId } from 'types/network';
import { getCollateralAddress } from './collaterals';
import { MultiSingleTokenQuoteAndBonus, ParlaysMarket } from 'types/markets';
import { roundNumberToDecimals } from './formatters/number';
import { isMultiCollateralSupportedForNetwork, NetworkIdByName } from './network';

export const getAMMSportsTransaction: any = (
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
    const collateralAddress = getCollateralAddress(stableIndex ? stableIndex !== 0 : false, networkId, stableIndex);
    const isMultiCollateralSupported = isMultiCollateralSupportedForNetwork(networkId);

    if (isVoucherSelected) {
        return overtimeVoucherContract?.buyFromAMMWithVoucher(marketAddress, selectedPosition, parsedAmount, voucherId);
    }

    if (isMultiCollateralSupported && stableIndex !== 0 && collateralAddress) {
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
};

export const getMultiAMMSportsTransactions: any = (
    isVoucherSelected: boolean,
    voucherId: number,
    stableIndex: number,
    networkId: NetworkId,
    sportsAMMContract: ethers.Contract,
    overtimeVoucherContract: ethers.Contract,
    markets: ParlaysMarket[],
    tokensAndQuote: Record<string, MultiSingleTokenQuoteAndBonus>,
    referral?: string | null,
    additionalSlippage?: BigNumber,
    providerOptions?: {
        gasLimit: number | null;
    }
): Promise<ethers.ContractTransaction[]> => {
    const collateralAddress = getCollateralAddress(stableIndex ? stableIndex !== 0 : false, networkId, stableIndex);
    const isMultiCollateralSupported = isMultiCollateralSupportedForNetwork(networkId);
    const transactions: any = [];

    markets.forEach((market: ParlaysMarket) => {
        const marketAddress = market.address;
        const selectedPosition = market.position;
        const tokenAmount = tokensAndQuote[marketAddress].tokenAmount ?? 0;
        const ammQuote = tokensAndQuote[marketAddress].ammQuote ?? 0;
        const parsedAmount = ethers.utils.parseEther(roundNumberToDecimals(tokenAmount).toString());

        if (isVoucherSelected) {
            transactions.push(
                overtimeVoucherContract?.buyFromAMMWithVoucher(marketAddress, selectedPosition, parsedAmount, voucherId)
            );
        } else if (isMultiCollateralSupported && stableIndex !== 0 && collateralAddress) {
            transactions.push(
                sportsAMMContract?.buyFromAMMWithDifferentCollateralAndReferrer(
                    marketAddress,
                    selectedPosition,
                    parsedAmount,
                    ammQuote,
                    additionalSlippage,
                    collateralAddress,
                    referral || ZERO_ADDRESS,
                    providerOptions
                )
            );
        } else {
            transactions.push(
                referral
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
                      )
            );
        }
    });

    return transactions;
};

export const getSportsAMMQuoteMethod: any = (
    stableIndex: number,
    networkId: NetworkId,
    sportsAMMContract: ethers.Contract,
    marketAddress: string,
    selectedPosition: Position,
    parsedAmount: BigNumber
) => {
    const collateralAddress = getCollateralAddress(stableIndex ? stableIndex !== 0 : false, networkId, stableIndex);
    const isMultiCollateralSupported = isMultiCollateralSupportedForNetwork(networkId);

    if (isMultiCollateralSupported && stableIndex !== 0 && collateralAddress) {
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

export const getAmountForApproval = (stableIndex: number, amountToApprove: string, networkId: NetworkId) => {
    let collateralDecimals = 18;
    if (networkId === NetworkIdByName.ArbitrumOne) {
        collateralDecimals = 6;
    } else {
        const stable = (COLLATERAL_INDEX_TO_COLLATERAL as any)[stableIndex];

        if ((STABLE_DECIMALS as any)[stable]) {
            collateralDecimals = (STABLE_DECIMALS as any)[stable];
        }
    }
    return ethers.utils.parseUnits(amountToApprove, collateralDecimals);
};
