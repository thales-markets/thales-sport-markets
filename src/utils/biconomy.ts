import { createSessionKeyManagerModule, DEFAULT_SESSION_KEY_MANAGER_MODULE } from '@biconomy/modules';
import { PaymasterFeeQuote, PaymasterMode } from '@biconomy/paymaster';
import { SUPPORTED_TOKEN_TYPE } from '@GDdark/universal-account';
import { getPublicClient } from '@wagmi/core';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { addMonths } from 'date-fns';
import { Network } from 'enums/network';
import localforage from 'localforage';
import { wagmiConfig } from 'pages/Root/wagmiConfig';
import { coinParser } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { Address, Client, createWalletClient, encodeFunctionData, getContract, http, maxUint256 } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { waitForTransactionReceipt } from 'viem/actions';
import biconomyConnector from './biconomyWallet';
import { getContractAbi } from './contracts/abi';
import liveTradingProcessorContract from './contracts/liveTradingProcessorContract';
import multipleCollateral from './contracts/multipleCollateralContract';
import sessionValidationContract from './contracts/sessionValidationContract';
import sgpTradingProcessorContract from './contracts/sgpTradingProcessorContract';
import sportsAMMV2Contract from './contracts/sportsAMMV2Contract';
import { waitForTransactionViaSocket } from './listener';

export const GAS_LIMIT = 1;
const ERROR_SESSION_NOT_FOUND = 'Error: Session not found.';
const USER_REJECTED_ERROR = 'user rejected the request';
const UNIVERSAL_BALANCE_NOT_ENOUGH =
    'Rest balance is not enough to cover the fee. Please reduce the amount and try again.';
const UNIVERSAL_BALANCE_NOT_SUFFICIENT = 'Your balance is insufficient';

export const sendBiconomyTransaction = async (params: {
    networkId: SupportedNetwork;
    transaction: any;
    collateralAddress: string;
    useSession?: boolean;
}): Promise<any | undefined> => {
    if (biconomyConnector.wallet) {
        try {
            if (params.useSession) {
                const sessionSigner = await getSessionSigner(params.networkId);
                const { waitForTxHash } = await biconomyConnector.wallet.sendTransaction(params.transaction, {
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
                });

                const { transactionHash } = await waitForTxHash();

                return await validateTx(transactionHash, params.networkId);
            } else {
                biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);
                const { waitForTxHash } = await biconomyConnector.wallet.sendTransaction(params.transaction, {
                    paymasterServiceData: {
                        mode: PaymasterMode.SPONSORED,
                        webhookData: {
                            networkId: params.networkId,
                        },
                    },
                });
                const { transactionHash } = await waitForTxHash();
                return await validateTx(transactionHash, params.networkId);
            }
        } catch (e) {
            if ((e as any).toString().toLowerCase().includes(USER_REJECTED_ERROR)) {
                throw new Error('Transaction rejected by user.');
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

                    const { waitForTxHash } = await biconomyConnector.wallet.sendTransaction(params.transaction, {
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
                    });

                    const { transactionHash } = await waitForTxHash();
                    return await validateTx(transactionHash, params.networkId);
                } else {
                    const { waitForTxHash } = await biconomyConnector.wallet.sendTransaction(params.transaction, {
                        paymasterServiceData: {
                            mode: PaymasterMode.ERC20,
                            preferredToken: params.collateralAddress,
                        },
                    });

                    const { transactionHash } = await waitForTxHash();

                    return await validateTx(transactionHash, params.networkId);
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
    if (biconomyConnector.wallet && params.contract) {
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
            biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);
            const { waitForTxHash } = await biconomyConnector.wallet.sendTransaction(transaction, {
                paymasterServiceData: {
                    mode: PaymasterMode.SPONSORED,
                    webhookData: {
                        networkId: params.networkId,
                    },
                },
            });

            const { transactionHash } = await waitForTxHash();
            return await validateTx(transactionHash, params.networkId);
        } catch (e) {
            if ((e as any).toString().toLowerCase().includes(USER_REJECTED_ERROR)) {
                throw new Error('Transaction rejected by user.');
            }
            try {
                biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);
                const { waitForTxHash } = await biconomyConnector.wallet.sendTransaction(transaction, {
                    paymasterServiceData: {
                        mode: PaymasterMode.ERC20,
                        preferredToken: params.collateralAddress,
                    },
                });

                const { transactionHash } = await waitForTxHash();

                return await validateTx(transactionHash, params.networkId);
            } catch (e) {
                console.log(e);
            }
            console.log(e);
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
    if (biconomyConnector.wallet && params.contract) {
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
                const { waitForTxHash } = await biconomyConnector.wallet.sendTransaction(transactionArray, {
                    paymasterServiceData: {
                        mode: PaymasterMode.SPONSORED,
                        webhookData: {
                            networkId: params.networkId,
                        },
                    },
                });
                const { transactionHash } = await waitForTxHash();
                return await validateTx(transactionHash, params.networkId);
            } else {
                const sessionSigner = await getSessionSigner(params.networkId);

                const { waitForTxHash } = await biconomyConnector.wallet.sendTransaction(transactionArray, {
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
                });
                const { transactionHash } = await waitForTxHash();
                return await validateTx(transactionHash, params.networkId);
            }
        } catch (error) {
            if ((error as any).toString().toLowerCase().includes(USER_REJECTED_ERROR)) {
                throw new Error('Transaction rejected by user.');
            }
            if (
                (error && (error as any).message && (error as any).message.includes('SessionNotApproved')) ||
                (error as any).toString() === ERROR_SESSION_NOT_FOUND
            ) {
                await activateOvertimeAccount({
                    networkId: params.networkId,
                    collateralAddress: params.collateralAddress as any,
                });

                const sessionSigner = await getSessionSigner(params.networkId);

                try {
                    const { waitForTxHash } = await biconomyConnector.wallet.sendTransaction(transactionArray, {
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
                    });

                    const { transactionHash } = await waitForTxHash();
                    return await validateTx(transactionHash, params.networkId);
                } catch (e) {
                    console.log(e);
                }
            } else {
                const sessionSigner = await getSessionSigner(params.networkId);
                const { waitForTxHash } = await biconomyConnector.wallet.sendTransaction(transactionArray, {
                    paymasterServiceData: {
                        mode: PaymasterMode.ERC20,
                        preferredToken: params.collateralAddress,
                    },
                    params: {
                        sessionSigner: sessionSigner,
                        sessionValidationModule: sessionValidationContract.addresses[params.networkId],
                    },
                });

                const { transactionHash } = await waitForTxHash();

                return await validateTx(transactionHash, params.networkId);
            }
        }
    }
};

