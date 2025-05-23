import { getChain } from '@biconomy/account';
import { RPC_LIST } from 'constants/network';
import { SupportedNetwork } from 'types/network';
import { createPublicClient, webSocket } from 'viem';

export const waitForTransactionViaSocket: (hash: string, networkId: SupportedNetwork) => Promise<any> = async (
    hash,
    networkId
) => {
    const result: any = await new Promise((resolve, reject) => {
        if (hash) {
            const ClientLocal = createPublicClient({
                chain: getChain(networkId),
                transport: webSocket(RPC_LIST.INFURA[networkId].wss),
            });
            let unsubscribe: any = null;

            unsubscribe = ClientLocal.watchBlocks({
                onBlock: async () => {
                    try {
                        const receipt = await ClientLocal.getTransactionReceipt({ hash: hash as any });
                        if (receipt) {
                            resolve(receipt);
                            unsubscribe();
                        }
                    } catch (e) {
                        unsubscribe();
                    }
                },
                pollingInterval: 100,
            });
        } else {
            reject(new Error('Transaction failed'));
        }
    });

    return result;
};
