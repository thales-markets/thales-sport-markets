import { createSessionKeyManagerModule, DEFAULT_SESSION_KEY_MANAGER_MODULE, PaymasterMode } from '@biconomy/account';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { addMonths } from 'date-fns';
import localforage from 'localforage';
import { SupportedNetwork } from 'types/network';
import liveTradingProcessorContract from 'utils/contracts/liveTradingProcessorContract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import sessionValidationContract from 'utils/contracts/sessionValidationContract';
import sgpTradingProcessorContract from 'utils/contracts/sgpTradingProcessorContract';
import sportsAMMV2Contract from 'utils/contracts/sportsAMMV2Contract';
import biconomyConnector from 'utils/smartAccount/biconomyWallet';
import { Address, createWalletClient, encodeFunctionData, http, maxUint256 } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { ERROR_SESSION_NOT_FOUND, USER_OP_FAILED, USER_REJECTED_ERROR } from '../constants/errors';
import { validateTx } from './listener';

export const activateOvertimeAccount = async (params: { networkId: SupportedNetwork; collateralAddress: string }) => {
    if (biconomyConnector.wallet) {
        biconomyConnector.wallet.setActiveValidationModule(biconomyConnector.wallet.defaultValidationModule);
        try {
            const { waitForTxHash, userOpHash } = await biconomyConnector.wallet.sendTransaction(
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

            return await validateTx(transactionHash, userOpHash, params.networkId);
        } catch (e) {
            console.log(e);
            try {
                if ((e as any).toString().toLowerCase().includes(USER_REJECTED_ERROR)) {
                    throw new Error('Transaction rejected by user.');
                }
                if ((e as any).toString().toLowerCase().includes(USER_OP_FAILED)) {
                    throw e;
                }
                const { waitForTxHash, userOpHash } = await biconomyConnector.wallet.sendTransaction(
                    [...(await getCreateSessionTxs(params.networkId)), ...getApprovalTxs(params.networkId)],
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

export const getSessionSigner = async (networkId: SupportedNetwork) => {
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
