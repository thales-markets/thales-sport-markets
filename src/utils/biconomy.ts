import {
    BatchedSessionRouterModule,
    DEFAULT_BATCHED_SESSION_ROUTER_MODULE,
    DEFAULT_SESSION_KEY_MANAGER_MODULE,
    SessionKeyManagerModule,
} from '@biconomy/modules';
import { IHybridPaymaster, PaymasterFeeQuote, PaymasterMode, SponsorUserOperationDto } from '@biconomy/paymaster';
import { HOSTED_WALLETS_ICONS, HOSTED_WALLETS_LABELS, PARTICAL_LOGINS_CLASSNAMES } from 'constants/wallet';
import { HostedWallets, ParticalTypes } from 'enums/wallet';
import { Contract, ethers } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils.js';
import { SupportedNetwork } from 'types/network';
import { Connector } from 'wagmi';
import biconomyConnector from './biconomyWallet';
import { getCollaterals } from './collaterals';
import erc20Contract from './contracts/sUSDContract';
import sportsAMMV2Contract from './contracts/sportsAMMV2Contract';
import { checkAllowance, getNetworkNameByNetworkId } from './network';
import networkConnector from './networkConnector';

// const ERC20SVM = '0x000000D50C68705bd6897B2d17c7de32FB519fDA'; // session validation module for erc20 transfers
const OVERTIMEVM = process.env.REACT_APP_OVERTIME_VALIDATION_MODULE; // overtime session validation module on Optimism
export const ETH_PAYMASTER = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'; // used for paying gas in ETH by AA

export const executeBiconomyTransaction = async (
    collateral: string,
    contract: Contract | undefined,
    methodName: string,
    data?: ReadonlyArray<any>
): Promise<ethers.providers.TransactionReceipt | undefined> => {
    if (biconomyConnector.wallet && contract) {
        // const managerModuleAddr = DEFAULT_SESSION_KEY_MANAGER_MODULE;

        // // get session key from local storage
        // const sessionKeyPrivKey = window.localStorage.getItem('sessionPKey');

        // console.log('sessionKeyPrivKey', sessionKeyPrivKey);
        // if (!sessionKeyPrivKey) {
        //     console.log('errore');
        // }
        // const sessionSigner = new ethers.Wallet(sessionKeyPrivKey as string);
        // console.log('sessionSigner', sessionSigner);

        // // generate sessionModule
        // const sessionModule = await SessionKeyManagerModule.create({
        //     moduleAddress: managerModuleAddr,
        //     smartAccountAddress: biconomyConnector.wallet.accountAddress as string,
        // });

        // // set active module to sessionModule
        // biconomyConnector.wallet = biconomyConnector.wallet.setActiveValidationModule(sessionModule);

        let populatedTx;
        if (data) {
            populatedTx = await contract.populateTransaction[methodName](...data);
        } else {
            populatedTx = await contract.populateTransaction[methodName]();
        }

        const transaction = {
            to: contract.address,
            data: populatedTx.data,
        };

        // const userOperation = await biconomyConnector.wallet.buildUserOp([transaction], {
        //     skipBundlerGasEstimation: false,
        //     params: {
        //         sessionSigner: sessionSigner,
        //         sessionValidationModule: OVERTIMEVM,
        //     },
        // });

        const userOperation = await biconomyConnector.wallet.buildUserOp([transaction], {
            skipBundlerGasEstimation: false,
        });

        const biconomyPaymaster = biconomyConnector.wallet.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

        const buyFeeQuotesResponse = await biconomyPaymaster.getPaymasterFeeQuotesOrData(userOperation, {
            mode: PaymasterMode.ERC20,
            tokenList: [collateral], // collateral for paying gas
        });

        const feeQuotesBuy = buyFeeQuotesResponse.feeQuotes as PaymasterFeeQuote[];
        const spenderBuy = buyFeeQuotesResponse.tokenPaymasterAddress || '';

        const finalUserOp = await biconomyConnector.wallet.buildTokenPaymasterUserOp(userOperation, {
            feeQuote: feeQuotesBuy[0],
            spender: spenderBuy,
            maxApproval: true,
        });

        const paymasterServiceData = {
            mode: PaymasterMode.ERC20,
            feeTokenAddress: feeQuotesBuy[0].tokenAddress,
            calculateGasLimits: true, // Always recommended to be true and especially when using token paymaster
        };

        try {
            const paymasterAndDataWithLimits = await biconomyPaymaster.getPaymasterAndData(
                finalUserOp,
                paymasterServiceData
            );
            finalUserOp.paymasterAndData = paymasterAndDataWithLimits.paymasterAndData;
            if (
                paymasterAndDataWithLimits.callGasLimit &&
                paymasterAndDataWithLimits.verificationGasLimit &&
                paymasterAndDataWithLimits.preVerificationGas
            ) {
                // Returned gas limits must be replaced in your op as you update paymasterAndData.
                // Because these are the limits paymaster service signed on to generate paymasterAndData
                // If you receive AA34 error check here..

                finalUserOp.callGasLimit = paymasterAndDataWithLimits.callGasLimit;
                finalUserOp.verificationGasLimit = paymasterAndDataWithLimits.verificationGasLimit;
                finalUserOp.preVerificationGas = paymasterAndDataWithLimits.preVerificationGas;
            }
        } catch (e) {
            console.log('error received ', e);
        }

        const signedUserOp = await biconomyConnector.wallet.signUserOp(finalUserOp);
        const response = await biconomyConnector.wallet.sendSignedUserOp(signedUserOp);
        // const response = await biconomyConnector.wallet.sendUserOp(finalUserOp, {
        //     sessionSigner: sessionSigner,
        //     sessionValidationModule: OVERTIMEVM,
        // });
        const receipt = (await response.wait(1)).receipt;
        return receipt;
    }
};

