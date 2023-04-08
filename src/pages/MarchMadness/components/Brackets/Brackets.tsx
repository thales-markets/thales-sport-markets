import background from 'assets/images/march-madness/background-marchmadness.svg';
import backgrounBall from 'assets/images/march-madness/background-marchmadness-ball.png';
import {
    wildCardTeams,
    initialBracketsData,
    NUMBER_OF_ROUNDS,
    FINAL_MATCH_ID,
    FIRST_ROUND_MATCH_IDS,
    SECOND_ROUND_MATCH_IDS,
    SWEET16_ROUND_MATCH_IDS,
    SEMI_FINAL_SOUTH_EAST_MATCH_ID,
    SEMI_FINAL_MIDWEST_WEST_MATCH_ID,
    FIRST_ROUND_EAST_MATCH_IDS,
    SECOND_ROUND_EAST_MATCH_IDS,
    SWEET16_ROUND_EAST_MATCH_IDS,
    ELITE8_ROUND_EAST_MATCH_ID,
    ELITE8_ROUND_SOUTH_MATCH_ID,
    SWEET16_ROUND_SOUTH_MATCH_IDS,
    SECOND_ROUND_SOUTH_MATCH_IDS,
    FIRST_ROUND_SOUTH_MATCH_IDS,
    FIRST_ROUND_WEST_MATCH_IDS,
    SECOND_ROUND_WEST_MATCH_IDS,
    SWEET16_ROUND_WEST_MATCH_IDS,
    ELITE8_ROUND_WEST_MATCH_ID,
    ELITE8_ROUND_MIDWEST_MATCH_ID,
    SWEET16_ROUND_MIDWEST_MATCH_IDS,
    SECOND_ROUND_MIDWEST_MATCH_IDS,
    FIRST_ROUND_MIDWEST_MATCH_IDS,
} from 'constants/marchMadness';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Match from '../Match';
import { BracketMatch } from 'types/marchMadness';
import { useTranslation } from 'react-i18next';
import WildCardMatch from '../WildCardMatch';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { useSelector } from 'react-redux';
import localStore from 'utils/localStore';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import Button from 'components/Button';
import useMarchMadnessDataQuery from 'queries/marchMadness/useMarchMadnessDataQuery';
import { getIsAppReady } from 'redux/modules/app';
import networkConnector from 'utils/networkConnector';
import Loader from 'components/Loader';
import MintNFTModal from '../MintNFTModal';
import { getFirstMatchIndexInRound, getNumberOfMatchesPerRound } from 'utils/marchMadness';
import { TwitterIcon } from 'pages/Markets/Home/Parlay/components/styled-components';
import ShareModal from '../ShareModal';
import { MatchProps } from '../Match/Match';
import { refetchAfterMarchMadnessMint } from 'utils/queryConnector';
import useLeaderboardByVolumeQuery from 'queries/marchMadness/useLeaderboardByVolumeQuery';
import useLoeaderboardByGuessedCorrectlyQuery from 'queries/marchMadness/useLoeaderboardByGuessedCorrectlyQuery';

