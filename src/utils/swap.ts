import { generalConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { Network } from 'enums/network';
import { BigNumber, BigNumberish } from 'ethers';
import { SupportedNetwork } from 'types/network';
import { SwapParams } from 'types/swap';
import { Coins } from 'types/tokens';
import { Address } from 'viem';
import multipleCollateralContract from './contracts/multipleCollateralContract';
import networkConnector from './networkConnector';
import { delay } from './timer';
import { coinFormatter } from 'thales-utils';

export const getSwapParams = (
    networkId: SupportedNetwork,
    walletAddress: Address,
    buyIn: BigNumber,
    tokenAddress: Address
): SwapParams => {
    return {
        src: tokenAddress,
        dst: multipleCollateralContract[CRYPTO_CURRENCY_MAP.THALES as Coins].addresses[networkId] as Address, // THALES address
        amount: buyIn.toString(),
        from: walletAddress,
        slippage: 3,
        disableEstimate: false,
        allowPartialFill: false,
    };
};

// Construct full API request URL
const apiRequestUrl = (networkId: Network, methodName: string, queryParams: any) => {
    return (
        generalConfig.API_URL +
        `/1inch-proxy/swap/v6.0/${networkId}${methodName}?${new URLSearchParams(queryParams).toString()}`
    );
};

export const getQuote = async (networkId: SupportedNetwork, swapParams: SwapParams) => {
    const url = apiRequestUrl(networkId, '/quote', { ...swapParams });

    const response = await fetch(url);
    const responseBody = response.ok ? await response.json() : Promise.resolve({ dstAmount: '' });

    return responseBody.dstAmount
        ? coinFormatter(responseBody.dstAmount, networkId, CRYPTO_CURRENCY_MAP.THALES as Coins)
        : 0;
};

export const checkSwapAllowance = async (
    networkId: SupportedNetwork,
    walletAddress: Address,
    tokenAddress: Address,
    amount: BigNumber
) => {
    const url = apiRequestUrl(networkId, '/approve/allowance', { tokenAddress, walletAddress });

    try {
        const response = await fetch(url);
        const data = await response.json();
        return BigNumber.from(data.allowance).gte(amount);
    } catch (err: any) {
        console.log(err);
        return false;
    }
};

export const buildTxForApproveTradeWithRouter = async (
    networkId: SupportedNetwork,
    walletAddress: Address,
    tokenAddress: Address,
    amount?: string
) => {
    const url = apiRequestUrl(networkId, '/approve/transaction', amount ? { tokenAddress, amount } : { tokenAddress });

    const response = await fetch(url);
    const rawTransaction = await response.json();

    const gasLimit = Number(
        await networkConnector.signer?.estimateGas({
            ...rawTransaction,
            from: walletAddress,
        })
    );

    return {
        ...rawTransaction,
        gas: gasLimit,
        from: walletAddress,
    };
};

// Fetch the swap transaction details from the API (returns { dstAmount, tx })
export const buildTxForSwap = async (
    networkId: SupportedNetwork,
    swapParams: SwapParams
): Promise<{ dstAmount: BigNumberish; tx: string }> => {
    const url = apiRequestUrl(networkId, '/swap', swapParams);

    const response = await fetch(url);
    const responseBody = response.ok ? await response.json() : Promise.resolve({ dstAmount: '', tx: '' });

    return responseBody;
};

// Send a transaction, return its hash
export const sendTransaction = async (transaction: any) => {
    // TODO: check signer for different connections
    console.log(networkConnector.signer?.provider);

    let txHash = '';
    try {
        txHash = await (networkConnector.signer?.provider as any).provider.request({
            method: 'eth_sendTransaction',
            params: [transaction],
        });
    } catch (e) {
        console.log(e);
    }

    return txHash;
};

// TODO: delete
export const handleSwap = async (
    networkId: SupportedNetwork,
    walletAddress: Address,
    buyIn: BigNumber,
    tokenAddress: Address
) => {
    if (multipleCollateralContract) {
        const swapParams = getSwapParams(networkId, walletAddress, buyIn, tokenAddress);

        const swapAllowance = await checkSwapAllowance(networkId, walletAddress, swapParams.src, buyIn);
        await delay(1000); // rate limit

        if (!swapAllowance) {
            const approveSwapTransaction = await buildTxForApproveTradeWithRouter(
                networkId,
                walletAddress,
                swapParams.src,
                buyIn.toString()
            );
            const approveTxHash = await sendTransaction(approveSwapTransaction);
            console.log('Approve tx hash: ', approveTxHash);
        }

        const swapTransaction = (await buildTxForSwap(networkId, swapParams)).tx;
        const swapTxHash = swapTransaction ? await sendTransaction(swapTransaction) : undefined;
        console.log('Swap tx hash: ', swapTxHash);
    }
};
