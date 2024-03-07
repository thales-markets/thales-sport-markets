import { NUMBER_OF_MATCHES, NUMBER_OF_ROUNDS } from 'constants/marchMadness';
import QUERY_KEYS from 'constants/queryKeys';
import { millisecondsToHours, secondsToMilliseconds } from 'date-fns';
import { UseQueryOptions, useQuery } from 'react-query';
import { NetworkId } from 'thales-utils';
import networkConnector from 'utils/networkConnector';

type MarchMadnessData = {
    isAddressAlreadyMinted: boolean;
    isMintAvailable: boolean;
    hoursLeftToMint: number;
    brackets: number[];
    tokenId: number;
    winnerTeamIdsPerMatch: number[];
    winningsPerRound: number[];
    bonusesPerRound: number[];
};

const useMarchMadnessDataQuery = (walletAddress: string, networkId: NetworkId, options?: UseQueryOptions<any>) => {
    return useQuery<MarchMadnessData>(
        QUERY_KEYS.MarchMadness(walletAddress, networkId),
        async () => {
            const marchMadnessData: MarchMadnessData = {
                isAddressAlreadyMinted: false,
                isMintAvailable: false,
                hoursLeftToMint: 0,
                brackets: [],
                tokenId: 0,
                winnerTeamIdsPerMatch: Array<number>(NUMBER_OF_MATCHES).fill(0),
                winningsPerRound: Array<number>(NUMBER_OF_ROUNDS).fill(0),
                bonusesPerRound: Array<number>(NUMBER_OF_ROUNDS).fill(0),
            };

            try {
                const { marchMadnessContract } = networkConnector;

                if (marchMadnessContract && walletAddress !== '') {
                    const tokenId = await marchMadnessContract.addressToTokenId(walletAddress);

                    const [
                        addressAlreadyMinted,
                        canNotMintOrUpdateAfter,
                        bracketsByMinter,
                        results,
                        correctPositionsByRound,
                        pointsPerRound,
                    ] = await Promise.all([
                        await marchMadnessContract.addressAlreadyMinted(walletAddress),
                        await marchMadnessContract.canNotMintOrUpdateAfter(), // timestamp in seconds
                        await marchMadnessContract.getBracketsByMinter(walletAddress),
                        await marchMadnessContract.getResults(),
                        await marchMadnessContract.getCorrectPositionsByRound(walletAddress),
                        await marchMadnessContract.getPointsPerRound(walletAddress),
                    ]);

                    const brackets = bracketsByMinter.map((value: any) => Number(value));
                    const winnerTeamIdsPerMatch = results.map((value: any) => Number(value));
                    const winningsPerRound = correctPositionsByRound.map((value: any) => Number(value));
                    const bonusesPerRound = pointsPerRound.map((value: any) => Number(value));

                    marchMadnessData.isAddressAlreadyMinted = addressAlreadyMinted;
                    const now = Date.now();
                    marchMadnessData.isMintAvailable = now < secondsToMilliseconds(Number(canNotMintOrUpdateAfter));
                    marchMadnessData.hoursLeftToMint = Math.floor(
                        millisecondsToHours(secondsToMilliseconds(Number(canNotMintOrUpdateAfter)) - now)
                    );
                    marchMadnessData.brackets = brackets;
                    marchMadnessData.tokenId = tokenId;
                    marchMadnessData.winnerTeamIdsPerMatch = winnerTeamIdsPerMatch;
                    marchMadnessData.winningsPerRound = winningsPerRound;
                    marchMadnessData.bonusesPerRound = bonusesPerRound;
                }

                return marchMadnessData;
            } catch (e) {
                console.log(e);
                return marchMadnessData;
            }
        },
        options
    );
};

export default useMarchMadnessDataQuery;
