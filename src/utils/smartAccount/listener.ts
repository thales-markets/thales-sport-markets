import { getPublicClient } from '@wagmi/core';
import { wagmiConfig } from 'pages/Root/wagmiConfig';
import { SupportedNetwork } from 'types/network';
import biconomyConnector from 'utils/biconomyWallet';
import { waitForTransactionViaSocket } from 'utils/listener';
import { delay } from 'utils/timer';
import { Client } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { USER_OP_FAILED } from './errors';

export const validateTx = async (
    transactionHash: string | undefined,
    userOpHash: string | undefined,
    networkId: SupportedNetwork
) => {
    if (!transactionHash) throw new Error('waitForTxHash did not return transactionHash');
    if (!userOpHash) throw new Error('sendBiconomyTransaction did not return userOpHash');
    const client = getPublicClient(wagmiConfig, { chainId: networkId });

    const txReceipt = await Promise.race([
        waitForTransactionReceipt(client as Client, {
            hash: transactionHash as any,
        }),
        waitForTransactionViaSocket(transactionHash as any, networkId),
    ]);

    if ((await validateUserOp(userOpHash)) && txReceipt.status === 'success') {
        return transactionHash;
    } else {
        throw new Error(`${USER_OP_FAILED}, check txHash: ${transactionHash}`);
    }
};

const validateUserOp = async (userOpHash: string) => {
    let RETRY_COUNT = 0;
    let userOp;

    while (RETRY_COUNT <= 30) {
        userOp = await biconomyConnector.wallet?.bundler?.getUserOpStatus(userOpHash);
        console.log(userOp);
        if (userOp?.state !== 'SUBMITTED') {
            break;
        }
        RETRY_COUNT++;
        await delay(100);
    }

    if (userOp?.state === 'SUBMITTED' || userOp?.userOperationReceipt === undefined) return false;
    if (userOp?.userOperationReceipt?.success === 'false') return false;
    return true;
};
