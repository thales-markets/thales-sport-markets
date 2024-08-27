import { ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { TradeData } from '../types/markets';
import { executeBiconomyTransaction } from './biconomy';
import { convertFromBytes32 } from './formatters/string';

export const getLiveTradingProcessorTransaction: any = async (
    collateralAddress: string,
    liveTradingProcessorContract: ethers.Contract,
    tradeData: TradeData[],
    sUSDPaid: BigNumber,
    expectedQuote: BigNumber,
    referral?: string | null,
    additionalSlippage?: BigNumber,
    isAA?: boolean,
    isFreeBet?: boolean,
    freeBetHolderContract?: ethers.Contract
): Promise<any> => {
    const referralAddress = referral || ZERO_ADDRESS;
    const gameId = convertFromBytes32(tradeData[0].gameId);

    if (isAA) {
        return executeBiconomyTransaction(collateralAddress, liveTradingProcessorContract, 'requestLiveTrade', [
            gameId,
            tradeData[0].sportId,
            tradeData[0].typeId,
            tradeData[0].position,
            tradeData[0].line,
            sUSDPaid,
            expectedQuote,
            additionalSlippage,
            referralAddress,
            collateralAddress,
        ]);
    } else {
        if (isFreeBet && freeBetHolderContract) {
            return freeBetHolderContract.tradeLive({
                _gameId: gameId,
                _sportId: tradeData[0].sportId,
                _typeId: tradeData[0].typeId,
                _line: tradeData[0].line,
                _position: tradeData[0].position,
                _buyInAmount: sUSDPaid,
                _expectedQuote: expectedQuote,
                _additionalSlippage: additionalSlippage,
                _referrer: referralAddress,
                _collateral: collateralAddress,
            });
        }
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
