import { NUMBER_OF_MATCHES, NUMBER_OF_ROUNDS } from 'constants/marchMadness';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { NetworkId } from 'types/network';
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

            const marchMadnessContract = networkConnector.marchMadnessContract;

            if (marchMadnessContract && walletAddress !== '') {
                const tokenId = await marchMadnessContract.addressToTokenId(walletAddress);

                const [
                    addressAlreadyMinted,
                    canNotMintOrUpdateAfter,
                    bracketsByMinter,
                    results,
                    winningsInRound0,
                    winningsInRound1,
                    winningsInRound2,
                    winningsInRound3,
                    winningsInRound4,
                    winningsInRound5,
                    bonusInRound0,
                    bonusInRound1,
                    bonusInRound2,
                    bonusInRound3,
                    bonusInRound4,
                    bonusInRound5,
                ] = await Promise.all([
                    await marchMadnessContract.addressAlreadyMinted(walletAddress),
                    await marchMadnessContract.canNotMintOrUpdateAfter(), // timestamp in milis
                    await marchMadnessContract.getBracketsByMinter(walletAddress),
                    await marchMadnessContract.getResults(),
                    await marchMadnessContract.getCorrectPositionsPerRoundByMinterAddress(0, walletAddress),
                    await marchMadnessContract.getCorrectPositionsPerRoundByMinterAddress(1, walletAddress),
                    await marchMadnessContract.getCorrectPositionsPerRoundByMinterAddress(2, walletAddress),
                    await marchMadnessContract.getCorrectPositionsPerRoundByMinterAddress(3, walletAddress),
                    await marchMadnessContract.getCorrectPositionsPerRoundByMinterAddress(4, walletAddress),
                    await marchMadnessContract.getCorrectPositionsPerRoundByMinterAddress(5, walletAddress),
                    await marchMadnessContract.roundToPoints(0),
                    await marchMadnessContract.roundToPoints(1),
                    await marchMadnessContract.roundToPoints(2),
                    await marchMadnessContract.roundToPoints(3),
                    await marchMadnessContract.roundToPoints(4),
                    await marchMadnessContract.roundToPoints(5),
                ]);

                const brackets = bracketsByMinter.map((value: any) => Number(value));
                const winnerTeamIdsPerMatch = results.map((value: any) => Number(value));
                const winningsPerRound = [
                    Number(winningsInRound0),
                    Number(winningsInRound1),
                    Number(winningsInRound2),
                    Number(winningsInRound3),
                    Number(winningsInRound4),
                    Number(winningsInRound5),
                ];
                const bonuses = [
                    Number(bonusInRound0),
                    Number(bonusInRound1),
                    Number(bonusInRound2),
                    Number(bonusInRound3),
                    Number(bonusInRound4),
                    Number(bonusInRound5),
                ];
                const bonusesPerRound = winningsPerRound.map((winCount: number, index) => winCount * bonuses[index]);

                marchMadnessData.isAddressAlreadyMinted = addressAlreadyMinted;
                marchMadnessData.isMintAvailable = Date.now() < Number(canNotMintOrUpdateAfter) * 1000;
                marchMadnessData.hoursLeftToMint = Math.floor(
                    (Number(canNotMintOrUpdateAfter) * 1000 - Date.now()) / 1000 / 60 / 60
                );
                marchMadnessData.brackets = brackets;
                marchMadnessData.tokenId = tokenId;
                marchMadnessData.winnerTeamIdsPerMatch = winnerTeamIdsPerMatch;
                marchMadnessData.winningsPerRound = winningsPerRound;
                marchMadnessData.bonusesPerRound = bonusesPerRound;
            }

            return marchMadnessData;
        },
        options
    );
};

export default useMarchMadnessDataQuery;
