import { createSessionKeyManagerModule, DEFAULT_SESSION_KEY_MANAGER_MODULE } from '@biconomy/modules';
import { IHybridPaymaster, PaymasterFeeQuote, PaymasterMode, SponsorUserOperationDto } from '@biconomy/paymaster';
import { getPublicClient } from '@wagmi/core';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { addMonths } from 'date-fns';
import { wagmiConfig } from 'pages/Root/wagmiConfig';
import { localStore } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { Address, Client, createWalletClient, encodeFunctionData, erc20Abi, getContract, http, maxUint256 } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import biconomyConnector from './biconomyWallet';
import { getContractAbi } from './contracts/abi';
import multipleCollateral from './contracts/multipleCollateralContract';
import erc20Contract from './contracts/sUSDContract';
import sessionValidationContract from './contracts/sessionValidationContract';
import sportsAMMV2Contract from './contracts/sportsAMMV2Contract';

export const ETH_PAYMASTER = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'; // used for paying gas in ETH by AA

export const executeBiconomyTransactionWithConfirmation = async (
    collateral: string,
    contract: ViemContract | undefined,
    methodName: string,
    data?: ReadonlyArray<any>,
    value?: any
): Promise<any | undefined> => {
    if (biconomyConnector.wallet && contract) {
        const encodedCall = encodeFunctionData({
            abi: contract.abi,
            functionName: methodName,
            args: data ? data : ([] as any),
        });

        const transaction = {
            to: contract.address,
            data: encodedCall,
            value,
        };

        try {
            const { wait } = await biconomyConnector.wallet.sendTransaction(transaction, {
                paymasterServiceData: {
                    mode: PaymasterMode.ERC20,
                    preferredToken: collateral,
                },
            });

            const {
                receipt: { transactionHash },
                success,
            } = await wait();

            console.log('tx hash: ', transactionHash);
            console.log('success: ', success);

            if (success === 'false') {
                throw new Error('tx failed');
            } else {
                console.log('Transaction receipt', transactionHash);
                return transactionHash;
            }
        } catch (e) {
            console.log(e);
        }
    }
};

export const executeBiconomyTransaction = async (
    networkId: SupportedNetwork,
    collateral: string,
    contract: ViemContract | undefined,
    methodName: string,
    data?: ReadonlyArray<any>,
    value?: any,
    isEth?: boolean,
    buyInAmountParam?: bigint
): Promise<any | undefined> => {
    if (biconomyConnector.wallet && contract) {
        console.log('networkID: ', networkId);
        console.log('collateral: ', collateral);
        console.log('methodName: ', methodName);
        console.log('contract: ', contract);
        console.log('value: ', value);
        console.log('isEth: ', isEth);
        console.log('buyInAmountParam: ', buyInAmountParam);
        console.log(data);

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

        const validUntil = localStore.get(LOCAL_STORAGE_KEYS.SESSION_VALID_UNTIL[networkId]);
        const dateUntilValid = new Date(Number(validUntil) * 1000);
        const nowDate = new Date();

        const createSessionAndExecuteTxs = async () => {
            if (biconomyConnector.wallet) {
                biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);
                const transactionArray = await getCreateSessionTxs(
                    biconomyConnector.wallet.biconomySmartAccountConfig.chainId,
                    collateral
                );
                if (isEth) {
                    // swap eth to weth
                    const client = getPublicClient(wagmiConfig, { chainId: networkId });

                    const wethContractWithSigner = getContract({
                        abi: multipleCollateral.WETH.abi,
                        address: multipleCollateral.WETH.addresses[networkId],
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
                        value: buyInAmountParam,
                    };
                    transactionArray.push(wrapEthTx);
                }
                transactionArray.push(transaction);

                try {
                    const { wait } = await biconomyConnector.wallet.sendTransaction(
                        transactionArray,
                        isEth
                            ? {}
                            : {
                                  paymasterServiceData: {
                                      mode: PaymasterMode.ERC20,
                                      preferredToken: collateral,
                                  },
                              }
                    );

                    const {
                        receipt: { transactionHash },
                        success,
                    } = await wait();

                    console.log('tx hash: ', transactionHash);
                    console.log('success: ', success);

                    if (success === 'false') {
                    } else {
                        console.log('Transaction receipt', transactionHash);
                        return transactionHash;
                    }
                } catch (e) {
                    console.log(e);
                    window.localStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId]);
                    window.localStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION_VALID_UNTIL[networkId]);
                    throw new Error('tx failed');
                }
            }
        };

        if (!validUntil || Number(nowDate) > Number(dateUntilValid)) {
            const txHash = await createSessionAndExecuteTxs();
            return txHash;
        } else {
            try {
                const sessionSigner = await getSessionSigner(networkId);
                const transactionArray = [];
                if (isEth) {
                    // swap eth to weth
                    const client = getPublicClient(wagmiConfig, { chainId: networkId });

                    const wethContractWithSigner = getContract({
                        abi: multipleCollateral.WETH.abi,
                        address: multipleCollateral.WETH.addresses[networkId],
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
                        value: buyInAmountParam,
                    };
                    transactionArray.push(wrapEthTx);
                }
                transactionArray.push(transaction);
                const { wait } = await biconomyConnector.wallet.sendTransaction(
                    transactionArray,
                    isEth
                        ? {
                              params: {
                                  sessionSigner: sessionSigner,
                                  sessionValidationModule: sessionValidationContract.addresses[networkId],
                              },
                          }
                        : {
                              paymasterServiceData: {
                                  mode: PaymasterMode.ERC20,
                                  preferredToken: collateral,
                              },
                              params: {
                                  sessionSigner: sessionSigner,
                                  sessionValidationModule: sessionValidationContract.addresses[networkId],
                              },
                          }
                );

                const {
                    receipt: { transactionHash },
                    success,
                } = await wait();

                console.log('tx hash: ', transactionHash);
                console.log('success: ', success);

                if (success === 'false') {
                    throw new Error('tx failed');
                } else {
                    console.log('Transaction receipt', transactionHash);
                    return transactionHash;
                }
            } catch (e) {
                console.log(e);
                const txHash = await createSessionAndExecuteTxs();
                return txHash;
            }
        }
    }
};

