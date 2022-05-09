import { getContractFactory, predeploys } from '@eth-optimism/contracts';
import detectEthereumProvider from '@metamask/detect-provider';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { GWEI_UNIT } from 'constants/network';
import { BigNumber } from 'ethers';
import { serializeTransaction, UnsignedTransaction } from 'ethers/lib/utils';
import { EthereumProvider, NetworkId } from 'types/network';
import networkConnector from 'utils/networkConnector';

export const NetworkIdByName: Record<string, NetworkId> = {
    OptimsimMainnet: 10,
    OptimsimKovan: 69,
};

export const NetworkNameById: Record<NetworkId, string> = {
    10: 'optimism mainnet',
    69: 'optimism kovan',
};

export const InfuraNetworkNameById: Record<NetworkId, string> = {
    10: 'optimism-mainnet',
    69: 'optimism-kovan',
};

export const hasEthereumInjected = () => !!window.ethereum;

export async function getDefaultNetworkId(): Promise<NetworkId> {
    try {
        if (hasEthereumInjected()) {
            const provider = (await detectEthereumProvider()) as EthereumProvider;
            if (provider && provider.chainId) {
                return Number(provider.chainId) as NetworkId;
            }
        }
        return DEFAULT_NETWORK_ID;
    } catch (e) {
        console.log(e);
        return DEFAULT_NETWORK_ID;
    }
}

export const getTransactionPrice = (
    gasPrice: number | null,
    gasLimit: number | null,
    ethPrice: number | null,
    l1Fee?: number | null
) => {
    if (!gasPrice || !gasLimit || !ethPrice) return 0;
    const transsactionPrice = (gasPrice * ethPrice * gasLimit) / GWEI_UNIT;
    const l1TranactionPrice = l1Fee && l1Fee !== null ? (l1Fee * ethPrice) / GWEI_UNIT / GWEI_UNIT : 0;
    return transsactionPrice + l1TranactionPrice;
};

export const gasPriceInWei = (gasPrice: number) => gasPrice * GWEI_UNIT;

export const getInfuraRpcURL = (networkId: NetworkId) => {
    const network = InfuraNetworkNameById[networkId];
    return `https://${network?.toLowerCase()}.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`;
};

export const isNetworkSupported = (networkId: number | string): networkId is NetworkId => {
    return networkId in NetworkNameById;
};

export const formatGwei = (wei: number) => wei / GWEI_UNIT;

export const getL1FeeInWei = async (txRequest: any) => {
    const OVM_GasPriceOracle = getContractFactory('OVM_GasPriceOracle', networkConnector.signer).attach(
        predeploys.OVM_GasPriceOracle
    );
    const unsignedTx = (await networkConnector.signer?.populateTransaction(txRequest)) as UnsignedTransaction;
    if (unsignedTx) {
        const serializedTx = serializeTransaction({
            nonce: unsignedTx.nonce ? parseInt(unsignedTx.nonce.toString(10), 10) : 0,
            value: unsignedTx.value,
            gasPrice: unsignedTx.gasPrice,
            gasLimit: unsignedTx.gasLimit,
            to: unsignedTx.to,
            data: unsignedTx.data,
        });
        const l1FeeInWei = await OVM_GasPriceOracle.getL1Fee(serializedTx);
        return l1FeeInWei.toNumber();
    }
    return null;
};

export const checkAllowance = async (amount: BigNumber, token: any, walletAddress: string, spender: string) => {
    try {
        const approved = await token.allowance(walletAddress, spender);
        return approved.gte(amount);
    } catch (err: any) {
        console.log(err);
        return false;
    }
};
