import { ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { TradeData } from '../types/markets';
import { executeBiconomyTransaction } from './biconomy';

export const getLiveTradingProcessorTransaction: any = async (
    isVoucherSelected: boolean,
    collateralAddress: string,
    liveTradingProcessorContract: ethers.Contract,
    tradeData: TradeData[],
    sUSDPaid: BigNumber,
    expectedPayout: BigNumber,
    referral?: string | null,
    additionalSlippage?: BigNumber,
    isAA?: boolean
): Promise<any> => {
    const referralAddress = referral || ZERO_ADDRESS;
    if (isVoucherSelected) {
        if (isAA) {
            return executeBiconomyTransaction(collateralAddress, liveTradingProcessorContract, 'requestLiveTrade', [
                tradeData[0].gameId,
                tradeData[0].sportId,
                tradeData[0].typeId,
                tradeData[0].position,
                sUSDPaid,
                expectedPayout,
                additionalSlippage,
                '', // check different recipient for buying with voucher
                referralAddress,
                collateralAddress,
            ]);
        } else {
            return liveTradingProcessorContract.requestLiveTrade(
                tradeData[0].gameId,
                tradeData[0].sportId,
                tradeData[0].typeId,
                tradeData[0].position,
                sUSDPaid,
                expectedPayout,
                additionalSlippage,
                '', // check different recipient for buying with voucher
                referralAddress,
                collateralAddress
            );
        }
    }

    if (isAA) {
        return executeBiconomyTransaction(collateralAddress, liveTradingProcessorContract, 'requestLiveTrade', [
            tradeData[0].gameId,
            tradeData[0].sportId,
            tradeData[0].typeId,
            tradeData[0].position,
            sUSDPaid,
            expectedPayout,
            additionalSlippage,
            ZERO_ADDRESS, // check different recipient for buying with voucher
            referralAddress,
            collateralAddress,
        ]);
    } else {
        return liveTradingProcessorContract.requestLiveTrade(
            tradeData[0].gameId,
            tradeData[0].sportId,
            tradeData[0].typeId,
            tradeData[0].position,
            sUSDPaid,
            expectedPayout,
            additionalSlippage,
            ZERO_ADDRESS, // check different recipient for buying with voucher
            referralAddress,
            collateralAddress
        );
    }
};
