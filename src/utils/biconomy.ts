import { Contract, ethers } from 'ethers';
import biconomyConnector from './biconomyWallet';
import { IHybridPaymaster, PaymasterFeeQuote, PaymasterMode, SponsorUserOperationDto } from '@biconomy/paymaster';
import { Network } from 'enums/network';
import multipleCollateral from './contracts/multipleCollateralContract';
import { Connector } from 'wagmi';
import { HostedWallets } from 'enums/wallet';
import { HOSTED_WALLETS_ICONS, HOSTED_WALLETS_LABELS } from 'constants/wallet';

export const executeBiconomyTransaction = async (
    network: Network,
    contract: Contract | undefined,
    methodName: string,
    data?: ReadonlyArray<any>
): Promise<string | ethers.providers.TransactionReceipt> => {
    if (biconomyConnector.wallet && contract) {
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
            tokenList: [multipleCollateral.USDC.addresses[network]],
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
    name: string
): Connector | undefined => {
    return connectors.find((connector: any) => connector.id == name);
};

export const getWalletIcon = (walletId: HostedWallets) => {
    return HOSTED_WALLETS_ICONS.find((item) => item.walletId == walletId)?.image;
};

export const getWalleti18Label = (walletId: HostedWallets) => {
    const label = HOSTED_WALLETS_LABELS.find((item) => item.walletId == walletId)?.labelKey;
    return label ? label : '';
};