export const activateOvertimeAccount = async (params: { networkId: SupportedNetwork; collateralAddress: string }) => {
    if (biconomyConnector.wallet) {
        biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);
        try {
            const { waitForTxHash } = await biconomyConnector.wallet.sendTransaction(
                [...(await getCreateSessionTxs(params.networkId)), ...getApprovalTxs(params.networkId)],
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

            return await validateTx(transactionHash, params.networkId);
        } catch (e) {
            console.log(e);
            try {
                if ((e as any).toString().toLowerCase().includes(USER_REJECTED_ERROR)) {
                    throw new Error('Transaction rejected by user.');
                }
                const { waitForTxHash } = await biconomyConnector.wallet.sendTransaction(
                    [...(await getCreateSessionTxs(params.networkId)), ...getApprovalTxs(params.networkId)],
                    {
                        paymasterServiceData: {
                            mode: PaymasterMode.ERC20,
                            preferredToken: params.collateralAddress,
                        },
                    }
                );

                const { transactionHash } = await waitForTxHash();

                return await validateTx(transactionHash, params.networkId);
            } catch (e) {
                const storedMapString: any = await localforage.getItem(
                    LOCAL_STORAGE_KEYS.SESSION_P_KEY[params.networkId]
                );

                const retrievedMap = storedMapString ?? new Map();
                retrievedMap.delete(biconomyConnector.address);
                await localforage.setItem(LOCAL_STORAGE_KEYS.SESSION_P_KEY[params.networkId], retrievedMap);
                return null;
            }
        }
    }
};

const getCreateSessionTxs = async (networkId: SupportedNetwork) => {
    if (biconomyConnector.wallet) {
        const privateKey = generatePrivateKey();
        const sessionKeyEOA = privateKeyToAccount(privateKey);

        const sessionModule = await createSessionKeyManagerModule({
            moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
            smartAccountAddress: biconomyConnector.address,
        });

        const transactionArray = [];

        // enableModule session manager module
        try {
            const enabled = await biconomyConnector.wallet.isModuleEnabled(DEFAULT_SESSION_KEY_MANAGER_MODULE);
            if (!enabled) {
                const enableModuleTrx = await biconomyConnector.wallet.getEnableModuleData(
                    DEFAULT_SESSION_KEY_MANAGER_MODULE
                );

                transactionArray.push(enableModuleTrx);
            }
        } catch (e) {
            const enableModuleTrx = await biconomyConnector.wallet.getEnableModuleData(
                DEFAULT_SESSION_KEY_MANAGER_MODULE
            );

            transactionArray.push(enableModuleTrx);
        }

        const dateAfter = new Date();
        const dateUntil = new Date();
        const sixMonths = addMonths(Number(dateUntil), 6);

        const sessionTxData = await sessionModule.createSessionData([
            {
                validUntil: Math.floor(sixMonths.getTime() / 1000),
                validAfter: Math.floor(dateAfter.getTime() / 1000),
                sessionValidationModule: sessionValidationContract.addresses[networkId],
                sessionPublicKey: sessionKeyEOA.address as Address,
                sessionKeyData: sessionKeyEOA.address as Address,
            },
        ]);

        // tx to set session key
        const setSessiontrx = {
            to: DEFAULT_SESSION_KEY_MANAGER_MODULE, // session manager module address
            data: sessionTxData.data,
        };

        const storedMapString: any = await localforage.getItem(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId]);

        const retrievedMap = storedMapString ?? new Map();

        retrievedMap.set(biconomyConnector.address, {
            privateKey,
            validUntil: Math.floor(sixMonths.getTime() / 1000).toString(),
            leaves: sessionModule.merkleTree.getLeaves(),
        });

        await localforage.setItem(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId], retrievedMap);

        transactionArray.push(setSessiontrx);

        return transactionArray;
    }
    return [];
};

