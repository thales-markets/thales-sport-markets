import { getPublicClient } from '@wagmi/core';

import { wagmiConfig } from 'pages/Root/wagmiConfig';

import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { Address, Client, encodeFunctionData, getContract, http, maxUint256 } from 'viem';

import biconomyConnector from './biconomyWallet';
import { getContractAbi } from './contracts/abi';

import {
    createBicoPaymasterClient,
    createSmartAccountClient,
    getChain,
    parse,
    SessionData,
    smartSessionCreateActions,
    SmartSessionMode,
    smartSessionUseActions,
    stringify,
    toNexusAccount,
    toSmartSessionsValidator,
} from '@biconomy/abstractjs';
import { LINKS } from 'constants/links';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { addMonths } from 'date-fns';
import { localStore } from 'thales-utils';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import liveTradingProcessorContract from './contracts/liveTradingProcessorContract';
import multipleCollateral from './contracts/multipleCollateralContract';
import sportsAMMV2Contract from './contracts/sportsAMMV2Contract';
import { getTransport } from './network';

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
            // execute with session
            const sessionClient = await getSessionSigner(params.networkId);
            if (sessionClient) {
                const hash = await sessionClient.usePermission({ calls: transactionArray });
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
            }
        } catch (error) {
            // execute normally with sponsor transaction
            console.log('error: ', error);
            try {
                const hash = await biconomyConnector.wallet.sendUserOperation({
                    calls: transactionArray,
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
                // execute with paymaster fee token
                try {
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
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }
};

export const activateOvertimeAccount = async (params: { networkId: SupportedNetwork; walletClient: any }) => {
    if (biconomyConnector.wallet) {
        try {
            const privateKey = generatePrivateKey();
            const sessionKeyEOA = privateKeyToAccount(privateKey);

            const sessionsModule = toSmartSessionsValidator({
                account: biconomyConnector.wallet.account,
                signer: biconomyConnector.wallet.account.signer,
            });
            const isModuleInstalled = await biconomyConnector.wallet.isModuleInstalled({
                module: sessionsModule.moduleInitData,
            });

            console.log('isModuleInstalled: ', isModuleInstalled);
            if (!isModuleInstalled) {
                // Install the smart sessions module on the Nexus client's smart contract account
                const hash = await biconomyConnector.wallet.installModule({
                    module: sessionsModule.moduleInitData,
                });

                const {
                    success,
                    reason,
                    receipt: { transactionHash },
                } = await biconomyConnector.wallet.waitForUserOperationReceipt({ hash });

                console.log('success: ', success, reason, transactionHash);
            }
            const dateAfter = new Date();
            const dateUntil = new Date();
            const sixMonths = addMonths(Number(dateUntil), 6);

            const response = await biconomyConnector.wallet
                .extend(smartSessionCreateActions(sessionsModule))
                .grantPermission({
                    sessionRequestedInfo: [
                        {
                            actionPoliciesInfo: [
                                {
                                    contractAddress: sportsAMMV2Contract.addresses[params.networkId],
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

            const { success, reason } = await biconomyConnector.wallet.waitForUserOperationReceipt({
                hash: response.userOpHash,
            });
            console.log(success, reason);

            const sessionData: SessionData = {
                granter: biconomyConnector.address as `0x${string}`,
                sessionPublicKey: sessionKeyEOA.address,
                description: `Permission for Overtime Account`, // Optional
                moduleData: {
                    ...response,
                    mode: SmartSessionMode.USE,
                },
            };

            const compressedSessionData = stringify(sessionData);

            const storedMapString: any = localStore.get(LOCAL_STORAGE_KEYS.SESSION_P_KEY[params.networkId]);

            const retrievedMap = storedMapString ? new Map(JSON.parse(storedMapString)) : new Map();

            retrievedMap.set(biconomyConnector.address, {
                sessionData: compressedSessionData,
                privateKey,
                validUntil: Math.floor(sixMonths.getTime() / 1000).toString(),
            });

            localStore.set(LOCAL_STORAGE_KEYS.SESSION_P_KEY[params.networkId], JSON.stringify([...retrievedMap]));

            const bundlerUrl = `${LINKS.Biconomy.Bundler}${params.networkId}/${
                import.meta.env.VITE_APP_BICONOMY_BUNDLE_KEY
            }`;
            const paymasterUrl = `${LINKS.Biconomy.Paymaster}${params.networkId}/${
                import.meta.env['VITE_APP_PAYMASTER_KEY_' + params.networkId]
            }`;

            // 2. Create a Nexus Client for Using the Session
            const smartSessionNexusClient = createSmartAccountClient({
                account: await toNexusAccount({
                    signer: sessionKeyEOA,
                    chain: getChain(params.networkId),
                    transport: getTransport(params.networkId),
                }),
                transport: http(bundlerUrl),
                paymaster: createBicoPaymasterClient({ paymasterUrl }),
            });

            // 3. Create a Smart Sessions Module for the Session Key
            const usePermissionsModule = toSmartSessionsValidator({
                account: smartSessionNexusClient.account,
                signer: sessionKeyEOA,
                moduleData: sessionData.moduleData,
            });

            const useSmartSessionNexusClient = smartSessionNexusClient.extend(
                smartSessionUseActions(usePermissionsModule)
            );

            const approvalHash = await useSmartSessionNexusClient.sendUserOperation({
                calls: getApprovalTxs(params.networkId),
            });

            const {
                success: trySuccess,
                receipt: { transactionHash: approvalTx },
            } = await biconomyConnector.wallet.waitForConfirmedUserOperationReceipt({ hash: approvalHash });
            console.log('trySuccess: ', trySuccess);
            return approvalTx;
        } catch (e) {
            console.log('e: ', e);
        }
    }
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

const getSessionSigner = async (networkId: SupportedNetwork) => {
    if (biconomyConnector.wallet) {
        const storedMapString: any = localStore.get(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId]);
        const retrievedMap = new Map(JSON.parse(storedMapString));
        const sessionData = retrievedMap.get(biconomyConnector.address) as any;
        const sessionOwner = privateKeyToAccount(sessionData.privateKey);

        const bundlerUrl = `${LINKS.Biconomy.Bundler}${networkId}/${import.meta.env.VITE_APP_BICONOMY_BUNDLE_KEY}`;
        const paymasterUrl = `${LINKS.Biconomy.Paymaster}${networkId}/${
            import.meta.env['VITE_APP_PAYMASTER_KEY_' + networkId]
        }`;

        // 2. Create a Nexus Client for Using the Session
        const smartSessionNexusClient = createSmartAccountClient({
            account: await toNexusAccount({
                signer: sessionOwner,
                chain: getChain(networkId),
                transport: getTransport(networkId),
            }),
            transport: http(bundlerUrl),
            paymaster: createBicoPaymasterClient({ paymasterUrl }),
        });

        const sessionDataParsed = parse(sessionData.sessionData);

        // 3. Create a Smart Sessions Module for the Session Key
        const usePermissionsModule = toSmartSessionsValidator({
            account: smartSessionNexusClient.account,
            signer: sessionOwner,
            moduleData: sessionDataParsed.moduleData,
        });

        const useSmartSessionNexusClient = smartSessionNexusClient.extend(smartSessionUseActions(usePermissionsModule));

        return useSmartSessionNexusClient;
    }
};
