import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { AccountPosition, AccountPositionsMap, PositionBalance } from 'types/markets';
import thalesData from 'thales-data';
import { NetworkId } from 'types/network';
import { bigNumberFormatter } from 'utils/formatters/ethers';

const useAccountPositionsQuery = (
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<AccountPositionsMap | undefined>
) => {
    return useQuery<AccountPositionsMap | undefined>(
        QUERY_KEYS.AccountPositions(walletAddress, networkId),
        async () => {
            try {
                const positionBalances: PositionBalance[] = await thalesData.sportMarkets.positionBalances({
                    account: walletAddress,
                    network: networkId,
                });

                const accountPositionsMap: AccountPositionsMap = {};

                positionBalances.forEach((positionBalance) => {
                    const marketAddress = positionBalance.position.market.address;
                    if (accountPositionsMap[marketAddress]) {
                        const existingPositions = accountPositionsMap[marketAddress];
                        console.log(positionBalance.amount);
                        const position: AccountPosition = {
                            ...positionBalance.position,
                            amount: bigNumberFormatter(positionBalance.amount),
                        };
                        existingPositions.push(position);
                        accountPositionsMap[marketAddress] = existingPositions;
                    } else {
                        console.log(positionBalance.amount);
                        accountPositionsMap[marketAddress] = [
                            {
                                ...positionBalance.position,
                                amount: bigNumberFormatter(positionBalance.amount),
                            },
                        ];
                    }
                });

                return accountPositionsMap;
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

export default useAccountPositionsQuery;
