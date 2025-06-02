import { PaymasterFeeQuote, PaymasterMode } from '@biconomy/account';
import { getPublicClient } from '@wagmi/core';
import { USER_REJECTED_ERRORS } from 'constants/errors';
import { wagmiConfig } from 'pages/Root/wagmiConfig';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { Address, Client, encodeFunctionData, getContract } from 'viem';
import { getContractAbi } from '../../contracts/abi';
import multipleCollateral from '../../contracts/multipleCollateralContract';
import sessionValidationContract from '../../contracts/sessionValidationContract';
import {
    ACCOUNT_NONCE_FAILED,
    ERROR_SESSION_NOT_FOUND,
    USER_OP_FAILED,
    USER_REJECTED_ERROR,
    WEBHOOK_FAILED,
} from '../constants/errors';
import smartAccountConnector from '../smartAccountConnector';
import { validateTx } from './listener';
import { activateOvertimeAccount, getSessionSigner } from './session';

export const GAS_LIMIT = 1;

export const sendBiconomyTransaction = async (params: {
    networkId: SupportedNetwork;
    transaction: any;
    collateralAddress: string;
    useSession?: boolean;
}): Promise<any | undefined> => {
    if (smartAccountConnector.biconomyAccount) {
        try {
            if (params.useSession) {
                const sessionSigner = await getSessionSigner(params.networkId);
                const { waitForTxHash, userOpHash } = await smartAccountConnector.biconomyAccount.sendTransaction(
                    params.transaction,
                    {
                        paymasterServiceData: {
                            mode: PaymasterMode.SPONSORED,
                            webhookData: {
                                networkId: params.networkId,
                            },
                        },
                        params: {
                            sessionSigner: sessionSigner,
                            sessionValidationModule: sessionValidationContract.addresses[params.networkId],
                        },
                    }
                );

                const { transactionHash } = await waitForTxHash();

                return await validateTx(transactionHash, userOpHash, params.networkId);
            } else {
                smartAccountConnector.biconomyAccount.setActiveValidationModule(
                    smartAccountConnector.biconomyAccount.defaultValidationModule
                );
                const { waitForTxHash, userOpHash } = await smartAccountConnector.biconomyAccount.sendTransaction(
                    params.transaction,
                    {
                        paymasterServiceData: {
                            mode: PaymasterMode.SPONSORED,
                            webhookData: {
                                networkId: params.networkId,
                            },
                        },
                    }
                );
                const { transactionHash } = await waitForTxHash();
                return await validateTx(transactionHash, userOpHash, params.networkId);
            }
        } catch (e) {
            if ((e as any).toString().toLowerCase().includes(USER_REJECTED_ERROR)) {
                throw USER_REJECTED_ERRORS[0];
            }
            if (
                (e as any).toString().toLowerCase().includes(USER_OP_FAILED) ||
                (e as any).toString().toLowerCase().includes(ACCOUNT_NONCE_FAILED)
            ) {
                throw e;
            }
            try {
                if (
                    (e && (e as any).message && (e as any).message.includes('SessionNotApproved')) ||
                    (e as any).toString() === ERROR_SESSION_NOT_FOUND
                ) {
                    await activateOvertimeAccount({
                        networkId: params.networkId,
                        collateralAddress: params.collateralAddress as any,
                    });

                    const sessionSigner = await getSessionSigner(params.networkId);

                    const { waitForTxHash, userOpHash } = await smartAccountConnector.biconomyAccount.sendTransaction(
                        params.transaction,
                        {
                            paymasterServiceData: {
                                mode: PaymasterMode.SPONSORED,
                                webhookData: {
                                    networkId: params.networkId,
                                },
                            },
                            params: {
                                sessionSigner: sessionSigner,
                                sessionValidationModule: sessionValidationContract.addresses[params.networkId],
                            },
                        }
                    );

                    const { transactionHash } = await waitForTxHash();
                    return await validateTx(transactionHash, userOpHash, params.networkId);
                } else if ((e as any).toString().toLowerCase().includes(WEBHOOK_FAILED)) {
                    const { waitForTxHash, userOpHash } = await smartAccountConnector.biconomyAccount.sendTransaction(
                        params.transaction,
                        {
                            paymasterServiceData: {
                                mode: PaymasterMode.ERC20,
                                preferredToken: params.collateralAddress,
                            },
                        }
                    );

                    const { transactionHash } = await waitForTxHash();
                    return await validateTx(transactionHash, userOpHash, params.networkId);
                }
            } catch (e) {
                console.log(e);
            }
        }
    }
};

