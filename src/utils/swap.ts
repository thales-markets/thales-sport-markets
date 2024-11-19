import { generalConfig } from 'config/general';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { NATIVE_TOKEN_ADDRES, ZERO_ADDRESS } from 'constants/network';
import { Network } from 'enums/network';
import { BigNumber, BigNumberish } from 'ethers';
import { coinFormatter, Coins } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { SwapParams } from 'types/swap';
import { Address } from 'viem';
import multipleCollateralContract from './contracts/multipleCollateralContract';
import networkConnector from './networkConnector';
import { delay } from './timer';

const REFERRER_ADDRESS = '0x1777C6d588fd931751762836811529c0073D6376';

export const getSwapParams = (
    networkId: SupportedNetwork,
    walletAddress: Address,
    buyIn: BigNumber,
    tokenAddress: Address
): SwapParams => {
    const src = tokenAddress === ZERO_ADDRESS ? NATIVE_TOKEN_ADDRES : tokenAddress;

    return {
        src,
        dst: multipleCollateralContract[CRYPTO_CURRENCY_MAP.THALES as Coins].addresses[networkId] as Address, // THALES address
        amount: buyIn.toString(),
        from: walletAddress,
        slippage: 1, // 1%
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

const MAX_RETRY_COUNT = 5;

export const getQuote = async (networkId: SupportedNetwork, swapParams: SwapParams) => {
    const url = apiRequestUrl(networkId, '/quote', { ...swapParams });

    try {
        let response = await fetch(url);

        let retryCount = 0;
        while (response.status === 429 && retryCount < MAX_RETRY_COUNT) {
            await delay(1200);
            response = await fetch(url);
            retryCount++;
        }
        const responseBody = response.ok ? await response.json() : Promise.resolve({ dstAmount: '' });

        return responseBody.dstAmount
            ? coinFormatter(responseBody.dstAmount, networkId, CRYPTO_CURRENCY_MAP.THALES as Coins)
            : 0;
    } catch (e) {
        console.log(e);
        return 0;
    }
};

export const checkSwapAllowance = async (
    networkId: SupportedNetwork,
    walletAddress: Address,
    tokenAddress: Address,
    amount: BigNumber
) => {
    const url = apiRequestUrl(networkId, '/approve/allowance', { tokenAddress, walletAddress });

    try {
        let response = await fetch(url, { cache: 'no-cache' });

        let retryCount = 0;
        while (response.status === 429 && retryCount < MAX_RETRY_COUNT) {
            await delay(2400);
            response = await fetch(url);
            retryCount++;
        }

        const data = response.ok ? await response.json() : { allowance: 0 };
        return BigNumber.from(data.allowance).gte(amount);
    } catch (e) {
        console.log(e);
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

    try {
        let response = await fetch(url);

        let retryCount = 0;
        while (response.status === 429 && retryCount < MAX_RETRY_COUNT) {
            await delay(2000);
            response = await fetch(url);
            retryCount++;
        }

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
    } catch (e) {
        console.log(e);
        return undefined;
    }
};

// Fetch the swap transaction details from the API (returns { dstAmount, tx })
export const buildTxForSwap = async (
    networkId: SupportedNetwork,
    swapParams: SwapParams
): Promise<{ dstAmount: BigNumberish; tx: string }> => {
    const url = apiRequestUrl(networkId, '/swap', { ...swapParams, referrer: REFERRER_ADDRESS });

    try {
        let response = await fetch(url);

        let retryCount = 0;
        while (response.status === 429 && retryCount < MAX_RETRY_COUNT) {
            await delay(2000);
            response = await fetch(url);
            retryCount++;
        }

        const responseBody = response.ok ? await response.json() : Promise.resolve({ dstAmount: '', tx: '' });

        return responseBody;
    } catch (e) {
        console.log(e);
        return Promise.resolve({ dstAmount: '', tx: '' });
    }
};

// Send a transaction, return its hash
export const sendTransaction = async (rawTransaction: any) => {
    rawTransaction.value = BigNumber.from(rawTransaction.value).toHexString();

    let txHash = '';
    try {
        txHash = await (networkConnector.signer?.provider as any).provider.request({
            method: 'eth_sendTransaction',
            params: [rawTransaction],
        });
    } catch (e) {
        console.log(e);
        console.log('params:', rawTransaction);
    }

    return txHash;
};