const Brackets: React.FC = () => {
    const { t } = useTranslation();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const [isBracketMinted, setIsBracketMinted] = useState(false);
    const [bracketsData, setBracketsData] = useState(initialBracketsData);
    const [winnerTeamIds, setWinnerTeamIds] = useState(Array<number>(63).fill(0));
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [showMintNFTModal, setShowMintNFTModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);
    const [isMintError, setIsMintError] = useState(false);

    const marchMadnessDataQuery = useMarchMadnessDataQuery(walletAddress, networkId, {
        enabled: isAppReady,
    });
    const marchMadnessData =
        marchMadnessDataQuery.isSuccess && marchMadnessDataQuery.data ? marchMadnessDataQuery.data : null;

    const isBracketsLocked = useMemo(() => !marchMadnessData?.isMintAvailable, [marchMadnessData?.isMintAvailable]);

    useEffect(() => {
        if (!isBracketsLocked && !isBracketMinted) {
            const lsBrackets = localStore.get(LOCAL_STORAGE_KEYS.BRACKETS + networkId + walletAddress);
            setBracketsData(
                lsBrackets !== undefined && (lsBrackets as BracketMatch[]).length
                    ? (lsBrackets as BracketMatch[])
                    : initialBracketsData
            );
        } else if (marchMadnessData?.isAddressAlreadyMinted && marchMadnessData.brackets.length) {
            let bracketsMapped: BracketMatch[] = [];
            for (let i = 0; i < NUMBER_OF_ROUNDS; i++) {
                const currentRound: BracketMatch[] = [...initialBracketsData]
                    .filter(
                        // filter matches by round
                        (match) => {
                            const startId = getFirstMatchIndexInRound(i);
                            const endId = startId + getNumberOfMatchesPerRound(i) - 1;
                            return match.id >= startId && match.id <= endId;
                        }
                    )
                    .map((match) => {
                        // populate brackets data based on minted teams
                        const homeTeamParentMatch = bracketsMapped.find(
                            (mappedMatch) => mappedMatch.id === match.homeTeamParentMatchId
                        );
                        const selectedTeamFromParentHome = homeTeamParentMatch?.isHomeTeamSelected
                            ? homeTeamParentMatch.homeTeamId
                            : homeTeamParentMatch?.awayTeamId;

                        const homeTeamId =
                            homeTeamParentMatch !== undefined ? selectedTeamFromParentHome : match.homeTeamId;

                        const awayTeamParentMatch = bracketsMapped.find(
                            (mappedMatch) => mappedMatch.id === match.awayTeamParentMatchId
                        );
                        const selectedTeamFromParentAway = awayTeamParentMatch?.isHomeTeamSelected
                            ? awayTeamParentMatch.homeTeamId
                            : awayTeamParentMatch?.awayTeamId;

                        const awayTeamId =
                            awayTeamParentMatch !== undefined ? selectedTeamFromParentAway : match.awayTeamId;

                        const isHomeTeamSelected = homeTeamId === marchMadnessData.brackets[match.id];
                        return {
                            ...match,
                            homeTeamId,
                            awayTeamId,
                            isHomeTeamSelected,
                        };
                    });
                bracketsMapped = bracketsMapped.concat(currentRound);
            }

            localStore.set(LOCAL_STORAGE_KEYS.BRACKETS + networkId + walletAddress, bracketsMapped);
            setBracketsData(bracketsMapped);
        }
    }, [
        networkId,
        walletAddress,
        marchMadnessData?.isAddressAlreadyMinted,
        marchMadnessData?.brackets,
        isBracketMinted,
        isBracketsLocked,
    ]);

    useEffect(() => {
        if (marchMadnessData) {
            setIsBracketMinted(marchMadnessData.isAddressAlreadyMinted);

            const shouldUpdate =
                winnerTeamIds.findIndex((teamId, index) => teamId !== marchMadnessData.winnerTeamIdsPerMatch[index]) !==
                -1;
            if (shouldUpdate) {
                setWinnerTeamIds(marchMadnessData.winnerTeamIdsPerMatch);
            }
        }
    }, [networkId, marchMadnessData, winnerTeamIds]);

    const isTeamLostInPreviousRounds = (teamId: number | undefined) => {
        if (teamId === undefined) {
            return false;
        }
        const teamLost = bracketsData.find(
            (match) =>
                (match.homeTeamId === teamId || match.awayTeamId === teamId) &&
                winnerTeamIds[match.id] !== 0 &&
                winnerTeamIds[match.id] !== teamId
        );

        return !!teamLost;
    };

    const updateBracketsByMatch = (id: number, isHomeTeamSelected: boolean) => {
        // update current match - only one
        let updatedMatch: BracketMatch | undefined = undefined;
        const updatedMatches = bracketsData.map((match) => {
            if (match.id === id) {
                updatedMatch = { ...match, isHomeTeamSelected };
                return updatedMatch;
            }
            return match;
        });

        // populate first child match always - only one child
        let firstChildMatchId: number | undefined = undefined;
        let previousTeamId: number | undefined = undefined;
        let newTeamId: number | undefined = undefined;
        const updatedChildMatches = updatedMatches.map((match) => {
            if (match.homeTeamParentMatchId === updatedMatch?.id) {
                // home team in child match
                firstChildMatchId = match.id;
                previousTeamId = match.homeTeamId;
                newTeamId = updatedMatch?.isHomeTeamSelected ? updatedMatch.homeTeamId : updatedMatch?.awayTeamId;
                return {
                    ...match,
                    homeTeamId: newTeamId,
                };
            }
            if (match.awayTeamParentMatchId === updatedMatch?.id) {
                // away team in child match
                firstChildMatchId = match.id;
                previousTeamId = match.awayTeamId;
                newTeamId = updatedMatch?.isHomeTeamSelected ? updatedMatch.homeTeamId : updatedMatch?.awayTeamId;
                return {
                    ...match,
                    awayTeamId: newTeamId,
                };
            }
            return match;
        });

        // update all children of first child which have previous team
        const childrenMatchesIds: number[] = [];
        let currentChildMatch = updatedChildMatches.find(
            (match) =>
                match.homeTeamParentMatchId === firstChildMatchId || match.awayTeamParentMatchId === firstChildMatchId
        );
        while (currentChildMatch) {
            childrenMatchesIds.push(currentChildMatch.id);
            const newParentMatchId = currentChildMatch.id;
            currentChildMatch = updatedChildMatches.find(
                (match) =>
                    match.homeTeamParentMatchId === newParentMatchId || match.awayTeamParentMatchId === newParentMatchId
            );
        }
        const updatedChildrenMatches = updatedChildMatches.map((match) => {
            if (childrenMatchesIds.includes(match.id)) {
                if (match.homeTeamId !== undefined && match.homeTeamId === previousTeamId) {
                    return {
                        ...match,
                        homeTeamId: newTeamId,
                    };
                } else if (match.awayTeamId !== undefined && match.awayTeamId === previousTeamId) {
                    return {
                        ...match,
                        awayTeamId: newTeamId,
                    };
                }
                return match;
            }
            return match;
        });

        localStore.set(LOCAL_STORAGE_KEYS.BRACKETS + networkId + walletAddress, updatedChildrenMatches);
        setBracketsData(updatedChildrenMatches);
    };

    const getMatchesPerIdRange = (matches: number[]) => {
        const fromId = matches[0];
        return bracketsData.map((match) => {
            if (matches.includes(match.id)) {
                const isFirstRound = FIRST_ROUND_MATCH_IDS.includes(match.id);

                const isSecondRound = SECOND_ROUND_MATCH_IDS.includes(match.id);
                const isSecondRoundLowerHalf = [
                    ...SECOND_ROUND_EAST_MATCH_IDS,
                    ...SECOND_ROUND_WEST_MATCH_IDS,
                ].includes(match.id);

                const isSweet16 = SWEET16_ROUND_MATCH_IDS.includes(match.id);
                const isSweet16LowerHalf = [...SWEET16_ROUND_EAST_MATCH_IDS, ...SWEET16_ROUND_WEST_MATCH_IDS].includes(
                    match.id
                );

                const margin = isFirstRound
                    ? match.id === fromId
                        ? '0'
                        : `${FIRST_ROUND_MATCH_GAP}px 0 0 0`
                    : isSecondRound
                    ? match.id === fromId // first match in round by quarter
                        ? isSecondRoundLowerHalf
                            ? '51px 0 0 0'
                            : `${FIRST_ROUND_MATCH_GAP + 1}px 0 0 0`
                        : `${SECOND_ROUND_MATCH_GAP}px 0 0 0`
                    : isSweet16
                    ? match.id === fromId // first match in round by quarter
                        ? isSweet16LowerHalf
                            ? '111px 0 0 0'
                            : `${SECOND_ROUND_MATCH_GAP + 1}px 0 0 0`
                        : `${SWEET16_ROUND_MATCH_GAP}px 0 0 0`
                    : '';
                return (
                    <Match
                        key={match.id}
                        matchData={match}
                        winnerTeamId={winnerTeamIds[match.id]}
                        isBracketsLocked={isBracketsLocked}
                        isTeamLostInPreviousRounds={isTeamLostInPreviousRounds}
                        updateBrackets={updateBracketsByMatch}
                        height={MATCH_HEIGHT}
                        margin={margin}
                    ></Match>
                );
            }
        });
    };

    const getMatchById = (id: number) => {
        const isElite8UpperHalf = [ELITE8_ROUND_SOUTH_MATCH_ID, ELITE8_ROUND_MIDWEST_MATCH_ID].includes(id);
        const isElite8LowerHalf = [ELITE8_ROUND_EAST_MATCH_ID, ELITE8_ROUND_WEST_MATCH_ID].includes(id);
        const isSemiFinalLeft = id === SEMI_FINAL_SOUTH_EAST_MATCH_ID;
        const isSemiFinalRight = id === SEMI_FINAL_MIDWEST_WEST_MATCH_ID;
        const isFinal = id === FINAL_MATCH_ID;

        const margin = isElite8UpperHalf
            ? `${SWEET16_ROUND_MATCH_GAP + 1}px 0 0 0`
            : isElite8LowerHalf
            ? '231px 0 0 0'
            : isSemiFinalLeft
            ? '-7px 25px 0 0'
            : isSemiFinalRight
            ? '-7px 0 0 25px'
            : isFinal
            ? '24px 0 0 0'
            : '';

        return (
            <Match
                matchData={bracketsData.find((match) => match.id === id) || bracketsData[id]}
                winnerTeamId={winnerTeamIds[id]}
                isBracketsLocked={isBracketsLocked}
                isTeamLostInPreviousRounds={isTeamLostInPreviousRounds}
                updateBrackets={updateBracketsByMatch}
                height={MATCH_HEIGHT}
                margin={margin}
            ></Match>
        );
    };

    useEffect(() => {
        let submitDisabled = false;
        if (isBracketMinted) {
            // if already minted compare selction on contract and on UI
            if (isBracketMinted === marchMadnessData?.isAddressAlreadyMinted) {
                submitDisabled =
                    bracketsData.find(
                        (match) =>
                            (match.isHomeTeamSelected ? match.homeTeamId : match.awayTeamId) !==
                            marchMadnessData?.brackets[match.id]
                    ) === undefined;
                setIsSubmitDisabled(submitDisabled);
            }
        } else {
            submitDisabled = bracketsData.find((match) => match.isHomeTeamSelected === undefined) !== undefined;
            setIsSubmitDisabled(submitDisabled);
        }
    }, [isBracketMinted, bracketsData, marchMadnessData?.brackets, marchMadnessData?.isAddressAlreadyMinted]);

    const handleSubmit = async () => {
        setIsMintError(false);
        const { marchMadnessContract, signer } = networkConnector;
        if (marchMadnessContract && signer) {
            const marchMadnessContractWithSigner = marchMadnessContract.connect(signer);
            const bracketsContractData = bracketsData.map((match) =>
                match.isHomeTeamSelected ? match.homeTeamId : match.awayTeamId
            );

            try {
                let tx;
                if (isBracketMinted) {
                    setIsUpdating(true);
                    tx = await marchMadnessContractWithSigner.updateBracketsForAlreadyMintedItem(
                        marchMadnessData?.tokenId,
                        bracketsContractData
                    );
                } else {
                    setIsMinting(true);
                    tx = await marchMadnessContractWithSigner.mint(bracketsContractData);
                }

                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    refetchAfterMarchMadnessMint(walletAddress, networkId);
                    if (isBracketMinted) {
                        setIsUpdated(true);
                    }
                    setIsBracketMinted(true);
                    setIsSubmitDisabled(true);
                    setIsUpdating(false);
                    setIsMinting(false);
                }
            } catch (e) {
                setIsUpdating(false);
                setIsMinting(false);
                setIsMintError(true);
                console.log('Error ', e);
            }
        }
    };

    const leaderboardByVolumeQuery = useLeaderboardByVolumeQuery(networkId);
    const leaderboardByGuessedGamesQuery = useLoeaderboardByGuessedCorrectlyQuery(networkId);

    const rankByVolume = useMemo(() => {
        if (leaderboardByVolumeQuery.isSuccess && leaderboardByVolumeQuery.data) {
            const leaderboardData = leaderboardByVolumeQuery.data?.leaderboard.find(
                (data) => data.walletAddress.toLowerCase() === walletAddress.toLowerCase()
            );
            return leaderboardData ? leaderboardData.rank : 0;
        }
        return 0;
    }, [leaderboardByVolumeQuery.data, leaderboardByVolumeQuery.isSuccess, walletAddress]);

    const rankByGames = useMemo(() => {
        if (leaderboardByGuessedGamesQuery.isSuccess && leaderboardByGuessedGamesQuery.data) {
            const leaderboardData = leaderboardByGuessedGamesQuery.data.find(
                (data) => data.walletAddress.toLowerCase() === walletAddress.toLowerCase()
            );
            return leaderboardData ? leaderboardData.rank : 0;
        }
        return 0;
    }, [leaderboardByGuessedGamesQuery.data, leaderboardByGuessedGamesQuery.isSuccess, walletAddress]);

    const getMyStats = () => {
        const isFirstMatchFinished = winnerTeamIds.find((id) => id !== 0) !== undefined;

        return (
            <MyStats>
                <StatsColumn width="35%">
                    <StatsText fontWeight={600} margin="0 0 0 21px">
                        {t('march-madness.brackets.stats.my-stats')}
                    </StatsText>
                </StatsColumn>
                <StatsColumn width="65%">
                    <StatsRow margin="0 0 10px 0" justify="normal">
                        <StatsText>{t('march-madness.brackets.stats.rank-volume')}:</StatsText>
                        <StatsText margin="0 15px 0 auto" fontWeight={700}>
                            {isFirstMatchFinished ? (rankByVolume ? rankByVolume : '-') : 'N/A'}
                        </StatsText>
                    </StatsRow>
                    <StatsRow margin="10px 0 0 0" justify="normal">
                        <StatsText>{t('march-madness.brackets.stats.rank-games')}:</StatsText>
                        <StatsText margin="0 15px 0 auto" fontWeight={700}>
                            {isFirstMatchFinished ? (rankByGames ? rankByGames : '-') : 'N/A'}
                        </StatsText>
                    </StatsRow>
                </StatsColumn>
            </MyStats>
        );
    };

    const getScorePerRound = (round: number) => {
        const roundPoints = marchMadnessData?.winningsPerRound[round] || 0;
        const roundBonus = marchMadnessData?.bonusesPerRound[round] || 0;
        const roundNameKey = 'march-madness.brackets.round-' + round;

        return (
            <StatsColumn width="9%" margin="4px 15px 0 15px" justify="initial" key={round}>
                <StatsRow margin="0 0 10px 0" justify="center" hasBorder={true}>
                    <StatsText fontWeight={700} fontSize={14} lineHeight={21} margin="0 0 2px 0">
                        {t(roundNameKey)}
                    </StatsText>
                </StatsRow>
                <StatsRow margin="0 0 5px 0">
                    <StatsText fontSize={14}>{t('march-madness.brackets.stats.points')}</StatsText>
                    <StatsText fontWeight={600} fontSize={14}>
                        {roundPoints + '/' + getNumberOfMatchesPerRound(round)}
                    </StatsText>
                </StatsRow>
                <StatsRow>
                    <StatsText fontSize={14}>{t('march-madness.brackets.stats.bonus')}</StatsText>
                    <StatsText fontWeight={600} fontSize={14}>
                        {roundBonus + '%'}
                    </StatsText>
                </StatsRow>
            </StatsColumn>
        );
    };

    const getMyTotalScore = () => {
        const totalPoints = marchMadnessData?.winningsPerRound.reduce((a, b) => a + b, 0) || 0;
        const totalBonus = marchMadnessData?.bonusesPerRound.reduce((a, b) => a + b, 0) || 0;

        return (
            <MyTotalScore>
                <StatsColumn width="15%">
                    <StatsText fontWeight={700} lineHeight={24} margin="0 0 0 13px">
                        {t('march-madness.brackets.stats.my-total-score')}
                    </StatsText>
                </StatsColumn>
                <StatsColumn width="13%">
                    <StatsRow margin="0 20px 7px 0">
                        <StatsText>{t('march-madness.brackets.stats.points')}</StatsText>
                        <StatsText fontWeight={700}>{totalPoints + ' / 63'}</StatsText>
                    </StatsRow>
                    <StatsRow margin="7px 20px 0 0">
                        <StatsText>{t('march-madness.brackets.stats.bonus')}</StatsText>
                        <StatsText fontWeight={700}>{totalBonus + '%'}</StatsText>
                    </StatsRow>
                </StatsColumn>
                <VerticalLine />
                {Array(NUMBER_OF_ROUNDS)
                    .fill(0)
                    .map((_round, index) => getScorePerRound(index))}
            </MyTotalScore>
        );
    };

    const onTwitterIconClick = () => {
        if (!isShareDisabled) {
            setShowShareModal(true);
        }
    };

    const shareData: MatchProps[] = [
        {
            matchData: bracketsData[SEMI_FINAL_SOUTH_EAST_MATCH_ID],
            winnerTeamId: winnerTeamIds[SEMI_FINAL_SOUTH_EAST_MATCH_ID],
            isBracketsLocked,
            isTeamLostInPreviousRounds,
            updateBrackets: () => {},
            height: MATCH_HEIGHT,
        },
        {
            matchData: bracketsData[SEMI_FINAL_MIDWEST_WEST_MATCH_ID],
            winnerTeamId: winnerTeamIds[SEMI_FINAL_MIDWEST_WEST_MATCH_ID],
            isBracketsLocked,
            isTeamLostInPreviousRounds,
            updateBrackets: () => {},
            height: MATCH_HEIGHT,
        },
        {
            matchData: bracketsData[FINAL_MATCH_ID],
            winnerTeamId: winnerTeamIds[FINAL_MATCH_ID],
            isBracketsLocked,
            isTeamLostInPreviousRounds,
            updateBrackets: () => {},
            height: MATCH_HEIGHT,
        },
    ];

    const isShareDisabled = bracketsData.find((match) => match.isHomeTeamSelected === undefined) !== undefined;

    return (
        <Container>
            {marchMadnessDataQuery.isLoading ? (
                <Loader />
            ) : (
                <>
                    <RowHeader marginBottom={0}>
                        {getMyStats()}
                        {getMyTotalScore()}
                    </RowHeader>
                    <BracketsWrapper>
                        <RowHeader marginBottom={6}>
                            <RoundName>{t('march-madness.brackets.round-0')}</RoundName>
                            <RoundName>{t('march-madness.brackets.round-1')}</RoundName>
                            <RoundName>{t('march-madness.brackets.round-2')}</RoundName>
                            <RoundName>{t('march-madness.brackets.round-3')}</RoundName>
                            <RoundName>{t('march-madness.brackets.round-4')}</RoundName>
                            <RoundName>{t('march-madness.brackets.round-3')}</RoundName>
                            <RoundName>{t('march-madness.brackets.round-2')}</RoundName>
                            <RoundName>{t('march-madness.brackets.round-1')}</RoundName>
                            <RoundName>{t('march-madness.brackets.round-0')}</RoundName>
                        </RowHeader>
                        <RowHalf>
                            <Region isSideLeft={true} isVertical={true}>
                                {t('march-madness.regions.south')}
                            </Region>
                            <LeftQuarter>
                                <FirstRound>{getMatchesPerIdRange(FIRST_ROUND_SOUTH_MATCH_IDS)}</FirstRound>
                                <SecondRound isSideLeft={true}>
                                    {getMatchesPerIdRange(SECOND_ROUND_SOUTH_MATCH_IDS)}
                                </SecondRound>
                                <Sweet16 isSideLeft={true}>
                                    {getMatchesPerIdRange(SWEET16_ROUND_SOUTH_MATCH_IDS)}
                                </Sweet16>
                                <Elite8 isSideLeft={true}>{getMatchById(ELITE8_ROUND_SOUTH_MATCH_ID)}</Elite8>
                            </LeftQuarter>
                            <RightQuarter>
                                <Elite8 isSideLeft={false}>{getMatchById(ELITE8_ROUND_MIDWEST_MATCH_ID)}</Elite8>
                                <Sweet16 isSideLeft={false}>
                                    {getMatchesPerIdRange(SWEET16_ROUND_MIDWEST_MATCH_IDS)}
                                </Sweet16>
                                <SecondRound isSideLeft={false}>
                                    {getMatchesPerIdRange(SECOND_ROUND_MIDWEST_MATCH_IDS)}
                                </SecondRound>
                                <FirstRound>{getMatchesPerIdRange(FIRST_ROUND_MIDWEST_MATCH_IDS)}</FirstRound>
                            </RightQuarter>
                            <Region isSideLeft={false} isVertical={true}>
                                {t('march-madness.regions.midwest')}
                            </Region>
                        </RowHalf>
                        <SemiFinals>
                            {getMatchById(SEMI_FINAL_SOUTH_EAST_MATCH_ID)}
                            {getMatchById(SEMI_FINAL_MIDWEST_WEST_MATCH_ID)}
                        </SemiFinals>
                        <Final>{getMatchById(FINAL_MATCH_ID)}</Final>

                        {!isBracketsLocked && (
                            <SubmitWrapper>
                                <Button
                                    style={submitButtonStyle}
                                    disabled={isSubmitDisabled}
                                    onClick={() => setShowMintNFTModal(true)}
                                >
                                    {isBracketMinted
                                        ? t('march-madness.brackets.submit-modify')
                                        : t('march-madness.brackets.submit')}
                                </Button>
                            </SubmitWrapper>
                        )}
                        <ShareWrapper>
                            <Share>
                                {t('march-madness.brackets.share')}
                                <TwitterIcon
                                    disabled={isShareDisabled}
                                    padding="8px 0 0 0"
                                    onClick={onTwitterIconClick}
                                />
                            </Share>
                        </ShareWrapper>

                        <RowHalf>
                            <Region isSideLeft={true} isVertical={true}>
                                {t('march-madness.regions.east')}
                            </Region>
                            <LeftQuarter>
                                <FirstRound>{getMatchesPerIdRange(FIRST_ROUND_EAST_MATCH_IDS)}</FirstRound>
                                <SecondRound isSideLeft={true}>
                                    {getMatchesPerIdRange(SECOND_ROUND_EAST_MATCH_IDS)}
                                </SecondRound>
                                <Sweet16 isSideLeft={true}>
                                    {getMatchesPerIdRange(SWEET16_ROUND_EAST_MATCH_IDS)}
                                </Sweet16>
                                <Elite8 isSideLeft={true}>{getMatchById(ELITE8_ROUND_EAST_MATCH_ID)}</Elite8>
                            </LeftQuarter>
                            <RightQuarter>
                                <Elite8 isSideLeft={false}>{getMatchById(ELITE8_ROUND_WEST_MATCH_ID)}</Elite8>
                                <Sweet16 isSideLeft={false}>
                                    {getMatchesPerIdRange(SWEET16_ROUND_WEST_MATCH_IDS)}
                                </Sweet16>
                                <SecondRound isSideLeft={false}>
                                    {getMatchesPerIdRange(SECOND_ROUND_WEST_MATCH_IDS)}
                                </SecondRound>
                                <FirstRound>{getMatchesPerIdRange(FIRST_ROUND_WEST_MATCH_IDS)}</FirstRound>
                            </RightQuarter>
                            <Region isSideLeft={false} isVertical={true}>
                                {t('march-madness.regions.west')}
                            </Region>
                        </RowHalf>
                    </BracketsWrapper>
                    <WildCardsContainer>
                        <WildCardsHeader>{'Wild Cards'}</WildCardsHeader>
                        <WildCardsRow>
                            <Region isSideLeft={true} isVertical={false}>
                                {t('march-madness.regions.south')}
                            </Region>
                            <WildCardMatch
                                homeTeam={wildCardTeams[0].displayName}
                                awayTeam={wildCardTeams[1].displayName}
                                isHomeTeamWon={true}
                                margin="0 2px 0 0"
                            />
                            <WildCardMatch
                                homeTeam={wildCardTeams[4].displayName}
                                awayTeam={wildCardTeams[5].displayName}
                                isHomeTeamWon={false}
                            />
                            <Region isSideLeft={false} isVertical={false}>
                                {t('march-madness.regions.midwest')}
                            </Region>
                        </WildCardsRow>
                        <WildCardsRow>
                            <Region isSideLeft={true} isVertical={false}>
                                {t('march-madness.regions.east')}
                            </Region>
                            <WildCardMatch
                                homeTeam={wildCardTeams[2].displayName}
                                awayTeam={wildCardTeams[3].displayName}
                                isHomeTeamWon={false}
                                margin="0 2px 0 0"
                            />
                            <WildCardMatch
                                homeTeam={wildCardTeams[6].displayName}
                                awayTeam={wildCardTeams[7].displayName}
                                isHomeTeamWon={true}
                            />
                            <Region isSideLeft={false} isVertical={false}>
                                {t('march-madness.regions.west')}
                            </Region>
                        </WildCardsRow>
                    </WildCardsContainer>
                    {showMintNFTModal && (
                        <MintNFTModal
                            isMinted={isBracketMinted}
                            isMinting={isMinting}
                            isUpdated={isUpdated}
                            isUpdating={isUpdating}
                            isError={isMintError}
                            handleSubmit={handleSubmit}
                            handleClose={() => {
                                setIsUpdated(false);
                                setShowMintNFTModal(false);
                            }}
                        />
                    )}
                    {showShareModal && (
                        <ShareModal final4Matches={shareData} handleClose={() => setShowShareModal(false)} />
                    )}
                </>
            )}
        </Container>
    );
};