export const executeBiconomyTransactionWithConfirmation = async (params: {
    networkId: SupportedNetwork;
    contract: ViemContract | undefined;
    collateralAddress?: string;
    methodName: string;
    data?: ReadonlyArray<any>;
    value?: any;
}): Promise<any | undefined> => {
    if (smartAccountConnector.biconomyAccount && params.contract) {
        const encodedCall = encodeFunctionData({
            abi: params.contract.abi,
            functionName: params.methodName,
            args: params.data ? params.data : ([] as any),
        });

        const transaction = {
            to: params.contract.address,
            data: encodedCall,
            value: params.value,
        };

        try {
            smartAccountConnector.biconomyAccount.setActiveValidationModule(
                smartAccountConnector.biconomyAccount.defaultValidationModule
            );
            const { waitForTxHash, userOpHash } = await smartAccountConnector.biconomyAccount.sendTransaction(
                transaction,
                {
                    paymasterServiceData: {
                        mode: PaymasterMode.SPONSORED,
                        webhookData: {
                            networkId: params.networkId,
                        },
                    },
                }
            );

            const { transactionHash } = await waitForTxHash();
            return await validateTx(transactionHash, userOpHash, params.networkId);
        } catch (e) {
            if ((e as any).toString().toLowerCase().includes(USER_REJECTED_ERROR)) {
                throw USER_REJECTED_ERRORS[0];
            }
            if (
                (e as any).toString().toLowerCase().includes(USER_OP_FAILED) ||
                (e as any).toString().toLowerCase().includes(ACCOUNT_NONCE_FAILED)
            ) {
                throw e;
            }
            if ((e as any).toString().toLowerCase().includes(WEBHOOK_FAILED)) {
                try {
                    smartAccountConnector.biconomyAccount.setActiveValidationModule(
                        smartAccountConnector.biconomyAccount.defaultValidationModule
                    );
                    const { waitForTxHash, userOpHash } = await smartAccountConnector.biconomyAccount.sendTransaction(
                        transaction,
                        {
                            paymasterServiceData: {
                                mode: PaymasterMode.ERC20,
                                preferredToken: params.collateralAddress,
                            },
                        }
                    );

                    const { transactionHash } = await waitForTxHash();
                    return await validateTx(transactionHash, userOpHash, params.networkId);
                } catch (e) {
                    console.log(e);
                }
                console.log(e);
            }
            throw e;
        }
    }
};

/**
 * Method for executing smart account transaction(User Operation).
 * On the first try method will be executed using sponsored session execution.
 * If the first try fails because of 'SessionNotApproved' or 'Session not found.' error
 * then we create a new session for the user and execute the transaction.
 * If this also fails we will try and execute the transaction without sponsoring the gas as the error maybe in the paymaster infrastructure.
 */
