import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { generalConfig } from 'config/general';
import { NetworkId } from 'types/network';

type DiscountMap = Map<string, { longPriceImpact: number; shortPriceImpact: number }> | null;

// TODO: discuss with team to change logic and store and update markets in redux to avoid this
export let discountOrdersMap: DiscountMap = null;

const useDiscountMarkets = (network: NetworkId, options?: UseQueryOptions<DiscountMap>) => {
    return useQuery<DiscountMap>(
        QUERY_KEYS.DiscountMarkets(network),
        async () => {
            const baseUrl = `${generalConfig.API_URL}/overtimeDiscounts/${network}`;
            const response = await fetch(baseUrl);
            const json = await response.json();
            const discountMap = new Map(json) as DiscountMap;

            discountOrdersMap = discountMap;
            return discountMap;
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useDiscountMarkets;