const MATCH_HEIGHT = 52;
const FIRST_ROUND_MATCH_GAP = 8;
const SECOND_ROUND_MATCH_GAP = 1 * (MATCH_HEIGHT + FIRST_ROUND_MATCH_GAP) + FIRST_ROUND_MATCH_GAP;
const SWEET16_ROUND_MATCH_GAP = 3 * (MATCH_HEIGHT + FIRST_ROUND_MATCH_GAP) + FIRST_ROUND_MATCH_GAP;

const Container = styled.div`
    overflow: auto;
    padding-bottom: 20px;
    ::-webkit-scrollbar {
        height: 10px;
    }
`;

const BracketsWrapper = styled.div`
    width: 1350px;
    height: 1010px;
    background-image: url('${background}'), url('${backgrounBall}');
    background-size: auto;
    background-position: 0 71px, -354px -162px;
    background-repeat: no-repeat;
`;

const RowHalf = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
`;

const LeftQuarter = styled.div`
    display: flex;
`;

const RightQuarter = styled.div`
    display: flex;
    margin-left: 208px;
`;

const FirstRound = styled.div`
    display: flex;
    flex-direction: column;
    z-index: 40;
`;

const SecondRound = styled.div<{ isSideLeft: boolean }>`
    display: flex;
    flex-direction: column;
    ${(props) => `${props.isSideLeft ? 'margin-left: ' : 'margin-right: '}15px;`}
    z-index: 30;