export const executeBiconomyTransaction = async (params: {
    collateralAddress?: Address;
    networkId: SupportedNetwork;
    contract: ViemContract | undefined;
    methodName: string;
    data?: any;
    value?: any;
    isEth?: boolean;
    buyInAmountParam?: bigint;
}): Promise<any | undefined> => {
    if (smartAccountConnector.biconomyAccount && params.contract) {
        const encodedCall = encodeFunctionData({
            abi: getContractAbi(params.contract, params.networkId),
            functionName: params.methodName,
            args: params.data ? params.data : ([] as any),
        });

        const transaction = {
            to: params.contract.address,
            data: encodedCall,
            value: params.value,
        };

        const transactionArray = [];
        // swap eth to weth
        if (params.isEth) {
            const client = getPublicClient(wagmiConfig, { chainId: params.networkId });

            const wethContractWithSigner = getContract({
                abi: multipleCollateral.WETH.abi,
                address: multipleCollateral.WETH.addresses[params.networkId],
                client: client as Client,
            });

            const encodedCallWrapEth = encodeFunctionData({
                abi: wethContractWithSigner.abi,
                functionName: 'deposit',
                args: [],
            });

            const wrapEthTx = {
                to: wethContractWithSigner.address,
                data: encodedCallWrapEth,
                value: params.buyInAmountParam,
            };
            transactionArray.push(wrapEthTx);
        }
        transactionArray.push(transaction);

        try {
            if (params.isEth) {
                const { waitForTxHash, userOpHash } = await smartAccountConnector.biconomyAccount.sendTransaction(
                    transactionArray,
                    {
                        paymasterServiceData: {
                            mode: PaymasterMode.SPONSORED,
                            webhookData: {
                                networkId: params.networkId,
                            },
                        },
                    }
                );
                const { transactionHash } = await waitForTxHash();
                return await validateTx(transactionHash, userOpHash, params.networkId);
            } else {
                const sessionSigner = await getSessionSigner(params.networkId);

                const { waitForTxHash, userOpHash, wait } = await smartAccountConnector.biconomyAccount.sendTransaction(
                    transactionArray,
                    {
                        paymasterServiceData: {
                            mode: PaymasterMode.SPONSORED,
                            webhookData: {
                                networkId: params.networkId,
                            },
                        },
                        params: {
                            sessionSigner: sessionSigner,
                            sessionValidationModule: sessionValidationContract.addresses[params.networkId],
                        },
                    }
                );

                const { transactionHash } = await waitForTxHash();
                const {
                    receipt: { transactionHash: txhash1 },
                    success,
                } = await wait();

                console.log('Transaction Hash:', transactionHash, txhash1, 'Success:', success);

                return await validateTx(transactionHash, userOpHash, params.networkId);
            }
        } catch (e) {
            if ((e as any).toString().toLowerCase().includes(USER_REJECTED_ERROR)) {
                throw USER_REJECTED_ERRORS[0];
            }
            if (
                (e as any).toString().toLowerCase().includes(USER_OP_FAILED) ||
                (e as any).toString().toLowerCase().includes(ACCOUNT_NONCE_FAILED)
            ) {
                throw e;
            }

            if (
                (e && (e as any).message && (e as any).message.includes('SessionNotApproved')) ||
                (e as any).toString() === ERROR_SESSION_NOT_FOUND
            ) {
                await activateOvertimeAccount({
                    networkId: params.networkId,
                    collateralAddress: params.collateralAddress as any,
                });

                const sessionSigner = await getSessionSigner(params.networkId);

                try {
                    const { waitForTxHash, userOpHash } = await smartAccountConnector.biconomyAccount.sendTransaction(
                        transactionArray,
                        {
                            paymasterServiceData: {
                                mode: PaymasterMode.SPONSORED,
                                webhookData: {
                                    networkId: params.networkId,
                                },
                            },
                            params: {
                                sessionSigner: sessionSigner,
                                sessionValidationModule: sessionValidationContract.addresses[params.networkId],
                            },
                        }
                    );

                    const { transactionHash } = await waitForTxHash();
                    return await validateTx(transactionHash, userOpHash, params.networkId);
                } catch (e) {
                    console.log(e);
                }
            } else if ((e as any).toString().toLowerCase().includes(WEBHOOK_FAILED)) {
                const sessionSigner = await getSessionSigner(params.networkId);
                const { waitForTxHash, userOpHash } = await smartAccountConnector.biconomyAccount.sendTransaction(
                    transactionArray,
                    {
                        paymasterServiceData: {
                            mode: PaymasterMode.ERC20,
                            preferredToken: params.collateralAddress,
                        },
                        params: {
                            sessionSigner: sessionSigner,
                            sessionValidationModule: sessionValidationContract.addresses[params.networkId],
                        },
                    }
                );

                const { transactionHash } = await waitForTxHash();

                return await validateTx(transactionHash, userOpHash, params.networkId);
            }
            throw e;
        }
    }
};

export const getPaymasterData = async (
    networkId: SupportedNetwork,
    contract: ViemContract | undefined,
    methodName: string,
    data?: ReadonlyArray<any>,
    value?: any
): Promise<PaymasterFeeQuote | undefined> => {
    if (smartAccountConnector.biconomyAccount && contract) {
        const encodedCall = encodeFunctionData({
            abi: getContractAbi(contract, networkId),
            functionName: methodName,
            args: data ? data : ([] as any),
        });

        const transaction = {
            to: contract.address,
            data: encodedCall,
            value,
        };
        try {
            const sessionSigner = await getSessionSigner(networkId);

            const feeQuotesData = await smartAccountConnector.biconomyAccount.getTokenFees(transaction, {
                paymasterServiceData: {
                    mode: PaymasterMode.ERC20,
                },
                params: {
                    sessionSigner: sessionSigner,
                    sessionValidationModule: sessionValidationContract.addresses[networkId],
                },
            });

            const quotes = feeQuotesData.feeQuotes?.filter((feeQuote) => feeQuote.symbol === 'USDC');
            if (quotes) {
                return quotes[0];
            }
        } catch (e) {
            if (e === ERROR_SESSION_NOT_FOUND) {
                try {
                    smartAccountConnector.biconomyAccount.setActiveValidationModule(
                        smartAccountConnector.biconomyAccount.defaultValidationModule
                    );
                    const feeQuotesData = await smartAccountConnector.biconomyAccount.getTokenFees(transaction, {
                        paymasterServiceData: {
                            mode: PaymasterMode.ERC20,
                        },
                    });

                    const quotes = feeQuotesData.feeQuotes?.filter((feeQuote) => feeQuote.symbol === 'USDC');
                    if (quotes) {
                        return quotes[0];
                    }
                } catch (e) {
                    console.log(e);
                }
            } else {
                console.log(e);
            }
        }
    }
};
