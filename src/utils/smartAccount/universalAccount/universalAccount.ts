import { SUPPORTED_TOKEN_TYPE } from '@particle-network/universal-account-sdk';
import { Network } from 'enums/network';
import { coinParser } from 'thales-utils';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import smartAccountConnector from 'utils/smartAccount/smartAccountConnector';
import { encodeFunctionData } from 'viem';
import { UNIVERSAL_BALANCE_NOT_ENOUGH, UNIVERSAL_BALANCE_NOT_SUFFICIENT } from '../constants/errors';

export const sendUniversalTransfer = async (amount: string) => {
    try {
        const encodedCall = encodeFunctionData({
            abi: multipleCollateral.USDC.abi,
            functionName: 'transfer',
            args: [smartAccountConnector.biconomyAddress, coinParser(amount, Network.OptimismMainnet, 'USDC')],
        });

        const transactionLocal = {
            to: multipleCollateral.USDC.addresses[Network.OptimismMainnet],
            data: encodedCall,
        };

        const transaction = await smartAccountConnector.universalAccount?.createUniversalTransaction({
            expectTokens: [{ type: SUPPORTED_TOKEN_TYPE.USDC, amount }],
            chainId: Network.OptimismMainnet,
            transactions: [transactionLocal],
        });

        const signature = await smartAccountConnector.biconomyAccount?.signMessage(transaction.rootHash);
        if (signature) {
            const result = await smartAccountConnector.universalAccount?.sendTransaction(transaction, signature);
            return {
                success: true,
                hash: result.transactionId,
            };
        }
    } catch (e: any) {
        console.log(e);
        if (e.message == UNIVERSAL_BALANCE_NOT_ENOUGH || e.message == UNIVERSAL_BALANCE_NOT_SUFFICIENT) {
            return {
                success: false,
                message: UNIVERSAL_BALANCE_NOT_ENOUGH,
            };
        }
        throw e;
    }
};

export const validateMaxAmount = async (amount: number) => {
    let RETRY_COUNT = 0;
    let finalAmount = amount - 0.05;

    while (RETRY_COUNT <= 30) {
        try {
            const encodedCall = encodeFunctionData({
                abi: multipleCollateral.USDC.abi,
                functionName: 'transfer',
                args: [
                    smartAccountConnector.biconomyAddress,
                    coinParser(finalAmount.toString(), Network.OptimismMainnet, 'USDC'),
                ],
            });

            const transactionLocal = {
                to: multipleCollateral.USDC.addresses[Network.OptimismMainnet],
                data: encodedCall,
            };

            await smartAccountConnector.universalAccount?.createUniversalTransaction({
                expectTokens: [{ type: SUPPORTED_TOKEN_TYPE.USDC, amount: finalAmount.toString() }],
                chainId: Network.OptimismMainnet,
                transactions: [transactionLocal],
            });
            return finalAmount;
        } catch (e: any) {
            finalAmount = finalAmount - 0.1;
            RETRY_COUNT++;
        }
    }
    return 0;
};