`;

const Sweet16 = styled.div<{ isSideLeft: boolean }>`
    display: flex;
    flex-direction: column;
    ${(props) => `${props.isSideLeft ? 'margin-left: ' : 'margin-right: '}-24px;`}
`;

const Elite8 = styled.div<{ isSideLeft: boolean }>`
    display: flex;
    flex-direction: column;
    ${(props) => `${props.isSideLeft ? 'margin-left: ' : 'margin-right: '}-37px;`}
    z-index: 10;
`;

const SemiFinals = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 38px;
`;

const Final = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 0;
`;

const SubmitWrapper = styled(Final)``;

const submitButtonStyle: CSSProperties = {
    fontSize: '14px',
    fontFamily: "'NCAA' !important",
    textTransform: 'uppercase',
    background: '#FFFFFF',
    border: '2px solid #005EB8',
    borderRadius: '4px',
    color: '#021631',
    width: '142px',
    marginTop: '82px',
};

const Region = styled.div<{ isSideLeft: boolean; isVertical: boolean }>`
    width: ${(props) => (props.isVertical ? '30px' : '81px')};
    height: ${(props) => (props.isVertical ? '472px' : '52px')};
    background: #0e94cb;
    ${(props) => `${props.isSideLeft ? 'margin-right: ' : 'margin-left: '}${props.isVertical ? '5' : '1'}`}px;
    ${(props) => (props.isVertical ? 'writing-mode: vertical-rl;' : '')}
    ${(props) => (props.isVertical ? 'text-orientation: upright;' : '')}
    text-align: justify;
    justify-content: center;
    display: flex;
    align-items: center;
    font-family: 'NCAA' !important;
    font-style: normal;
    font-weight: 400;
    font-size: ${(props) => (props.isVertical ? '30px' : '20px')};
    color: #ffffff;
    letter-spacing: ${(props) => (props.isVertical ? '15px' : '2px')};
}
`;

const RowHeader = styled.div<{ marginBottom: number }>`
    width: 1252px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: ${(props) => `0 49px ${props.marginBottom}px 49px`};