const getCreateSessionTxs = async (networkId: SupportedNetwork, collateralAddress: string) => {
    if (biconomyConnector.wallet) {
        const privateKey = generatePrivateKey();
        const sessionKeyEOA = privateKeyToAccount(privateKey);

        const sessionModule = await createSessionKeyManagerModule({
            moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
            smartAccountAddress: biconomyConnector.address,
        });

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

        localStore.set(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId], privateKey);
        localStore.set(
            LOCAL_STORAGE_KEYS.SESSION_VALID_UNTIL[networkId],
            Math.floor(sixMonths.getTime() / 1000).toString()
        );

        const encodedCallSportsAMM = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [sportsAMMV2Contract.addresses[networkId], maxUint256],
        });

        const approvalTx = {
            to: collateralAddress,
            data: encodedCallSportsAMM,
        };

        const approvalTxClaim = {
            to: erc20Contract.addresses[networkId],
            data: encodedCallSportsAMM,
        };

        transactionArray.push(...[setSessiontrx, approvalTx, approvalTxClaim]);

        return transactionArray;
    }
    return [];
};

const getSessionSigner = async (networkId: SupportedNetwork) => {
    // try executing via Session module, if its not passing then enable session and execute with signing
    // generate sessionModule
    const sessionModule = await createSessionKeyManagerModule({
        moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
        smartAccountAddress: biconomyConnector.address,
    });
    biconomyConnector.wallet?.setActiveValidationModule(sessionModule);
    const sessionKeyPrivKey = localStore.get(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId]);

    const sessionAccount = privateKeyToAccount(sessionKeyPrivKey as any);
    const sessionSigner = createWalletClient({
        account: sessionAccount,
        chain: networkId as any,
        transport: http(biconomyConnector.wallet?.rpcProvider.transport.url),
    });
    return sessionSigner;
};
export const getPaymasterData = async (
    collateral: string,
    contract: ViemContract | undefined,
    methodName: string,
    data?: ReadonlyArray<any>,
    value?: any
): Promise<PaymasterFeeQuote | undefined> => {
    if (biconomyConnector.wallet && contract) {
        try {
            biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);
            const encodedCall = encodeFunctionData({
                abi: contract.abi,
                functionName: methodName,
                args: data ? data : ([] as any),
            });

            const transaction = {
                to: contract.address,
                data: encodedCall,
                value,
            };

            const userOp = await biconomyConnector.wallet.buildUserOp([transaction], {
                paymasterServiceData: {
                    mode: PaymasterMode.ERC20,
                    preferredToken: collateral,
                },
            });

            const biconomyPaymaster = biconomyConnector.wallet.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
            const feeQuotesData = await biconomyPaymaster?.getPaymasterFeeQuotesOrData(userOp, {
                mode: PaymasterMode.ERC20,
                preferredToken: collateral,
            });

            if (feeQuotesData.feeQuotes && feeQuotesData.feeQuotes[0].maxGasFeeUSD) {
                return feeQuotesData.feeQuotes[0];
            }
        } catch (e) {
            console.log(e);
        }
    }
};
