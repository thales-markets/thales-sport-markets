import { COLLATERALS_INDEX } from 'constants/currency';
import { Position } from 'constants/options';
import { BigNumber, ethers } from 'ethers';
import { NetworkId } from 'types/network';
import { getCollateralAddress } from './collaterals';

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
        // Not supported yet
    }
};
