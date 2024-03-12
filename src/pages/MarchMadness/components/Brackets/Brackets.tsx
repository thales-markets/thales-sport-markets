import backgrounBall from 'assets/images/march-madness/background-marchmadness-ball.png';
import backgroundCourt from 'assets/images/march-madness/background-marchmadness-court.svg';
import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import Loader from 'components/Loader';
import SelectInput from 'components/SelectInput';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import {
    APPROVE_MULTIPLIER,
    CONVERSION_BUFFER_PERCENTAGE,
    DEFAULT_BRACKET_ID,
    ELITE8_ROUND_EAST_MATCH_ID,
    ELITE8_ROUND_MIDWEST_MATCH_ID,
    ELITE8_ROUND_SOUTH_MATCH_ID,
    ELITE8_ROUND_WEST_MATCH_ID,
    FINAL_MATCH_ID,
    FIRST_ROUND_EAST_MATCH_IDS,
    FIRST_ROUND_MATCH_IDS,
    FIRST_ROUND_MIDWEST_MATCH_IDS,
    FIRST_ROUND_SOUTH_MATCH_IDS,
    FIRST_ROUND_WEST_MATCH_IDS,
    MAX_TOTAL_POINTS,
    NUMBER_OF_MATCHES,
    NUMBER_OF_ROUNDS,
    POINTS_PER_ROUND,
    SECOND_ROUND_EAST_MATCH_IDS,
    SECOND_ROUND_MATCH_IDS,
    SECOND_ROUND_MIDWEST_MATCH_IDS,
    SECOND_ROUND_SOUTH_MATCH_IDS,
    SECOND_ROUND_WEST_MATCH_IDS,
    SEMI_FINAL_MIDWEST_WEST_MATCH_ID,
    SEMI_FINAL_SOUTH_EAST_MATCH_ID,
    SWEET16_ROUND_EAST_MATCH_IDS,
    SWEET16_ROUND_MATCH_IDS,
    SWEET16_ROUND_MIDWEST_MATCH_IDS,
    SWEET16_ROUND_SOUTH_MATCH_IDS,
    SWEET16_ROUND_WEST_MATCH_IDS,
    initialBracketsData,
    wildCardTeams,
} from 'constants/marchMadness';
import { BigNumber } from 'ethers';
import { TwitterIcon } from 'pages/Markets/Home/Parlay/components/styled-components';
import useLeaderboardByGuessedCorrectlyQuery from 'queries/marchMadness/useLeaderboardByGuessedCorrectlyQuery';
import useMarchMadnessBracketQuery from 'queries/marchMadness/useMarchMadnessBracketQuery';
import useMarchMadnessDataQuery from 'queries/marchMadness/useMarchMadnessDataQuery';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import { getParlayPayment } from 'redux/modules/parlay';
import { getIsAA, getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import {
    COLLATERAL_DECIMALS,
    coinParser,
    formatCurrencyWithSign,
    localStore,
    roundNumberToDecimals,
    truncToDecimals,
} from 'thales-utils';
import { BracketMatch } from 'types/marchMadness';
import { ThemeInterface } from 'types/ui';
import { executeBiconomyTransaction } from 'utils/biconomy';
import { getCollateral, getCollaterals, getDefaultCollateral, isStableCurrency } from 'utils/collaterals';
import { getFirstMatchIndexInRound, getLocalStorageKey, getNumberOfMatchesPerRound } from 'utils/marchMadness';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { refetchMarchMadnessData } from 'utils/queryConnector';
import Match from '../Match';
import { MatchProps } from '../Match/Match';
import MintNFTModal from '../MintNFTModal';
import ShareModal from '../ShareModal';
import WildCardMatch from '../WildCardMatch';

const Brackets: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isAA = useSelector((state: RootState) => getIsAA(state));
    const parlayPayment = useSelector(getParlayPayment);
    const selectedCollateralIndex = parlayPayment.selectedCollateralIndex;

    const [selectedBracketId, setSelectedBracketId] = useState<number>(DEFAULT_BRACKET_ID);
    const [isBracketMinted, setIsBracketMinted] = useState(false);
    const [bracketsData, setBracketsData] = useState(initialBracketsData);
    const [winnerTeamIds, setWinnerTeamIds] = useState(Array<number>(NUMBER_OF_MATCHES).fill(0));
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [showMintNFTModal, setShowMintNFTModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);
    const [isMintError, setIsMintError] = useState(false);
    const [hasAllowance, setHasAllowance] = useState(false);
    const [isAllowing, setIsAllowing] = useState(false);
    const [openApprovalModal, setOpenApprovalModal] = useState(false);

    const marchMadnessDataQuery = useMarchMadnessDataQuery(walletAddress, networkId, {
        enabled: isAppReady,
    });
    const marchMadnessData =
        marchMadnessDataQuery.isSuccess && marchMadnessDataQuery.data ? marchMadnessDataQuery.data : null;

    const marchMadnessBracketQuery = useMarchMadnessBracketQuery(selectedBracketId, networkId, {
        enabled: isAppReady && selectedBracketId !== DEFAULT_BRACKET_ID,
    });
    const marchMadnessBracket = useMemo(
        () =>
            marchMadnessBracketQuery.isSuccess && marchMadnessBracketQuery.data ? marchMadnessBracketQuery.data : null,
        [marchMadnessBracketQuery]
    );

    const isBracketsLocked = useMemo(() => !marchMadnessData?.isMintAvailable, [marchMadnessData?.isMintAvailable]);
    const isBracketMintedOnContract = useMemo(
        () => marchMadnessData && marchMadnessData.bracketsIds.includes(selectedBracketId),
        [marchMadnessData, selectedBracketId]
    );

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const collateralAddress =
        networkConnector.multipleCollateral && networkConnector.multipleCollateral[selectedCollateral]?.address;
    const isEth = selectedCollateral === CRYPTO_CURRENCY_MAP.ETH;
    const isDefaultCollateral = selectedCollateral === defaultCollateral;

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const convertFromStable = useCallback(
        (value: number) => {
            if (isStableCurrency(selectedCollateral)) {
                return value;
            } else {
                const rate = exchangeRates?.[selectedCollateral];
                const priceFeedBuffer = 1 - CONVERSION_BUFFER_PERCENTAGE; // TODO: use getMinimumNeeded from contract
                return rate
                    ? Math.ceil((value / (rate * priceFeedBuffer)) * 10 ** COLLATERAL_DECIMALS[selectedCollateral]) /
                          10 ** COLLATERAL_DECIMALS[selectedCollateral]
                    : 0;
            }
        },
        [selectedCollateral, exchangeRates]
    );

    // populate bracket
    useEffect(() => {
        // initial or unfinished
        if (!isBracketsLocked && !isBracketMinted) {
            const lsBrackets = localStore.get(getLocalStorageKey(selectedBracketId, networkId, walletAddress));
            setBracketsData(
                lsBrackets !== undefined && (lsBrackets as BracketMatch[]).length
                    ? (lsBrackets as BracketMatch[])
                    : initialBracketsData
            );
        } else if (isBracketMintedOnContract && marchMadnessBracket !== null) {
            // existing bracket
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

                        const isHomeTeamSelected = homeTeamId === marchMadnessBracket[match.id];
                        return {
                            ...match,
                            homeTeamId,
                            awayTeamId,
                            isHomeTeamSelected,
                        };
                    });
                bracketsMapped = bracketsMapped.concat(currentRound);
            }

            localStore.set(getLocalStorageKey(selectedBracketId, networkId, walletAddress), bracketsMapped);
            setBracketsData(bracketsMapped);
        }
    }, [
        networkId,
        walletAddress,
        isBracketMintedOnContract,
        marchMadnessBracket,
        isBracketMinted,
        isBracketsLocked,
        selectedBracketId,
    ]);

    // populate match winners
    useEffect(() => {
        if (marchMadnessData) {
            setIsBracketMinted(selectedBracketId !== DEFAULT_BRACKET_ID);

            const shouldUpdate =
                winnerTeamIds.findIndex((teamId, index) => teamId !== marchMadnessData.winnerTeamIdsPerMatch[index]) !==
                -1;
            if (shouldUpdate) {
                setWinnerTeamIds(marchMadnessData.winnerTeamIdsPerMatch);
            }
        }
    }, [networkId, marchMadnessData, winnerTeamIds, selectedBracketId]);

    // set initial bracket ID to last one if it exists and not modified
    useEffect(() => {
        const isDefaultBracketPresent =
            localStore.get(getLocalStorageKey(DEFAULT_BRACKET_ID, networkId, walletAddress)) !== undefined;

        if (marchMadnessData && marchMadnessData.bracketsIds.length && (!isDefaultBracketPresent || isBracketsLocked)) {
            const lastBracketId = Math.max(...marchMadnessData.bracketsIds);
            setSelectedBracketId(lastBracketId);
        }
    }, [marchMadnessData, networkId, walletAddress, isBracketsLocked]);

    // check if submit bracket is disabled and set it
    useEffect(() => {
        let submitDisabled = false;
        if (isBracketMinted && marchMadnessBracket !== null) {
            // if already minted compare selction on contract and on UI
            if (isBracketMinted === isBracketMintedOnContract) {
                submitDisabled =
                    bracketsData.find(
                        (match) =>
                            (match.isHomeTeamSelected ? match.homeTeamId : match.awayTeamId) !==
                            marchMadnessBracket[match.id]
                    ) === undefined;
                setIsSubmitDisabled(submitDisabled);
            }
        } else {
            submitDisabled = bracketsData.find((match) => match.isHomeTeamSelected === undefined) !== undefined;
            setIsSubmitDisabled(submitDisabled);
        }
    }, [isBracketMinted, bracketsData, marchMadnessBracket, isBracketMintedOnContract]);

    // check allowance
    useEffect(() => {
        const { marchMadnessContract, multipleCollateral, signer } = networkConnector;
        if (marchMadnessContract && multipleCollateral && signer && marchMadnessData) {
            const collateralContractWithSigner = multipleCollateral[selectedCollateral]?.connect(signer);

            const getAllowance = async () => {
                try {
                    const parsedAmount = coinParser(
                        isStableCurrency(selectedCollateral)
                            ? marchMadnessData.mintingPrice.toString()
                            : roundNumberToDecimals(
                                  convertFromStable(marchMadnessData.mintingPrice),
                                  COLLATERAL_DECIMALS[selectedCollateral]
                              ).toString(),
                        networkId,
                        selectedCollateral
                    );
                    const allowance = await checkAllowance(
                        parsedAmount,
                        collateralContractWithSigner,
                        walletAddress,
                        marchMadnessContract.address
                    );

                    setHasAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            };
            if (isWalletConnected && marchMadnessData.mintingPrice) {
                isEth ? setHasAllowance(true) : getAllowance();
            }
        }
    }, [
        walletAddress,
        isWalletConnected,
        hasAllowance,
        isAllowing,
        marchMadnessData,
        selectedCollateralIndex,
        networkId,
        selectedCollateral,
        isEth,
        isDefaultCollateral,
        isBracketMinted,
        convertFromStable,
    ]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { marchMadnessContract, sUSDContract, signer, multipleCollateral } = networkConnector;
        if (marchMadnessContract && multipleCollateral && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                const collateralContractWithSigner = isDefaultCollateral
                    ? sUSDContract?.connect(signer)
                    : multipleCollateral[selectedCollateral]?.connect(signer);

                const addressToApprove = marchMadnessContract.address;
                let txResult;
                if (isAA) {
                    txResult = await executeBiconomyTransaction(
                        collateralContractWithSigner?.address ?? '',
                        collateralContractWithSigner,
                        'approve',
                        [addressToApprove, approveAmount]
                    );
                } else {
                    const tx = await collateralContractWithSigner?.approve(addressToApprove, approveAmount);
                    setOpenApprovalModal(false);
                    txResult = await tx.wait();
                }

                if (txResult && txResult.transactionHash) {
                    setIsAllowing(false);
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.approve-success')));
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
                setIsAllowing(false);
            }
        }
    };

    const handleSubmit = async () => {
        setIsMintError(false);
        const { marchMadnessContract, signer } = networkConnector;
        if (marchMadnessContract && signer) {
            let toastId: string | number = '';
            if (marchMadnessData) {
                const marchMadnessContractWithSigner = marchMadnessContract.connect(signer);
                const bracketsForContract = bracketsData.map((match) =>
                    match.isHomeTeamSelected ? match.homeTeamId : match.awayTeamId
                );

                try {
                    let tx;
                    if (isBracketMinted) {
                        setIsUpdating(true);
                        tx = await marchMadnessContractWithSigner.updateBracketsForAlreadyMintedItem(
                            selectedBracketId,
                            bracketsForContract
                        );
                    } else {
                        setIsMinting(true);
                        toastId = toast.loading(t('market.toast-message.transaction-pending'));

                        if (isDefaultCollateral) {
                            tx = await marchMadnessContractWithSigner.mint(bracketsForContract);
                        } else {
                            const collateralAmount = coinParser(
                                truncToDecimals(
                                    convertFromStable(marchMadnessData.mintingPrice),
                                    COLLATERAL_DECIMALS[selectedCollateral]
                                ),
                                networkId,
                                selectedCollateral
                            );
                            console.log(collateralAmount);
                            tx = isEth
                                ? await marchMadnessContractWithSigner.mintWithEth(bracketsForContract, {
                                      value: collateralAmount,
                                  })
                                : await marchMadnessContractWithSigner.mintWithDiffCollateral(
                                      collateralAddress,
                                      collateralAmount,
                                      isEth,
                                      bracketsForContract
                                  );
                        }
                    }

                    const txResult = await tx.wait();

                    if (txResult && txResult.transactionHash) {
                        window.localStorage.removeItem(
                            getLocalStorageKey(DEFAULT_BRACKET_ID, networkId, walletAddress)
                        );
                        toastId &&
                            toast.update(
                                toastId,
                                getSuccessToastOptions(t(`march-madness.brackets.confirmation-message`))
                            );
                        refetchMarchMadnessData(walletAddress, networkId);
                        if (isBracketMinted) {
                            setIsUpdated(true);
                        }
                        setIsBracketMinted(true);
                        setIsSubmitDisabled(true);
                        setIsUpdating(false);
                        setIsMinting(false);
                    }
                } catch (e) {
                    toastId && toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                    console.log('Error ', e);
                    setIsUpdating(false);
                    setIsMinting(false);
                    setIsMintError(true);
                }
            } else {
                toast.update(toastId, getErrorToastOptions(t('march-madness.brackets.error-minting-price')));
                setIsMintError(true);
            }
        }
    };

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

        localStore.set(getLocalStorageKey(selectedBracketId, networkId, walletAddress), updatedChildrenMatches);
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

    const leaderboardByGuessedGamesQuery = useLeaderboardByGuessedCorrectlyQuery(networkId);

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
                <StatsColumn width="40%">
                    <StatsText fontWeight={600} margin="0 0 0 21px">
                        {t('march-madness.brackets.stats.my-stats')}
                    </StatsText>
                </StatsColumn>
                <StatsColumn width="60%">
                    <StatsRow justify="normal">
                        <StatsText>{t('march-madness.brackets.stats.bracket')}:</StatsText>
                        <StatsText margin="0 15px 0 auto" fontWeight={700}>
                            {isSubmitDisabled
                                ? t('march-madness.brackets.stats.incomplete')
                                : t('march-madness.brackets.stats.complete')}
                        </StatsText>
                    </StatsRow>
                    <StatsRow justify="normal">
                        <StatsText>{t('march-madness.brackets.stats.rank')}:</StatsText>
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
        const roundNameKey = 'march-madness.brackets.round-' + round;

        return (
            <StatsColumn width="8%" margin="0 10px" key={round}>
                <StatsRow>
                    <StatsText fontWeight={700} fontSize={14} margin="0 0 2px 0">
                        {t(roundNameKey)}
                    </StatsText>
                </StatsRow>
                <StatsRow justify="initial">
                    <StatsText fontSize={14} margin="0 5px 0 0">
                        {t('march-madness.brackets.stats.points')}
                    </StatsText>
                    <StatsText fontWeight={600} fontSize={14}>
                        {roundPoints + '/' + POINTS_PER_ROUND}
                    </StatsText>
                </StatsRow>
            </StatsColumn>
        );
    };

    const getMyTotalScore = () => {
        const totalPoints = marchMadnessData?.winningsPerRound.reduce((a, b) => a + b, 0) || 0;

        const bracketsIdsOptions: Array<{ value: number; label: string }> = [];
        let defaultOptionIndex = -1;

        if (marchMadnessData && marchMadnessData.bracketsIds.length) {
            const bracketsIdsDesc = [...marchMadnessData.bracketsIds].sort((a, b) => b - a);
            for (let i = 0; i < bracketsIdsDesc.length; i++) {
                const bracketId = bracketsIdsDesc[i];
                bracketsIdsOptions.push({
                    value: bracketId,
                    label: t('march-madness.brackets.bracket-id', { id: bracketsIdsDesc[i] }),
                });
                if (selectedBracketId === bracketId) {
                    defaultOptionIndex = i;
                }
            }
        }

        return (
            <MyTotalScore>
                <StatsColumn width="12%" margin="0 0 0 25px">
                    <StatsRow>
                        <StatsText>{t('march-madness.brackets.stats.total-points')}</StatsText>
                    </StatsRow>
                    <StatsRow>
                        <StatsText fontWeight={700}>{`${totalPoints}  / ${MAX_TOTAL_POINTS}`}</StatsText>
                    </StatsRow>
                </StatsColumn>
                <VerticalLine />
                {Array(NUMBER_OF_ROUNDS)
                    .fill(0)
                    .map((_round, index) => getScorePerRound(index))}
                <DropdownContainer>
                    <SelectInput
                        placeholder={t('march-madness.brackets.my-brackets')}
                        defaultValue={defaultOptionIndex}
                        options={bracketsIdsOptions}
                        handleChange={(value) => setSelectedBracketId(Number(value))}
                    />
                </DropdownContainer>
            </MyTotalScore>
        );
    };

    const createAsBracket = (bracketId: number) => {
        const lsBrackets = localStore.get(getLocalStorageKey(bracketId, networkId, walletAddress));
        const currentBracketData =
            lsBrackets !== undefined && (lsBrackets as BracketMatch[]).length
                ? (lsBrackets as BracketMatch[])
                : initialBracketsData;

        localStore.set(getLocalStorageKey(DEFAULT_BRACKET_ID, networkId, walletAddress), currentBracketData);
        setBracketsData(currentBracketData);
        setSelectedBracketId(DEFAULT_BRACKET_ID);
    };

    const resetBracket = () => {
        localStore.set(getLocalStorageKey(DEFAULT_BRACKET_ID, networkId, walletAddress), initialBracketsData);
        setBracketsData(initialBracketsData);
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
                    <RowStats>
                        {getMyStats()}
                        {getMyTotalScore()}
                    </RowStats>
                    <BracketsWrapper>
                        <RowHeader>
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
                        {!isBracketsLocked && !!marchMadnessData?.bracketsIds.length && (
                            <CreateNewBracketWrapper>
                                <Button
                                    additionalStyles={{
                                        fontSize: '14px',
                                        fontFamily: "'NCAA' !important",
                                        textTransform: 'uppercase',
                                        background: theme.marchMadness.button.background.senary,
                                        border: `2px solid ${theme.marchMadness.borderColor.senary}`,
                                        borderRadius: '4px',
                                        color: theme.marchMadness.button.textColor.secondary,
                                        width: '160px',
                                        padding: '3px 10px',
                                    }}
                                    onClick={() =>
                                        selectedBracketId === DEFAULT_BRACKET_ID
                                            ? resetBracket()
                                            : createAsBracket(selectedBracketId)
                                    }
                                >
                                    {selectedBracketId === DEFAULT_BRACKET_ID
                                        ? t('march-madness.brackets.clear-all')
                                        : t('march-madness.brackets.create-as')}
                                </Button>
                            </CreateNewBracketWrapper>
                        )}
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
                                <ButtonWrrapper>
                                    <Button
                                        additionalStyles={{
                                            fontSize: '14px',
                                            fontFamily: "'NCAA' !important",
                                            textTransform: 'uppercase',
                                            background: theme.marchMadness.button.background.senary,
                                            border: `2px solid ${theme.marchMadness.borderColor.senary}`,
                                            borderRadius: '4px',
                                            color: theme.marchMadness.button.textColor.secondary,
                                            width: isBracketMinted ? '245px' : '180px',
                                            height: '32px',
                                            padding: '3px 10px',
                                        }}
                                        disabled={isSubmitDisabled}
                                        onClick={() =>
                                            hasAllowance ? setShowMintNFTModal(true) : setOpenApprovalModal(true)
                                        }
                                    >
                                        {isBracketMinted
                                            ? t('march-madness.brackets.submit-modify')
                                            : hasAllowance
                                            ? t('march-madness.brackets.submit')
                                            : t('common.wallet.approve')}
                                    </Button>
                                    {!isBracketMinted && (
                                        <CollateralWrapper>
                                            <CollateralSeparator />
                                            <CollateralSelector
                                                collateralArray={getCollaterals(networkId)}
                                                selectedItem={selectedCollateralIndex}
                                                onChangeCollateral={() => {}}
                                                isDetailedView
                                                collateralBalances={multipleCollateralBalances.data}
                                                exchangeRates={exchangeRates}
                                                dropDownWidth="300px"
                                            />
                                        </CollateralWrapper>
                                    )}
                                    <SubmitInfo>
                                        <SubmitInfoText>
                                            {t('march-madness.brackets.submit-info', {
                                                value: formatCurrencyWithSign(
                                                    USD_SIGN,
                                                    marchMadnessData?.mintingPrice || '...'
                                                ),
                                            })}
                                        </SubmitInfoText>
                                    </SubmitInfo>
                                </ButtonWrrapper>
                            </SubmitWrapper>
                        )}
                        <ShareWrapper>
                            <Share>
                                <TwitterIcon
                                    disabled={isShareDisabled}
                                    padding="0 0 8px 0"
                                    onClick={onTwitterIconClick}
                                />
                                {t('march-madness.brackets.share')}
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
                    {openApprovalModal && marchMadnessData && (
                        <ApprovalModal
                            defaultAmount={convertFromStable(marchMadnessData.mintingPrice) * APPROVE_MULTIPLIER}
                            collateralIndex={selectedCollateralIndex}
                            tokenSymbol={selectedCollateral}
                            isAllowing={isAllowing}
                            onSubmit={handleAllowance}
                            onClose={() => setOpenApprovalModal(false)}
                        />
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
    position: relative;
    width: 1350px;
    height: 1010px;
    background-image: url('${backgroundCourt}'), url('${backgrounBall}');
    background-size: auto;
    background-position: -8px 64px, -291px -162px;
    background-repeat: no-repeat;
`;

const CreateNewBracketWrapper = styled.div`
    position: absolute;
    left: calc(50% - 80px);
    margin-top: 20px;
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
    z-index: 11;
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

const SubmitInfo = styled(FlexDivCentered)`
    margin-top: 5px;
`;

const SubmitInfoText = styled.span`
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    letter-spacing: 1px;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
`;

const ButtonWrrapper = styled.div`
    position: relative;
    width: 245px;
    margin-top: 100px;
`;

const CollateralWrapper = styled(FlexDivCentered)`
    position: absolute;
    right: 0;
    top: 0;
    width: 76px;
    height: 32px;
    padding: 3px;
    background: ${(props) => props.theme.marchMadness.button.background.senary};
    border: 2px solid ${(props) => props.theme.marchMadness.borderColor.senary};
    border-radius: 0 4px 4px 0;
    z-index: 11;
`;

const CollateralSeparator = styled.div`
    border-left: 2px solid ${(props) => props.theme.marchMadness.borderColor.tertiary};
    height: 22px;
`;

const Region = styled.div<{ isSideLeft: boolean; isVertical: boolean }>`
    width: ${(props) => (props.isVertical ? '30px' : '81px')};
    height: ${(props) => (props.isVertical ? '472px' : '52px')};
    border-radius: 5px;
    background: ${(props) => props.theme.marchMadness.background.tertiary};
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
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    letter-spacing: ${(props) => (props.isVertical ? '15px' : '2px')};
}
`;

const RowStats = styled.div`
    width: 1322px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 0 14px;
`;

const RowHeader = styled.div`
    width: 1252px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 0 49px 6px 49px;
`;

const RoundName = styled.div`
    width: 129px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    text-align: center;
    text-transform: uppercase;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    margin-top: 14px;
`;

const MyStats = styled.div`
    display: flex;
    width: 304px;
    height: 80px;
    background: ${(props) => props.theme.marchMadness.background.senary};
    border-radius: 8px;
`;

const StatsColumn = styled.div<{ width?: string; margin?: string; justify?: string }>`
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: ${(props) => (props.justify ? props.justify : 'center')};
    ${(props) => (props.width ? `width: ${props.width};` : '')}
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

const StatsRow = styled.div<{ justify?: string; margin?: string }>`
    display: flex;
    flex-direction: row;
    justify-content: ${(props) => (props.justify ? props.justify : 'space-between')};
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

const StatsText = styled.span<{ fontWeight?: number; fontSize?: number; lineHeight?: number; margin?: string }>`
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: ${(props) => (props.fontWeight ? props.fontWeight : '400')};
    font-size: ${(props) => (props.fontSize ? props.fontSize : '16')}px;
    line-height: ${(props) => (props.lineHeight ? props.lineHeight : '14')}px;
    text-transform: uppercase;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

const MyTotalScore = styled.div`
    width: 1007px;
    height: 80px;
    display: flex;
    background: ${(props) => props.theme.marchMadness.background.tertiary};
    border-radius: 8px;
`;

const DropdownContainer = styled(FlexDivColumnCentered)`
    margin: 0 10px;
    z-index: 100;
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
    border: 2px solid ${(props) => props.theme.marchMadness.borderColor.senary};
    border-radius: 5px;
    margin-bottom: 6px;
    font-family: 'NCAA' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 23px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
`;

const WildCardsRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
`;

const VerticalLine = styled.div`
    border-left: 2px solid ${(props) => props.theme.marchMadness.borderColor.quaternary};
    height: 70px;
    margin: 4px 15px;
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
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    margin-top: 180px;
`;

export default Brackets;
