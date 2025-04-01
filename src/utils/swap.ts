import { getWalletClient } from '@wagmi/core';
import axios from 'axios';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { NATIVE_TOKEN_ADDRES, ZERO_ADDRESS } from 'constants/network';
import { ContractType } from 'enums/contract';
import { wagmiConfig } from 'pages/Root/wagmiConfig';
import { coinFormatter, Coins, COLLATERAL_DECIMALS } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { SwapParams } from 'types/swap';
import { Address, encodeFunctionData } from 'viem';
import { getCollateralByAddress, getCollateralIndex } from './collaterals';
import { getContractInstance } from './contract';
import multipleCollateralContract from './contracts/multipleCollateralContract';

export const PARASWAP_TRANSFER_PROXY = '0x6a000f20005980200259b80c5102003040001068';

export const getSwapParams = (
    networkId: SupportedNetwork,
    walletAddress: Address,
    buyIn: bigint,
    tokenAddress: Address,
    dstTokenAddress?: Address
): SwapParams => {
    const src = tokenAddress === ZERO_ADDRESS ? NATIVE_TOKEN_ADDRES : tokenAddress;

    return {
        src,
        dst:
            dstTokenAddress ??
            (multipleCollateralContract[CRYPTO_CURRENCY_MAP.OVER as Coins].addresses[networkId] as Address), // OVER address
        amount: buyIn.toString(),
        from: walletAddress,
        slippage: 1, // 1%
        disableEstimate: false,
        allowPartialFill: false,
    };
};

export const getQuote = async (networkId: SupportedNetwork, swapParams: SwapParams) => {
    const API_URL = 'https://api.paraswap.io';

    try {
        const { data: quote } = await axios.get(`${API_URL}/prices`, {
            params: {
                network: networkId,
                srcToken: swapParams.src,
                destToken: swapParams.dst,
                amount: swapParams.amount, // 100 DAI
                srcDecimals: COLLATERAL_DECIMALS[getCollateralByAddress(swapParams.src, networkId)],
                destDecimals: COLLATERAL_DECIMALS[getCollateralByAddress(swapParams.dst, networkId)],
                mode: 'delta',
                side: 'SELL',
                version: 6.2,
            },
        });
        return quote.priceRoute.destAmount
            ? coinFormatter(quote.priceRoute.destAmount, networkId, CRYPTO_CURRENCY_MAP.OVER as Coins)
            : 0;
    } catch (e) {
        console.log(e);

        return 0;
    }
};

export const buildTxForApproveTradeWithRouter = async (
    networkId: SupportedNetwork,
    tokenAddress: Address,
    client: any,
    amount: string
) => {
    try {
        const collateralContractWithSigner = getContractInstance(
            ContractType.MULTICOLLATERAL,
            { client, networkId },
            getCollateralIndex(networkId, getCollateralByAddress(tokenAddress, networkId))
        );
        const encodedCall = encodeFunctionData({
            abi: collateralContractWithSigner?.abi,
            functionName: 'approve',
            args: [PARASWAP_TRANSFER_PROXY, amount],
        });

        const transaction = {
            to: collateralContractWithSigner?.address,
            data: encodedCall,
            value: '',
        };

        return transaction;
    } catch (e) {
        console.log(e);
        return undefined;
    }
};

// Fetch the swap transaction details from the API (returns { dstAmount, tx })
export const buildTxForSwap = async (
    networkId: SupportedNetwork,
    swapParams: SwapParams,
    walletAddress: string
): Promise<any> => {
    const API_URL = 'https://api.paraswap.io';

    try {
        const { data: quote } = await axios.get(`${API_URL}/prices`, {
            params: {
                network: networkId,
                srcToken: swapParams.src,
                destToken: swapParams.dst,
                amount: swapParams.amount, // 100 DAI
                srcDecimals: COLLATERAL_DECIMALS[getCollateralByAddress(swapParams.src, networkId)],
                destDecimals: COLLATERAL_DECIMALS[getCollateralByAddress(swapParams.dst, networkId)],
                mode: 'delta',
                side: 'SELL',
                version: 6.2,
            },
        });

        const response = await axios.post(`${API_URL}/transactions/${networkId}`, {
            priceRoute: quote.priceRoute,
            srcToken: swapParams.src,
            destToken: swapParams.dst,
            srcAmount: swapParams.amount, // 100 DAI
            destAmount: quote.priceRoute.destAmount,
            userAddress: walletAddress,
        });

        const transaction = {
            to: response.data.to,
            data: response.data.data,
            value: response.data.value,
        };

        return Promise.resolve({ dstAmount: BigInt(quote.priceRoute.destAmount), tx: transaction });
    } catch (e) {
        console.log(e);
        return Promise.resolve({ dstAmount: BigInt(0), tx: '' });
    }
};

// Send a transaction, return its hash
export const sendTransaction = async (rawTransaction: any) => {
    let txHash = '';
    try {
        rawTransaction.value = BigInt(rawTransaction.value);

        const walletClient = await getWalletClient(wagmiConfig);

        if (walletClient) {
            txHash = await walletClient.sendTransaction(rawTransaction);
        }
    } catch (e) {
        console.log(e);
        console.log('params:', rawTransaction);
    }

    return txHash;
};
