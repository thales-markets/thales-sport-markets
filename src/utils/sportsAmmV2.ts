import { GAS_ESTIMATION_BUFFER, ZERO_ADDRESS } from 'constants/network';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { Address, Client, encodeFunctionData } from 'viem';
import { estimateGas } from 'viem/actions';
import { TradeData } from '../types/markets';
import { executeBiconomyTransaction } from './biconomy';

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
    let finalEstimation = null;
    const referralAddress = referral || ZERO_ADDRESS;

    if (isAA) {
        return executeBiconomyTransaction(networkId, collateralAddress, sportsAMMV2Contract, 'trade', [
            tradeData,
            buyInAmount,
            expectedQuote,
            additionalSlippage,
            referralAddress,
            collateralAddress,
            isEth,
        ]);
    } else {
        if (isFreeBet && freeBetHolderContract) {
            if (isSystemBet) {
                const encodedData = encodeFunctionData({
                    abi: freeBetHolderContract.abi,
                    functionName: 'tradeSystemBet',
                    args: [
                        tradeData,
                        buyInAmount,
                        expectedQuote,
                        additionalSlippage,
                        referralAddress,
                        collateralAddress,
                        systemBetDenominator,
                    ],
                });

                const estimation = await estimateGas(client, {
                    to: freeBetHolderContract.address as Address,
                    data: encodedData,
                });

                finalEstimation = BigInt(Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER));

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
                    { value: BigInt(0), gas: finalEstimation }
                );
            }

            const encodedData = encodeFunctionData({
                abi: freeBetHolderContract.abi,
                functionName: 'trade',
                args: [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress, collateralAddress],
            });

            const estimation = await estimateGas(client, {
                to: freeBetHolderContract.address as Address,
                data: encodedData,
            });

            finalEstimation = BigInt(Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER));

            return freeBetHolderContract.write.trade(
                [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress, collateralAddress],
                { value: BigInt(0), gas: finalEstimation }
            );
        }

        if (isSystemBet) {
            const encodedData = encodeFunctionData({
                abi: sportsAMMV2Contract.abi,
                functionName: 'tradeSystemBet',
                args: [
                    tradeData,
                    buyInAmount,
                    expectedQuote,
                    additionalSlippage,
                    referralAddress,
                    collateralAddress,
                    isEth,
                    systemBetDenominator,
                ],
            });

            const estimation = await estimateGas(client, {
                to: sportsAMMV2Contract.address as Address,
                data: encodedData,
                value: isEth ? buyInAmount : BigInt(0),
            });

            finalEstimation = BigInt(Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER));

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
                { value: isEth ? buyInAmount : BigInt(0), gas: finalEstimation }
            );
        }

        const encodedData = encodeFunctionData({
            abi: sportsAMMV2Contract.abi,
            functionName: 'trade',
            args: [
                tradeData,
                buyInAmount,
                expectedQuote,
                additionalSlippage,
                referralAddress,
                isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
                isEth,
            ],
        });

        const estimation = await estimateGas(client, {
            to: sportsAMMV2Contract.address as Address,
            data: encodedData,
            value: isEth ? buyInAmount : BigInt(0),
        });

        finalEstimation = BigInt(Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER));

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
            { value: isEth ? buyInAmount : BigInt(0), gas: finalEstimation }
        );
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
