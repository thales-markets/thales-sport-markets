import { getPublicClient } from '@wagmi/core';

import { wagmiConfig } from 'pages/Root/wagmiConfig';

import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { Address, Client, encodeFunctionData, getContract, maxUint256 } from 'viem';

import biconomyConnector from './biconomyWallet';
import { getContractAbi } from './contracts/abi';

import { smartSessionCreateActions, smartSessionUseActions, toSmartSessionsValidator } from '@biconomy/abstractjs';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { addMonths } from 'date-fns';
import { localStore } from 'thales-utils';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import liveTradingProcessorContract from './contracts/liveTradingProcessorContract';
import multipleCollateral from './contracts/multipleCollateralContract';
import sportsAMMV2Contract from './contracts/sportsAMMV2Contract';

export const sendBiconomyTransaction = async (params: {
    transaction: any;
    collateralAddress: string;
}): Promise<any | undefined> => {
    if (biconomyConnector.wallet) {
        try {
            // biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);
            const transactionHash = await biconomyConnector.wallet.sendUserOperation({ calls: [params.transaction] });
            return transactionHash;
        } catch (e) {
            console.log(e);
        }
    }
};

export const executeBiconomyTransactionWithConfirmation = async (params: {
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
            to: params.contract.address as `0x${string}`,
            data: encodedCall,
            value: params.value,
        };

        try {
            // biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);
            const hash = await biconomyConnector.wallet.sendUserOperation({ calls: [transaction] });

            const {
                receipt: { transactionHash },
                success,
            } = await biconomyConnector.wallet.waitForConfirmedUserOperationReceipt({
                hash: hash,
            });
            if (success) {
                return transactionHash;
            } else {
                return null;
            }
        } catch (e) {
            try {
                // biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);
                const hash = await biconomyConnector.wallet.sendTokenPaymasterUserOp({
                    calls: [transaction],
                    feeTokenAddress: params.collateralAddress as any,
                });

                const {
                    receipt: { transactionHash },
                    success,
                } = await biconomyConnector.wallet.waitForConfirmedUserOperationReceipt({
                    hash: hash,
                });
                if (success) {
                    return transactionHash;
                } else {
                    return null;
                }
            } catch (e) {
                console.log(e);
            }
            console.log(e);
        }
    }
};

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
            to: params.contract.address as `0x${string}`,
            data: encodedCall,
            value: params.value,
        };

        try {
            // const sessionSigner = await getSessionSigner(params.networkId);
            const transactionArray = [];
            if (params.isEth) {
                // swap eth to weth
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
                    to: wethContractWithSigner.address as `0x${string}`,
                    data: encodedCallWrapEth,
                    value: params.buyInAmountParam,
                };
                transactionArray.push(wrapEthTx);
            }
            transactionArray.push(transaction);

            try {
                // const { wait } = await biconomyConnector.wallet.sendTransaction(transactionArray, {
                //     paymasterServiceData: {
                //         mode: PaymasterMode.SPONSORED,
                //     },
                //     params: {
                //         sessionSigner: sessionSigner,
                //         sessionValidationModule: sessionValidationContract.addresses[params.networkId],
                //     },
                // });
                console.log('lets try this');
                const hash = await getSessionSigner(params.networkId)?.usePermission({ calls: transactionArray });
                const {
                    receipt: { transactionHash },
                    success,
                } = await biconomyConnector.wallet.waitForConfirmedUserOperationReceipt({
                    hash: hash as any,
                });
                if (success) {
                    return transactionHash;
                } else {
                    return null;
                }
            } catch (error) {
                const hash = await biconomyConnector.wallet.sendTokenPaymasterUserOp({
                    calls: transactionArray,
                    feeTokenAddress: params.collateralAddress as any,
                });

                const {
                    receipt: { transactionHash },
                    success,
                } = await biconomyConnector.wallet.waitForConfirmedUserOperationReceipt({
                    hash: hash,
                });
                if (success) {
                    return transactionHash;
                } else {
                    return null;
                }
            }
        } catch (e) {
            console.log(e);
            throw new Error('tx failed');
        }
    }
};

