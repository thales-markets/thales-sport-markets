import { Contract, ethers } from 'ethers';
import biconomyConnector from './biconomyWallet';
import { IHybridPaymaster, PaymasterFeeQuote, PaymasterMode, SponsorUserOperationDto } from '@biconomy/paymaster';
import { Connector } from 'wagmi';
import { HostedWallets, ParticalTypes } from 'enums/wallet';
import { HOSTED_WALLETS_ICONS, HOSTED_WALLETS_LABELS, PARTICAL_LOGINS_CLASSNAMES } from 'constants/wallet';
import {
    BatchedSessionRouterModule,
    DEFAULT_BATCHED_SESSION_ROUTER_MODULE,
    DEFAULT_SESSION_KEY_MANAGER_MODULE,
    SessionKeyManagerModule,
} from '@biconomy/modules';
import { defaultAbiCoder } from 'ethers/lib/utils.js';

const ERC20SVM = '0x000000D50C68705bd6897B2d17c7de32FB519fDA'; // session validation module for erc20 transfers
export const ETH_PAYMASTER = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'; // used for paying gas in ETH by AA

export const executeBiconomyTransaction = async (
    collateral: string,
    contract: Contract | undefined,
    methodName: string,
    data?: ReadonlyArray<any>
): Promise<string | ethers.providers.TransactionReceipt> => {
    if (biconomyConnector.wallet && contract) {
        console.log('collateral: ', collateral);
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

        const userOperation = await biconomyConnector.wallet.buildUserOp([transaction]);

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

        const signedUserOp = await biconomyConnector.wallet.signUserOp(finalUserOp);
        const response = await biconomyConnector.wallet.sendSignedUserOp(signedUserOp);
        const receipt = (await response.wait(1)).receipt;
        console.log(receipt);
        return receipt;
    }

    return '';
};

export const checkSession = async () => {
    if (biconomyConnector.wallet) {
        const isSessionKeyModuleEnabled = await biconomyConnector.wallet.isModuleEnabled(
            DEFAULT_SESSION_KEY_MANAGER_MODULE
        );
        const isBRMenabled = await biconomyConnector.wallet.isModuleEnabled(DEFAULT_BATCHED_SESSION_ROUTER_MODULE);
        console.log('is session enabled: ', isSessionKeyModuleEnabled);
        console.log('is batched session enabled: ', isBRMenabled);
    }
};

export const createSession = async (scwAddress: string, collateralAddress: string, receiverAddress: string) => {
    const biconomySmartAccount = biconomyConnector.wallet;
    if (scwAddress && biconomySmartAccount) {
        try {
            const managerModuleAddr = DEFAULT_SESSION_KEY_MANAGER_MODULE;
            const routerModuleAddr = DEFAULT_BATCHED_SESSION_ROUTER_MODULE;

            const mockSessionModuleAddr = '0x7Ba4a7338D7A90dfA465cF975Cc6691812C3772E';

            // -----> setMerkle tree tx flow
            // create dapp side session key
            const sessionSigner = ethers.Wallet.createRandom();
            const sessionKeyEOA = await sessionSigner.getAddress();
            console.log('sessionKeyEOA', sessionKeyEOA);
            // BREWARE JUST FOR DEMO: update local storage with session key
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

            // cretae session key data
            const sessionKeyData = defaultAbiCoder.encode(
                ['address', 'address', 'address', 'uint256'],
                [
                    sessionKeyEOA,
                    collateralAddress, // erc20 token address
                    receiverAddress, // receiver address, SportsAMM and ParlayAMM
                    ethers.utils.parseUnits('50'.toString(), 6).toHexString(), // 50 usdc amount
                ]
            );

            const sessionKeyData2 = defaultAbiCoder.encode(['address'], [sessionKeyEOA]);

            const sessionTxData = await sessionRouterModule.createSessionData([
                {
                    validUntil: 0,
                    validAfter: 0,
                    sessionValidationModule: ERC20SVM,
                    sessionPublicKey: sessionKeyEOA,
                    sessionKeyData: sessionKeyData,
                },
                {
                    validUntil: 0,
                    validAfter: 0,
                    sessionValidationModule: mockSessionModuleAddr,
                    sessionPublicKey: sessionKeyEOA,
                    sessionKeyData: sessionKeyData2,
                },
            ]);
            console.log('sessionTxData', sessionTxData);

            // tx to set session key
            const tx3 = {
                to: managerModuleAddr, // session manager module address
                data: sessionTxData.data,
            };

            const isSessionKeyModuleEnabled = await biconomySmartAccount.isModuleEnabled(
                DEFAULT_SESSION_KEY_MANAGER_MODULE
            );
            const isBRMenabled = await biconomySmartAccount.isModuleEnabled(DEFAULT_BATCHED_SESSION_ROUTER_MODULE);

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

            const partialUserOp = await biconomySmartAccount.buildUserOp(transactionArray);
            const userOpResponse = await biconomySmartAccount.sendUserOp(partialUserOp);
            console.log(`userOp Hash: ${userOpResponse.userOpHash}`);
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
