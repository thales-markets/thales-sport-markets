import { Contract, ethers } from 'ethers';
import { Network } from 'enums/network';
import etherspotConnector from './etherspotConnector';

export const EtherspotProviderByNetworkId: Record<Network, string> = {
    [Network.OptimismMainnet]: 'https://optimism-bundler.etherspot.io/',
    [Network.OptimismGoerli]: '',
    [Network.ArbitrumOne]: 'https://arbitrum-bundler.etherspot.io/',
};

export const executeEtherspotTransaction = async (
    networkId: Network,
    contract: Contract | undefined,
    methodName: string,
    data?: ReadonlyArray<any>
): Promise<string | null> => {
    const primeSdk = etherspotConnector.primeSdk;
    if (!primeSdk || primeSdk === null || !contract) return null;

    const provider = new ethers.providers.JsonRpcProvider(EtherspotProviderByNetworkId[networkId]);
    const contractAddress = contract.address;

    // get contract interface
    const contractInstance = contract.connect(provider);

    // get method encoded data
    const transactionData = contractInstance.interface.encodeFunctionData(methodName, data);

    // clear the transaction batch
    await primeSdk.clearUserOpsFromBatch();

    // add transactions to the batch
    const userOpsBatch = await primeSdk.addUserOpsToBatch({
        to: contractAddress,
        data: transactionData,
    });
    console.log('transactions: ', userOpsBatch);

    // sign transactions added to the batch
    const op = await primeSdk.sign();
    console.log(`Signed UserOp: ${await printOp(op)}`);

    // sending to the bundler...
    const uoHash = await primeSdk.send(op);
    console.log(`UserOpHash: ${uoHash}`);

    // get transaction hash...
    console.log('Waiting for transaction...');
    const txHash = await primeSdk.getUserOpReceipt(uoHash);
    console.log(`Transaction hash: ${txHash}`);

    return txHash;
};

const toJSON = async (op: any): Promise<any> =>
    ethers.utils.resolveProperties(op).then((userOp: any) =>
        Object.keys(userOp)
            .map((key) => {
                let val = (userOp as any)[key];
                if (typeof val !== 'string' || !val.startsWith('0x')) {
                    val = ethers.utils.hexValue(val);
                }
                return [key, val];
            })
            .reduce(
                (set, [k, v]) => ({
                    ...set,
                    [k]: v,
                }),
                {}
            )
    );

const printOp = async (op: any): Promise<string> => toJSON(op).then((userOp) => JSON.stringify(userOp, null, 2));