const getApprovalTxs = (networkId: SupportedNetwork) => {
    const transactionArray: Array<{ to: `0x${string}`; data: `0x${string}` }> = [];
    Object.values(multipleCollateral)
        .filter((value) => value.addresses[networkId] !== '0xTBD')
        .forEach((value) => {
            const enableSportsAMM = encodeFunctionData({
                abi: value.abi,
                functionName: 'approve',
                args: [sportsAMMV2Contract.addresses[networkId], maxUint256],
            });

            const enableLiveTrading = encodeFunctionData({
                abi: value.abi,
                functionName: 'approve',
                args: [liveTradingProcessorContract.addresses[networkId], maxUint256],
            });

            const eanbleSGP = encodeFunctionData({
                abi: value.abi,
                functionName: 'approve',
                args: [sgpTradingProcessorContract.addresses[networkId], maxUint256],
            });

            transactionArray.push(
                {
                    to: value.addresses[networkId],
                    data: enableSportsAMM,
                },
                {
                    to: value.addresses[networkId],
                    data: enableLiveTrading,
                },
                {
                    to: value.addresses[networkId],
                    data: eanbleSGP,
                }
            );
        });
    return transactionArray;
};

const getSessionSigner = async (networkId: SupportedNetwork) => {
    try {
        // try executing via Session module, if its not passing then enable session and execute with signing
        // generate sessionModule
        const sessionModule = await createSessionKeyManagerModule({
            moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
            smartAccountAddress: biconomyConnector.address,
        });

        const retrievedMap: any = await localforage.getItem(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId]);
        const sessionData = retrievedMap.get(biconomyConnector.address) as any;

        sessionModule.merkleTree.resetTree();
        sessionModule.merkleTree.addLeaves(sessionData.leaves);

        const sessionAccount = privateKeyToAccount(sessionData.privateKey);
        const sessionSigner = createWalletClient({
            account: sessionAccount,
            chain: networkId as any,
            transport: http(biconomyConnector.wallet?.rpcProvider.transport.url),
        });

        biconomyConnector.wallet?.setActiveValidationModule(sessionModule);

        return sessionSigner;
    } catch (e) {
        throw ERROR_SESSION_NOT_FOUND;
    }
};

export const getPaymasterData = async (
    networkId: SupportedNetwork,
    contract: ViemContract | undefined,
    methodName: string,
    data?: ReadonlyArray<any>,
    value?: any
): Promise<PaymasterFeeQuote | undefined> => {
    if (biconomyConnector.wallet && contract) {
        try {
            biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);

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

            const feeQuotesData = await biconomyConnector.wallet.getTokenFees(transaction, {
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
    }
};

const validateTx = async (transactionHash: string | undefined, networkId: SupportedNetwork) => {
    if (!transactionHash) throw new Error('waitForTxHash did not return transactionHash');
    const client = getPublicClient(wagmiConfig, { chainId: networkId });

    const txReceipt = await Promise.race([
        waitForTransactionReceipt(client as Client, {
            hash: transactionHash as any,
        }),
        waitForTransactionViaSocket(transactionHash as any, networkId),
    ]);

    if (txReceipt.status === 'success') {
        return transactionHash;
    } else {
        throw new Error(`user op failed internally, check txHash: ${transactionHash}`);
    }
};

export const sendUniversalTransfer = async (amount: string) => {
    try {
        const encodedCall = encodeFunctionData({
            abi: multipleCollateral.USDC.abi,
            functionName: 'transfer',
            args: [biconomyConnector.address, coinParser(amount, Network.OptimismMainnet, 'USDC')],
        });

        const transactionLocal = {
            to: multipleCollateral.USDC.addresses[Network.OptimismMainnet],
            data: encodedCall,
        };

        const transaction = await biconomyConnector.universalAccount?.createUniversalTransaction({
            expectTokens: [{ type: SUPPORTED_TOKEN_TYPE.USDC, amount }],
            chainId: Network.OptimismMainnet,
            transactions: [transactionLocal],
        });

        const signature = await biconomyConnector.wallet?.signMessage(transaction.rootHash);
        if (signature) {
            const result = await biconomyConnector.universalAccount?.sendTransaction(transaction, signature);
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
                args: [biconomyConnector.address, coinParser(finalAmount.toString(), Network.OptimismMainnet, 'USDC')],
            });

            const transactionLocal = {
                to: multipleCollateral.USDC.addresses[Network.OptimismMainnet],
                data: encodedCall,
            };

            await biconomyConnector.universalAccount?.createUniversalTransaction({
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