export const getGasFeesForTx = async (
    collateral: string,
    contract: Contract | undefined,
    methodName: string,
    data?: ReadonlyArray<any>
): Promise<number | undefined> => {
    if (biconomyConnector.wallet && contract) {
        // // get session key from local storage
        // const sessionKeyPrivKey = window.localStorage.getItem('sessionPKey');

        // console.log('sessionKeyPrivKey', sessionKeyPrivKey);
        // if (!sessionKeyPrivKey) {
        //     console.log('errore');
        // }
        // const sessionSigner = new ethers.Wallet(sessionKeyPrivKey as string);
        // console.log('sessionSigner', sessionSigner);

        let populatedTx;
        if (data) {
            populatedTx = await contract.populateTransaction[methodName](...data);
        } else {
            populatedTx = await contract.populateTransaction[methodName]();
        }

        const transaction = {
            to: contract.address,
            data: populatedTx.data,
        };

        // {
        //     skipBundlerGasEstimation: false,
        //     params: {
        //         sessionSigner: sessionSigner,
        //         sessionValidationModule: OVERTIMEVM,
        //     },
        // }

        const userOperation = await biconomyConnector.wallet.buildUserOp([transaction], {
            skipBundlerGasEstimation: false,
        });

        const biconomyPaymaster = biconomyConnector.wallet.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

        const buyFeeQuotesResponse = await biconomyPaymaster.getPaymasterFeeQuotesOrData(userOperation, {
            mode: PaymasterMode.ERC20,
            tokenList: [collateral], // collateral for paying gas
        });

        const feeQuotesBuy = buyFeeQuotesResponse.feeQuotes as PaymasterFeeQuote[];

        return feeQuotesBuy[0] ? feeQuotesBuy[0].maxGasFee : 0;
    }
};

export const checkSession = async () => {
    try {
        if (biconomyConnector.wallet) {
            const isSessionKeyModuleEnabled = await biconomyConnector.wallet.isModuleEnabled(
                DEFAULT_SESSION_KEY_MANAGER_MODULE
            );
            const isBRMenabled = await biconomyConnector.wallet.isModuleEnabled(DEFAULT_BATCHED_SESSION_ROUTER_MODULE);
            const isActiveValidationModuleDefined = biconomyConnector.wallet.isActiveValidationModuleDefined();
            console.log('sessions: ', isSessionKeyModuleEnabled, isBRMenabled, isActiveValidationModuleDefined);
            return isSessionKeyModuleEnabled && isBRMenabled;
        }
    } catch {
        return false;
    }
};

