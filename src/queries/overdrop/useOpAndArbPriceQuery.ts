import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';

// IDs can be found here: https://pyth.network/developers/price-feed-ids#pyth-evm-stable
const OP_PRICE_FEED_ID = '385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf';
const ARB_PRICE_FEED_ID = '3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5';

const useOpAndArbPriceQuery = (options?: UseQueryOptions<{ op: number; arb: number }>) => {
    return useQuery<{ op: number; arb: number }>(
        QUERY_KEYS.Overdrop.Price(),
        async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.PYTH_API_URL}?ids%5B%5D=${OP_PRICE_FEED_ID}&ids%5B%5D=${ARB_PRICE_FEED_ID}`
                );

                if (response?.data)
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
        {
            ...options,
        }
    );
};

export default useOpAndArbPriceQuery;
