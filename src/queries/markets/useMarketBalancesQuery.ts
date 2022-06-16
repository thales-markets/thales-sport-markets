import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { ethers } from 'ethers';
import marketContract from '../../utils/contracts/sportsMarketContract';
import erc20Contract from '../../utils/contracts/erc20Contract';
import networkConnector from '../../utils/networkConnector';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { Balances } from '../../types/markets';

const useMarketBalancesQuery = (marketAddress: string, walletAddress: string, options?: UseQueryOptions<Balances>) => {
    return useQuery<Balances>(
        QUERY_KEYS.MarketBalances(marketAddress, walletAddress),
        async () => {
            const balances = {
                home: 0,
                away: 0,
                draw: 0,
            };
            const contract = new ethers.Contract(marketAddress, marketContract.abi, networkConnector.provider);
            const [optionsAddresses] = await Promise.all([contract?.options()]);

            const homeContract = new ethers.Contract(
                optionsAddresses.home,
                erc20Contract.abi,
                networkConnector.provider
            );
            const awayContract = new ethers.Contract(
                optionsAddresses.away,
                erc20Contract.abi,
                networkConnector.provider
            );

            const [homeBalance, awayBalance] = await Promise.all([
                homeContract?.balanceOf(walletAddress),
                awayContract?.balanceOf(walletAddress),
            ]);

            balances.home = bigNumberFormatter(homeBalance);
            balances.away = bigNumberFormatter(awayBalance);

            if (optionsAddresses.draw !== '0x0000000000000000000000000000000000000000') {
                const drawContract = new ethers.Contract(
                    optionsAddresses.draw,
                    erc20Contract.abi,
                    networkConnector.provider
                );
                const drawBalance = await drawContract?.balanceOf(walletAddress);
                balances.draw = bigNumberFormatter(drawBalance);
            }
            return balances;
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useMarketBalancesQuery;