export const activateOvertimeAccount = async (params: { networkId: SupportedNetwork; collateralAddress: string }) => {
    if (biconomyConnector.wallet) {
        try {
            const hash = await biconomyConnector.wallet.sendTransaction({
                calls: [...(await getCreateSessionTxs(params.networkId)), ...getApprovalTxs(params.networkId)],
            });

            const {
                receipt: { transactionHash },
                success,
            } = await biconomyConnector.wallet.waitForConfirmedUserOperationReceipt({
                hash: hash,
            });
            if (success) {
                return transactionHash;
            } else {
                return null;
            }
        } catch (e) {
            console.log(e);
            try {
                const hash = await biconomyConnector.wallet.sendTokenPaymasterUserOp({
                    calls: [...(await getCreateSessionTxs(params.networkId)), ...getApprovalTxs(params.networkId)],
                    feeTokenAddress: params.collateralAddress as any,
                });

                const {
                    receipt: { transactionHash },
                    success,
                } = await biconomyConnector.wallet.waitForConfirmedUserOperationReceipt({
                    hash: hash,
                });
                if (success) {
                    return transactionHash;
                } else {
                    return null;
                }
            } catch (e) {
                console.log(e);
                const storedMapString: any = localStore.get(LOCAL_STORAGE_KEYS.SESSION_P_KEY[params.networkId]);

                const retrievedMap = storedMapString ? new Map(JSON.parse(storedMapString)) : new Map();
                retrievedMap.delete(biconomyConnector.address);
                localStore.set(LOCAL_STORAGE_KEYS.SESSION_P_KEY[params.networkId], JSON.stringify([...retrievedMap]));
                return null;
            }
        }
    }
};

const getCreateSessionTxs = async (networkId: SupportedNetwork) => {
    if (biconomyConnector.wallet) {
        const privateKey = generatePrivateKey();
        const sessionKeyEOA = privateKeyToAccount(privateKey);

        const sessionsModule = toSmartSessionsValidator({
            account: biconomyConnector.wallet.account,
            signer: sessionKeyEOA,
        });

        const hash = await biconomyConnector.wallet.installModule({
            module: sessionsModule.moduleInitData,
        });
        const { success } = await biconomyConnector.wallet.waitForUserOperationReceipt({ hash });

        const dateAfter = new Date();
        const dateUntil = new Date();
        const sixMonths = addMonths(Number(dateUntil), 6);

        if (success) {
            const response = await biconomyConnector.wallet
                .extend(smartSessionCreateActions(sessionsModule))
                .grantPermission({
                    sessionRequestedInfo: [
                        {
                            actionPoliciesInfo: [
                                {
                                    contractAddress: sportsAMMV2Contract.addresses[networkId],
                                    abi: sportsAMMV2Contract.abi,
                                    sudo: true,
                                },
                            ],
                            sessionValidUntil: Math.floor(sixMonths.getTime() / 1000),
                            sessionValidAfter: Math.floor(dateAfter.getTime() / 1000),
                            sessionPublicKey: sessionKeyEOA.address as Address,
                        },
                    ],
                });
            console.log('response: ', response);
        }

        const storedMapString: any = localStore.get(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId]);

        const retrievedMap = storedMapString ? new Map(JSON.parse(storedMapString)) : new Map();

        retrievedMap.set(biconomyConnector.address, {
            privateKey,
            validUntil: Math.floor(sixMonths.getTime() / 1000).toString(),
        });

        localStore.set(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId], JSON.stringify([...retrievedMap]));

        return [];
    }
    return [];
};

const getApprovalTxs = (networkId: SupportedNetwork) => {
    const transactionArray: Array<{ to: `0x${string}`; data: `0x${string}`; value: bigint }> = [];
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

            transactionArray.push(
                {
                    to: value.addresses[networkId],
                    data: enableSportsAMM,
                    value: BigInt(0),
                },
                {
                    to: value.addresses[networkId],
                    data: enableLiveTrading,
                    value: BigInt(0),
                }
            );
        });
    return transactionArray;
};

const getSessionSigner = (networkId: SupportedNetwork) => {
    if (biconomyConnector.wallet) {
        const storedMapString: any = localStore.get(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId]);
        const retrievedMap = new Map(JSON.parse(storedMapString));
        const sessionData = retrievedMap.get(biconomyConnector.address) as any;

        const sessionAccount = privateKeyToAccount(sessionData.privateKey);

        const sessionsModule = toSmartSessionsValidator({
            account: (biconomyConnector.wallet as any).account,
            signer: sessionAccount,
        });
        return biconomyConnector.wallet.extend(smartSessionUseActions(sessionsModule));
    }
};
