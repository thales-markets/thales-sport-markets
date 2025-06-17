import { ZERO_ADDRESS } from 'constants/network';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { Address, Client } from 'viem';
import { TradeData } from '../types/markets';
import { executeBiconomyTransaction } from './smartAccount/biconomy/biconomy';

export const getSportsAMMV2Transaction: any = async (
    collateralAddress: string,
    isDefaultCollateral: boolean,
    isEth: boolean,
    networkId: SupportedNetwork,
    sportsAMMV2Contract: ViemContract,
    freeBetHolderContract: ViemContract,
    tradeData: TradeData[],
    buyInAmount: bigint,
    expectedQuote: bigint,
    referral: string | null,
    additionalSlippage: bigint,
    isAA: boolean,
    isFreeBet: boolean,
    client: Client,
    isSystemBet: boolean,
    systemBetDenominator: number
): Promise<any> => {
    console.log('client', client);

    const referralAddress = referral || ZERO_ADDRESS;

    if (isFreeBet && freeBetHolderContract) {
        if (isSystemBet) {
            if (!isAA) {
                return freeBetHolderContract.write.tradeSystemBet(
                    [
                        tradeData,
                        buyInAmount,
                        expectedQuote,
                        additionalSlippage,
                        referralAddress,
                        collateralAddress,
                        systemBetDenominator,
                    ],
                    { value: BigInt(0) }
                );
            } else
                return await executeBiconomyTransaction({
                    networkId,
                    contract: freeBetHolderContract,
                    methodName: 'tradeSystemBet',
                    collateralAddress: collateralAddress as any,
                    data: [
                        tradeData,
                        buyInAmount,
                        expectedQuote,
                        additionalSlippage,
                        referralAddress,
                        collateralAddress,
                        systemBetDenominator,
                    ],
                });
        } else {
            if (!isAA) {
                return freeBetHolderContract.write.trade(
                    [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress, collateralAddress],
                    { value: BigInt(0) }
                );
            } else {
                return await executeBiconomyTransaction({
                    collateralAddress: collateralAddress as Address,
                    networkId,
                    contract: freeBetHolderContract,
                    methodName: 'trade',
                    data: [
                        tradeData,
                        buyInAmount,
                        expectedQuote,
                        additionalSlippage,
                        referralAddress,
                        collateralAddress,
                    ],
                });
            }
        }
    }

    if (isSystemBet) {
        if (!isAA) {
            return sportsAMMV2Contract.write.tradeSystemBet(
                [
                    tradeData,
                    buyInAmount,
                    expectedQuote,
                    additionalSlippage,
                    referralAddress,
                    isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
                    isEth,
                    systemBetDenominator,
                ],
                { value: isEth ? buyInAmount : BigInt(0) }
            );
        } else {
            return await executeBiconomyTransaction({
                networkId,
                collateralAddress: collateralAddress as any,
                contract: sportsAMMV2Contract,
                methodName: 'tradeSystemBet',
                data: [
                    tradeData,
                    buyInAmount,
                    expectedQuote,
                    additionalSlippage,
                    referralAddress,
                    isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
                    isEth,
                    systemBetDenominator,
                ],
                value: isEth ? buyInAmount : BigInt(0),
            });
        }
    } else {
        if (!isAA) {
            return sportsAMMV2Contract.write.trade(
                [
                    tradeData,
                    buyInAmount,
                    expectedQuote,
                    additionalSlippage,
                    referralAddress,
                    isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
                    isEth,
                ],
                { value: isEth ? buyInAmount : BigInt(0) }
            );
        } else {
            return await executeBiconomyTransaction({
                networkId,
                collateralAddress: collateralAddress as any,
                contract: sportsAMMV2Contract,
                methodName: 'trade',
                data: [
                    tradeData,
                    buyInAmount,
                    expectedQuote,
                    additionalSlippage,
                    referralAddress,
                    isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
                    isEth,
                ],
                value: isEth ? buyInAmount : BigInt(0),
            });
        }
    }
};

export const getSportsAMMV2QuoteMethod: any = (
    collateralAddress: string,
    isDefaultCollateral: boolean,
    sportsAMMV2Contract: ViemContract,
    tradeData: TradeData[],
    buyInAmount: bigint,
    isSystemBet: boolean,
    systemBetDenominator: number
) => {
    return isSystemBet
        ? sportsAMMV2Contract.read.tradeQuoteSystem([
              tradeData,
              buyInAmount,
              isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
              false,
              systemBetDenominator,
          ])
        : sportsAMMV2Contract.read.tradeQuote([
              tradeData,
              buyInAmount,
              isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
              false,
          ]);
};
