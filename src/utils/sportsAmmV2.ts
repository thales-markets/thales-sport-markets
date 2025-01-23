import { GAS_ESTIMATION_BUFFER, ZERO_ADDRESS } from 'constants/network';
import { Network } from 'enums/network';
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
            if (networkId === Network.OptimismMainnet && !isAA) {
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

                finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.
            }
            return isAA
                ? await executeBiconomyTransaction({
                      collateralAddress: collateralAddress as Address,
                      networkId,
                      contract: freeBetHolderContract,
                      methodName: 'tradeSystemBet',
                      data: [
                          tradeData,
                          buyInAmount,
                          expectedQuote,
                          additionalSlippage,
                          referralAddress,
                          collateralAddress,
                          systemBetDenominator,
                      ],
                  })
                : freeBetHolderContract.write.tradeSystemBet(
                      [
                          tradeData,
                          buyInAmount,
                          expectedQuote,
                          additionalSlippage,
                          referralAddress,
                          collateralAddress,
                          systemBetDenominator,
                      ],
                      { value: 0, gasLimit: finalEstimation }
                  );
        }

        const encodedData = encodeFunctionData({
            abi: freeBetHolderContract.abi,
            functionName: 'trade',
            args: [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress, collateralAddress],
        });

        if (networkId === Network.OptimismMainnet && !isAA) {
            const estimation = await estimateGas(client, {
                to: freeBetHolderContract.address as Address,
                data: encodedData,
            });

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.
        }

        return isAA
            ? await executeBiconomyTransaction({
                  collateralAddress: collateralAddress as Address,
                  networkId,
                  contract: freeBetHolderContract,
                  methodName: 'trade',
                  data: [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress, collateralAddress],
              })
            : freeBetHolderContract.write.trade(
                  [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress, collateralAddress],
                  { value: 0, gasLimit: finalEstimation }
              );
    }

    if (isStakedThales && stakingThalesBettingProxyContract) {
        if (isSystemBet) {
            if (networkId === Network.OptimismMainnet && !isAA) {
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

                finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.
            }

            return isAA
                ? await executeBiconomyTransaction({
                      collateralAddress: collateralAddress as Address,
                      networkId,
                      contract: stakingThalesBettingProxyContract,
                      methodName: 'tradeSystemBet',
                      data: [
                          tradeData,
                          buyInAmount,
                          expectedQuote,
                          additionalSlippage,
                          referralAddress,
                          systemBetDenominator,
                      ],
                  })
                : stakingThalesBettingProxyContract.write.tradeSystemBet(
                      [
                          tradeData,
                          buyInAmount,
                          expectedQuote,
                          additionalSlippage,
                          referralAddress,
                          systemBetDenominator,
                      ],

                      { gasLimit: finalEstimation }
                  );
        }

        const encodedData = encodeFunctionData({
            abi: stakingThalesBettingProxyContract.abi,
            functionName: 'trade',
            args: [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress],
        });

        if (networkId === Network.OptimismMainnet && !isAA) {
            const estimation = await estimateGas(client, {
                to: stakingThalesBettingProxyContract.address as Address,
                data: encodedData,
            });

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.
        }

        return isAA
            ? await executeBiconomyTransaction({
                  collateralAddress: collateralAddress as Address,
                  networkId,
                  contract: stakingThalesBettingProxyContract,
                  methodName: 'trade',
                  data: [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress],
              })
            : stakingThalesBettingProxyContract.write.trade(
                  [tradeData, buyInAmount, expectedQuote, additionalSlippage, referralAddress],
                  { gasLimit: finalEstimation }
              );
    }

    if (isSystemBet) {
        if (networkId === Network.OptimismMainnet && !isAA) {
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
                value: isEth ? buyInAmount : undefined,
            });

            finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.
        }

        return isAA
            ? await executeBiconomyTransaction({
                  collateralAddress: collateralAddress as Address,
                  networkId,
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
              })
            : sportsAMMV2Contract.write.tradeSystemBet(
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
                  { value: isEth ? buyInAmount : 0, gasLimit: finalEstimation }
              );
    }

    if (networkId === Network.OptimismMainnet && !isAA) {
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
            value: isEth ? buyInAmount : undefined,
        });

        finalEstimation = Math.ceil(Number(estimation) * GAS_ESTIMATION_BUFFER); // using Math.celi as gasLimit is accepting only integer.
    }

    return isAA
        ? await executeBiconomyTransaction({
              collateralAddress: collateralAddress as Address,
              networkId,
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

              isEth,
              buyInAmountParam: buyInAmount,
          })
        : sportsAMMV2Contract.write.trade(
              [
                  tradeData,
                  buyInAmount,
                  expectedQuote,
                  additionalSlippage,
                  referralAddress,
                  isDefaultCollateral ? ZERO_ADDRESS : collateralAddress,
                  isEth,
              ],
              { value: isEth ? buyInAmount : 0, gasLimit: finalEstimation }
          );
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
