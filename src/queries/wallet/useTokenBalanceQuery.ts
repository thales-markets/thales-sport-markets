import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import { BALANCE_THRESHOLD } from 'constants/wallet';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { Token } from 'types/tokens';
import { ethers } from 'ethers';
import tokenContract from 'utils/contracts/paymentTokenContract';

const useTokenBalanceQuery = (
    token: Token,
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<number | undefined>
) => {
    return useQuery<number | undefined>(
        QUERY_KEYS.Wallet.TokenBalance(token.symbol, walletAddress, networkId),
        async () => {
            try {
                const { signer } = networkConnector;
                if (signer) {
                    let balance = 0;
                    if (token.symbol === 'ETH') {
                        balance = bigNumberFormatter(await signer.getBalance());
                    } else {
                        const contract = new ethers.Contract(token.address, tokenContract?.abi, signer);
                        balance = Number(
                            ethers.utils.formatUnits(await contract.balanceOf(walletAddress), token.decimals)
                        );
                    }
                    return balance < BALANCE_THRESHOLD ? 0 : balance;
                }
                return 0;
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useTokenBalanceQuery;
