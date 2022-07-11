import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { APPROVE_SPENDER_SUFFIX, ONE_INCH_EXCHANGE_URL } from 'constants/tokens';
import { NetworkId } from 'types/network';

const useSwapApproveSpender = (networkId: NetworkId, options?: UseQueryOptions<string>) => {
    return useQuery<string>(
        QUERY_KEYS.Wallet.SwapApproveSpender(networkId),
        async () => {
            const url = `${ONE_INCH_EXCHANGE_URL}${networkId}${APPROVE_SPENDER_SUFFIX}`;
            const response = await fetch(url);
            const result = JSON.parse(await response.text());
            return result.address;
        },
        options
    );
};
export default useSwapApproveSpender;