export const createSession = async (scwAddress: string, collateralAddress: string, networkId: SupportedNetwork) => {
    const biconomySmartAccount = biconomyConnector.wallet;
    if (scwAddress && biconomySmartAccount) {
        try {
            const managerModuleAddr = DEFAULT_SESSION_KEY_MANAGER_MODULE;
            const routerModuleAddr = DEFAULT_BATCHED_SESSION_ROUTER_MODULE;

            // -----> setMerkle tree tx flow
            // create dapp side session key
            const sessionSigner = ethers.Wallet.createRandom();
            const sessionKeyEOA = await sessionSigner.getAddress();
            window.localStorage.setItem('sessionPKey', sessionSigner.privateKey);

            // generate sessionModule
            const sessionModule = await SessionKeyManagerModule.create({
                moduleAddress: managerModuleAddr,
                smartAccountAddress: scwAddress,
            });

            const sessionRouterModule = await BatchedSessionRouterModule.create({
                moduleAddress: routerModuleAddr,
                sessionKeyManagerModule: sessionModule,
                smartAccountAddress: scwAddress,
            });

            // create session key data
            const sessionKeyData = defaultAbiCoder.encode(
                ['address', 'address', 'address', 'uint256'],
                [
                    sessionKeyEOA,
                    collateralAddress, // erc20 token address
                    sportsAMMV2Contract.addresses[networkId], // receiver address, SportsAMM and ParlayAMM
                    ethers.utils.parseUnits('50'.toString(), 6).toHexString(), // 50 usdc amount
                ]
            );

            const dateAfter = new Date();
            const dateUntil = new Date();
            dateUntil.setHours(dateAfter.getHours() + 1); // add 1h to date, so we create 1h session
            const sessionTxData = await sessionRouterModule.createSessionData([
                {
                    validUntil: dateUntil.getTime(),
                    validAfter: dateAfter.getTime(),
                    sessionValidationModule: OVERTIMEVM ?? '',
                    sessionPublicKey: sessionKeyEOA,
                    sessionKeyData: sessionKeyData,
                },
            ]);

            // tx to set session key
            const tx3 = {
                to: managerModuleAddr, // session manager module address
                data: sessionTxData.data,
            };
            let isSessionKeyModuleEnabled = false;
            try {
                isSessionKeyModuleEnabled = await biconomySmartAccount.isModuleEnabled(
                    DEFAULT_SESSION_KEY_MANAGER_MODULE
                );
            } catch {
                console.log('session is not enabled');
            }

            let isBRMenabled = false;
            try {
                isBRMenabled = await biconomySmartAccount.isModuleEnabled(DEFAULT_BATCHED_SESSION_ROUTER_MODULE);
            } catch {
                console.log('session is not enabled');
            }

            const transactionArray = [];
            if (!isSessionKeyModuleEnabled) {
                // -----> enableModule session manager module
                const tx1 = await biconomySmartAccount.getEnableModuleData(managerModuleAddr);
                transactionArray.push(tx1);
            }
            if (!isBRMenabled) {
                // -----> enableModule batched session router module
                const tx2 = await biconomySmartAccount.getEnableModuleData(routerModuleAddr);
                transactionArray.push(tx2);
            }
            transactionArray.push(tx3);

            const collateralContract = new Contract(
                collateralAddress,
                erc20Contract.abi,
                biconomyConnector.wallet?.provider
            );

            const [sportsAMMAllowance] = await Promise.all([
                checkAllowance(
                    ethers.constants.MaxUint256,
                    collateralContract,
                    scwAddress,
                    sportsAMMV2Contract.addresses[networkId]
                ),
            ]);
            const { signer } = networkConnector;

            if (signer) {
                const collateralContractWithSigner = collateralContract.connect(signer);
                if (!sportsAMMAllowance) {
                    const populatedTx = await collateralContractWithSigner.populateTransaction.approve(
                        sportsAMMV2Contract.addresses[networkId],
                        ethers.constants.MaxUint256
                    );
                    const transaction = {
                        to: collateralContractWithSigner.address,
                        data: populatedTx.data,
                    };
                    transactionArray.push(transaction);
                }
                // if (!parlayAMMAllowance) {
                //     const populatedTx = await collateralContractWithSigner.populateTransaction.approve(
                //         parlayMarketsAMMContract.addresses[networkId],
                //         ethers.constants.MaxUint256
                //     );
                //     const transaction = {
                //         to: collateralContractWithSigner.address,
                //         data: populatedTx.data,
                //     };
                //     transactionArray.push(transaction);
                // }
            }

            const partialUserOp = await biconomySmartAccount.buildUserOp(transactionArray);

            const biconomyPaymaster = biconomySmartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

            const buyFeeQuotesResponse = await biconomyPaymaster.getPaymasterFeeQuotesOrData(partialUserOp, {
                mode: PaymasterMode.ERC20,
                tokenList: [collateralAddress], // collateral for paying gas
            });

            console.log('buyFeeQuotesResponse: ', buyFeeQuotesResponse);

            const feeQuotesBuy = buyFeeQuotesResponse.feeQuotes as PaymasterFeeQuote[];
            const spenderBuy = buyFeeQuotesResponse.tokenPaymasterAddress || '';

            const finalUserOp = await biconomySmartAccount.buildTokenPaymasterUserOp(partialUserOp, {
                feeQuote: feeQuotesBuy[0],
                spender: spenderBuy,
                maxApproval: true,
            });

            const paymasterServiceData = {
                mode: PaymasterMode.ERC20,
                feeTokenAddress: feeQuotesBuy[0].tokenAddress,
                calculateGasLimits: true, // Always recommended and especially when using token paymaster
            };

            try {
                const paymasterAndDataWithLimits = await biconomyPaymaster.getPaymasterAndData(
                    finalUserOp,
                    paymasterServiceData
                );
                finalUserOp.paymasterAndData = paymasterAndDataWithLimits.paymasterAndData;
                if (
                    paymasterAndDataWithLimits.callGasLimit &&
                    paymasterAndDataWithLimits.verificationGasLimit &&
                    paymasterAndDataWithLimits.preVerificationGas
                ) {
                    // Returned gas limits must be replaced in your op as you update paymasterAndData.
                    // Because these are the limits paymaster service signed on to generate paymasterAndData
                    // If you receive AA34 error check here..

                    finalUserOp.callGasLimit = paymasterAndDataWithLimits.callGasLimit;
                    finalUserOp.verificationGasLimit = paymasterAndDataWithLimits.verificationGasLimit;
                    finalUserOp.preVerificationGas = paymasterAndDataWithLimits.preVerificationGas;
                }
            } catch (e) {
                console.log('error received ', e);
            }

            const userOpResponse = await biconomySmartAccount.sendUserOp(finalUserOp);
            const transactionDetails = await userOpResponse.wait();
            console.log('txHash', transactionDetails.receipt.transactionHash);
        } catch (err: any) {
            console.error(err);
        }
    }
};

