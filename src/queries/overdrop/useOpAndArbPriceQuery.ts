import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';

// IDs can be found here: https://pyth.network/developers/price-feed-ids#pyth-evm-stable
const OP_PRICE_FEED_ID = '385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf';
const ARB_PRICE_FEED_ID = '3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5';

const useOpAndArbPriceQuery = (options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
    return useQuery<{ op: number; arb: number }>({
        queryKey: QUERY_KEYS.Overdrop.Price(),
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.PYTH_API_URL}?ids%5B%5D=${OP_PRICE_FEED_ID}&ids%5B%5D=${ARB_PRICE_FEED_ID}`
                );

                if (response?.status === 200 && response?.data)
                    return {
                        op: Number(response.data.parsed[0].price.price) * 10 ** response.data.parsed[0].price.expo,
                        arb: Number(response.data.parsed[1].price.price) * 10 ** response.data.parsed[1].price.expo,
                    };
                return { op: 0, arb: 0 };
            } catch (e) {
                console.error(e);
                return { op: 0, arb: 0 };
            }
        },
        ...options,
    });
};

export default useOpAndArbPriceQuery;
