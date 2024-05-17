import { ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { TradeData } from '../types/markets';
import { executeBiconomyTransaction } from './biconomy';
import { convertFromBytes32 } from './formatters/string';

export const getLiveTradingProcessorTransaction: any = async (
    isVoucherSelected: boolean,
    collateralAddress: string,
    liveTradingProcessorContract: ethers.Contract,
    tradeData: TradeData[],
    sUSDPaid: BigNumber,
    expectedQuote: BigNumber,
    referral?: string | null,
    additionalSlippage?: BigNumber,
    isAA?: boolean
): Promise<any> => {
    const referralAddress = referral || ZERO_ADDRESS;
    const gameId = convertFromBytes32(tradeData[0].gameId);

    if (isVoucherSelected) {
        if (isAA) {
            return executeBiconomyTransaction(collateralAddress, liveTradingProcessorContract, 'requestLiveTrade', [
                gameId,
                tradeData[0].sportId,
                tradeData[0].typeId,
                tradeData[0].position,
                sUSDPaid,
                expectedQuote,
                additionalSlippage,
                '', // check different recipient for buying with voucher
                referralAddress,
                collateralAddress,
            ]);
        } else {
            return liveTradingProcessorContract.requestLiveTrade(
                gameId,
                tradeData[0].sportId,
                tradeData[0].typeId,
                tradeData[0].position,
                sUSDPaid,
                expectedQuote,
                additionalSlippage,
                '', // check different recipient for buying with voucher
                referralAddress,
                collateralAddress
            );
        }
    }

    if (isAA) {
        return executeBiconomyTransaction(collateralAddress, liveTradingProcessorContract, 'requestLiveTrade', [
            gameId,
            tradeData[0].sportId,
            tradeData[0].typeId,
            tradeData[0].position,
            sUSDPaid,
            expectedQuote,
            additionalSlippage,
            ZERO_ADDRESS, // check different recipient for buying with voucher
            referralAddress,
            collateralAddress,
        ]);
    } else {
        return liveTradingProcessorContract.requestLiveTrade({
            _gameId: gameId,
            _sportId: tradeData[0].sportId,
            _typeId: tradeData[0].typeId,
            _position: tradeData[0].position,
            _line: tradeData[0].line,
            _buyInAmount: sUSDPaid,
            _expectedQuote: expectedQuote,
            _additionalSlippage: additionalSlippage,
            _referrer: referralAddress,
            _collateral: collateralAddress,
        });
    }
};
