import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { AccountMarketOpenBidData } from 'types/markets';
import { BigNumberish, ethers } from 'ethers';
import marketContract from 'utils/contracts/exoticPositionalTicketMarketContract';
import networkConnector from 'utils/networkConnector';
import { bigNumberFormatter } from 'utils/formatters/ethers';

const useAccountMarketOpenBidDataQuery = (
    marketAddress: string,
    walletAddress: string,
    options?: UseQueryOptions<AccountMarketOpenBidData | undefined>
) => {
    return useQuery<AccountMarketOpenBidData | undefined>(
        QUERY_KEYS.AccountMarketOpenBidData(marketAddress, walletAddress),
        async () => {
            try {
                const marketData: AccountMarketOpenBidData = {
                    userPositions: [],
                    claimAmount: 0,
                    canClaim: false,
                    winningAmount: 0,
                    canWithdraw: false,
                    userAlreadyClaimedAmount: 0,
                };

                const { signer } = networkConnector;
                if (signer && walletAddress !== '') {
                    const contractWithSigner = new ethers.Contract(marketAddress, marketContract.abi, signer);
                    const [
                        userPositions,
                        claimAmount,
                        canClaim,
                        winningAmount,
                        canWithdraw,
                        userAlreadyClaimedAmount,
                    ] = await Promise.all([
                        contractWithSigner.getAllUserPositions(walletAddress),
                        contractWithSigner.getUserClaimableAmount(walletAddress),
                        contractWithSigner.canUserClaim(walletAddress),
                        contractWithSigner.getUserPotentialWinningAmount(walletAddress),
                        contractWithSigner.canUserWithdraw(walletAddress),
                        contractWithSigner.userAlreadyClaimed(walletAddress),
                    ]);
                    marketData.userPositions = userPositions.map((userPosition: BigNumberish) => Number(userPosition));
                    marketData.claimAmount = bigNumberFormatter(claimAmount);
                    marketData.canClaim = canClaim;
                    marketData.winningAmount = bigNumberFormatter(winningAmount);
                    marketData.canWithdraw = canWithdraw;
                    marketData.userAlreadyClaimedAmount = bigNumberFormatter(userAlreadyClaimedAmount);
                }

                return marketData;
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

export default useAccountMarketOpenBidDataQuery;
