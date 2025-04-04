import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import {
    FINAL_MATCH_ID,
    initialBracketsData,
    NUMBER_OF_TEAMS,
    START_MINTING_DATE,
    teamsData,
    WILD_CARD,
} from 'constants/marchMadness';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { formatCurrencyWithKey, formatCurrencyWithSign, NetworkId } from 'thales-utils';
import { MarchMadTeam } from 'types/marchMadness';

export const getLocalStorageKey = (bracketId: number, networkId: NetworkId, walletAddress: string) =>
    `${LOCAL_STORAGE_KEYS.BRACKETS}id=${bracketId}network=${networkId}wallet=${walletAddress}`;

export const isMatchInRegion = (matchId: number, region: string) => {
    return initialBracketsData.find((match) => match.id === matchId && match.region.includes(region)) !== undefined;
};

// rounds index starts from 0
export const getNumberOfMatchesPerRound = (round: number) => {
    return NUMBER_OF_TEAMS / Math.pow(2, round + 1);
};

export const getFirstMatchIndexInRound = (round: number) => {
    return NUMBER_OF_TEAMS - NUMBER_OF_TEAMS / Math.pow(2, round);
};

export const isWildCardTeamWinner = (wildCardTeam: MarchMadTeam) => {
    const isWildCardTeamResolved =
        teamsData.find(
            (team) =>
                team.region === wildCardTeam.region &&
                team.position === wildCardTeam.position &&
                team.name === WILD_CARD
        ) === undefined;
    const isWildCardTeamWinner = !!teamsData.find(
        (team) =>
            team.region === wildCardTeam.region &&
            team.position === wildCardTeam.position &&
            team.name === wildCardTeam.name
    );
    return isWildCardTeamResolved ? isWildCardTeamWinner : undefined;
};

export const isMarchMadnessAvailableForNetworkId = (networkId: NetworkId) => {
    return [NetworkId.OptimismMainnet, NetworkId.Arbitrum, NetworkId.Base, NetworkId.OptimismSepolia].includes(
        networkId
    );
};

export const getTeamNameById = (id: number) => teamsData.find((team) => team.id === id)?.displayName || '';

const getRoundNameById = (roundId: number) => {
    let round = '';
    switch (roundId) {
        case 0:
            round = 'First';
            break;
        case 1:
            round = 'Second';
            break;
        case 2:
            round = 'Sweet16';
            break;
        case 3:
            round = 'Elite8';
            break;
        case 4:
            round = 'SemiFinal';
            break;
        case 5:
            round = 'Final';
            break;
    }
    return round;
};

export const getMatchIdByRoundAndTeamIds = (roundId: number, team1Id: number, team2Id: number) => {
    const round = getRoundNameById(roundId);
    if (round) {
        const allMatchesByRound = initialBracketsData.filter((match) => match.round === round);
        if (allMatchesByRound.length === 1) {
            return FINAL_MATCH_ID;
        }
        if (roundId === 0) {
            return initialBracketsData.find(
                (match) =>
                    (match.homeTeamId === team1Id && match.awayTeamId === team2Id) ||
                    (match.homeTeamId === team2Id && match.awayTeamId === team1Id)
            )?.id;
        }

        const initialMappedMatchesPerRound = initialBracketsData
            .filter((match) => match.round === getRoundNameById(0))
            .map((match) => {
                const teams = [match.homeTeamId, match.awayTeamId];
                return { matchId: match.id, teams };
            });
        let childrenWithParentTeams: any = [...initialMappedMatchesPerRound];
        for (let i = 0; i < roundId; i++) {
            const populatedTeamsInNextRound = initialBracketsData
                .filter((match) => match.round === getRoundNameById(i + 1))
                .map((match) => {
                    const mappedHomeMatch = childrenWithParentTeams.find(
                        (el: any) => el.matchId === match.homeTeamParentMatchId
                    );
                    const mappedAwayMatch = childrenWithParentTeams.find(
                        (el: any) => el.matchId === match.awayTeamParentMatchId
                    );
                    return { matchId: match.id, teams: [...mappedHomeMatch?.teams, ...mappedAwayMatch?.teams] };
                });

            childrenWithParentTeams = childrenWithParentTeams.concat(populatedTeamsInNextRound);
        }

        const resultMatch = childrenWithParentTeams.find(
            (match: any) => match.teams.includes(team1Id) && match.teams.includes(team2Id)
        );

        return resultMatch?.matchId || -1;
    }
    return -1;
};

export const getIsMintingStarted = () => Date.now() > START_MINTING_DATE;

export const getFormattedRewardsAmount = (stableAmount: number, tokenAmount: number) => {
    if (!tokenAmount && !stableAmount) return 'N/A';
    return `${formatCurrencyWithSign(USD_SIGN, stableAmount ? stableAmount : 0)} + ${formatCurrencyWithKey(
        CRYPTO_CURRENCY_MAP.OVER,
        tokenAmount ? tokenAmount : 0,
        0,
        true
    )}`;
};
