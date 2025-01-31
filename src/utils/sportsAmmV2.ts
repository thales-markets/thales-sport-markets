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
    isStakedThales: boolean,
    stakingThalesBettingProxyContract: ViemContract,
    client: Client,
    isSystemBet: boolean,
    systemBetDenominator: number
): Promise<any> => {
    let finalEstimation = null;
    const referralAddress = referral || ZERO_ADDRESS;

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

            if (!isAA) {
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
            const encodedData = encodeFunctionData({
                abi: freeBetHolderContract.abi,
                functionName: 'trade',
                args: [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress, collateralAddress],
            });

            if (!isAA) {
                const estimation = await estimateGas(client, {
                    to: freeBetHolderContract.address as Address,
                    data: encodedData,
                });

                finalEstimation = BigInt(Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER));

                return freeBetHolderContract.write.trade(
                    [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress, collateralAddress],
                    { value: BigInt(0), gas: finalEstimation }
                );
            } else {
                console.log('this should be executed');
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

    if (isStakedThales && stakingThalesBettingProxyContract) {
        if (isSystemBet) {
            const encodedData = encodeFunctionData({
                abi: stakingThalesBettingProxyContract.abi,
                functionName: 'tradeSystemBet',
                args: [
                    tradeData,
                    buyInAmount,
                    expectedQuote,
                    additionalSlippage,
                    referralAddress,
                    systemBetDenominator,
                ],
            });

            const estimation = await estimateGas(client, {
                to: stakingThalesBettingProxyContract.address as Address,
                data: encodedData,
            });

            finalEstimation = BigInt(Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER));

            return stakingThalesBettingProxyContract.write.tradeSystemBet(
                [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress, systemBetDenominator],
                { gas: finalEstimation }
            );
        }

        const encodedData = encodeFunctionData({
            abi: stakingThalesBettingProxyContract.abi,
            functionName: 'trade',
            args: [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress],
        });

        const estimation = await estimateGas(client, {
            to: stakingThalesBettingProxyContract.address as Address,
            data: encodedData,
        });

        finalEstimation = BigInt(Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER));

        return stakingThalesBettingProxyContract.write.trade(
            [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress],
            { gas: finalEstimation }
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

        if (!isAA) {
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

        if (!isAA) {
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