export const getParticleConnectors = (connectors: Connector[]): Connector[] => {
    return connectors.filter(
        (connector: any) => connector?.name.toLowerCase() == 'particle' || connector?.id.toLowerCase() == 'particle'
    );
};

export const getHostedConnectors = (connectors: Connector[]): Connector[] => {
    return connectors.filter(
        (connector: any) => connector?.name.toLowerCase() !== 'particle' && connector?.id.toLowerCase() !== 'particle'
    );
};

export const getSpecificConnectorFromConnectorsArray = (
    connectors: Connector[],
    name: string,
    particle?: boolean
): Connector | undefined => {
    if (particle) {
        return connectors.find((connector: any) => connector?.options?.authType == name);
    }
    return connectors.find((connector: any) => connector.id == name);
};

export const getWalletIcon = (walletId: HostedWallets) => {
    return HOSTED_WALLETS_ICONS.find((item) => item.walletId == walletId)?.image;
};

export const getWalleti18Label = (walletId: HostedWallets) => {
    const label = HOSTED_WALLETS_LABELS.find((item) => item.walletId == walletId)?.labelKey;
    return label ? label : '';
};

export const getClassNameForParticalLogin = (socialId: ParticalTypes) => {
    const label = PARTICAL_LOGINS_CLASSNAMES.find((item) => item.socialId == socialId)?.className;
    return label ? label : '';
};

export const getOnRamperUrl = (
    apiKey: string,
    walletAddress: string,
    networkId: SupportedNetwork,
    selectedToken: number
) => {
    return `https://buy.onramper.com?apiKey=${apiKey}&mode=buy&onlyCryptos=${
        getCollaterals(networkId)[selectedToken]
    }_${getNetworkNameByNetworkId(networkId, true)}&networkWallets=${getNetworkNameByNetworkId(
        networkId,
        true
    )}:${walletAddress}`;
};