`;

const RoundName = styled.div`
    width: 129px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 94, 184, 0.4);
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    text-align: center;
    text-transform: uppercase;
    color: #ffffff;
    margin-top: 14px;
`;

const MyStats = styled.div`
    display: flex;
    width: 312px;
    height: 80px;
    background: #c12b34;
    border: 1px solid #c12b34;
`;

const StatsColumn = styled.div<{ width?: string; margin?: string; justify?: string }>`
    display: flex;
    flex-direction: column;
    justify-content: ${(props) => (props.justify ? props.justify : 'center')};
    ${(props) => (props.width ? `width: ${props.width};` : '')}
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

const StatsRow = styled.div<{ justify?: string; margin?: string; hasBorder?: boolean }>`
    display: flex;
    flex-direction: row;
    justify-content: ${(props) => (props.justify ? props.justify : 'space-between')};
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
    ${(props) => (props.hasBorder ? 'border-bottom: 1px solid #0E94CB;' : '')}
`;

const StatsText = styled.span<{ fontWeight?: number; fontSize?: number; lineHeight?: number; margin?: string }>`
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: ${(props) => (props.fontWeight ? props.fontWeight : '400')};
    font-size: ${(props) => (props.fontSize ? props.fontSize : '16')}px;
    line-height: ${(props) => (props.lineHeight ? props.lineHeight : '14')}px;
    text-transform: uppercase;
    color: #ffffff;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

const MyTotalScore = styled.div`
    width: 930px;
    height: 80px;
    display: flex;
    background: #021631;
    border: 1px solid #0e94cb;
`;

const WildCardsContainer = styled.div`
    width: 1350px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: -38px;
`;

const WildCardsHeader = styled.div`
    width: 436px;
    height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #0e94cb;
    margin-bottom: 6px;
    font-family: 'NCAA' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 23px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #ffffff;
`;

const WildCardsRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
`;

const VerticalLine = styled.div`
    border-left: 2px solid #0e94cb;
    height: 70px;
    margin: 4px 0;
`;

const ShareWrapper = styled(Final)``;

const Share = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    color: #ffffff;
    margin-top: 116px;
`;

export default Brackets;
