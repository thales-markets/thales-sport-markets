import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { NetworkId } from 'types/network';
import networkConnector from 'utils/networkConnector';

type MarchMadnessData = {
    isAddressAlreadyMinted: boolean;
    isMintAvailable: boolean;
    daysLeftToMint: number;
    brackets: number[];
    tokenId: number;
    winnerTeamIdsPerMatch: number[];
};

const useMarchMadnessDataQuery = (walletAddress: string, networkId: NetworkId, options?: UseQueryOptions<any>) => {
    return useQuery<MarchMadnessData>(
        QUERY_KEYS.MarchMadness(walletAddress, networkId),
        async () => {
            const marchMadnessData: MarchMadnessData = {
                isAddressAlreadyMinted: false,
                isMintAvailable: false,
                daysLeftToMint: 0,
                brackets: [],
                tokenId: 0,
                winnerTeamIdsPerMatch: Array<number>(63).fill(0),
            };

            const marchMadnessContract = networkConnector.marchMadnessContract;

            if (marchMadnessContract && walletAddress !== '') {
                const tokenId = await marchMadnessContract.addressToTokenId(walletAddress);

                const [addressAlreadyMinted, canNotMintOrUpdateAfter, bracketsByMinter, results] = await Promise.all([
                    await marchMadnessContract.addressAlreadyMinted(walletAddress),
                    await marchMadnessContract.canNotMintOrUpdateAfter(), // timestamp in milis
                    await marchMadnessContract.getBracketsByMinter(walletAddress),
                    await marchMadnessContract.getResults(),
                ]);

                const brackets = bracketsByMinter.map((value: any) => Number(value));
                const winnerTeamIdsPerMatch = results.map((value: any) => Number(value));

                marchMadnessData.isAddressAlreadyMinted = addressAlreadyMinted;
                marchMadnessData.isMintAvailable = Date.now() < Number(canNotMintOrUpdateAfter) * 1000;
                marchMadnessData.daysLeftToMint = Math.floor(
                    (Number(canNotMintOrUpdateAfter) * 1000 - Date.now()) / 1000 / 60 / 60 / 24
                );
                marchMadnessData.brackets = brackets;
                marchMadnessData.tokenId = tokenId;
                marchMadnessData.winnerTeamIdsPerMatch = winnerTeamIdsPerMatch;
            }

            return marchMadnessData;
        },
        options
    );
};

export default useMarchMadnessDataQuery;
