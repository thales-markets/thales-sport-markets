import { MultiplierType } from 'enums/overdrop';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import useUserMultipliersQuery from 'queries/overdrop/useUserMultipliersQuery';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getOverdropPreventShowingModal,
    getOverdropUIState,
    getOverdropWelcomeModalFlag,
    setDefaultOverdropState,
    setOverdropState,
    setWelcomeModalVisibility,
} from 'redux/modules/ui';
import { OverdropUIState, OverdropUserData } from 'types/overdrop';
import { RootState } from 'types/redux';
import { getCurrentLevelByPoints, getMultiplierValueFromQuery } from 'utils/overdrop';
import { useAccount } from 'wagmi';
import DailyModal from '../DailyModal';
import LevelUpModal from '../LevelUpModal';
import WelcomeModal from '../WelcomeModal';

const ModalWrapper: React.FC = () => {
    const dispatch = useDispatch();

    const queryParams: { freeBet?: string } = queryString.parse(location.search);

    const { address: walletAddress, isConnected } = useAccount();

    const overdropUIState = useSelector((state: RootState) => getOverdropUIState(state));
    const overdropWelcomeModalFlag = useSelector((state: RootState) => getOverdropWelcomeModalFlag(state));
    const preventShowingModal = useSelector((state: RootState) => getOverdropPreventShowingModal(state));

    const [levelChanged, setLevelChanged] = useState<boolean>(false);
    const [dailyMultiplierChanged, setDailyMultiplierChanged] = useState<boolean>(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);

    const [overdropStateByWallet, setOverdropStateByWallet] = useState<OverdropUIState | undefined>(undefined);

    const [preventMultipliersModalShowing, setPreventMultipliersModalShowing] = useState<boolean>(false);

    const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);
    const [showDailyMultiplierModal, setShowDailyMultiplierModal] = useState<boolean>(false);

    const userDataQuery = useUserDataQuery(walletAddress as string, {
        enabled: isConnected,
    });

    const userMultipliersQuery = useUserMultipliersQuery(walletAddress as string, {
        enabled: isConnected,
    });

    const userData: OverdropUserData | undefined =
        userDataQuery?.isSuccess && userDataQuery?.data ? userDataQuery.data : undefined;

    const userMultipliers =
        userMultipliersQuery.isSuccess && userMultipliersQuery.data ? userMultipliersQuery.data : undefined;

    // Handle welcome modal visibility
    useEffect(() => {
        if (overdropWelcomeModalFlag == false && !queryParams.freeBet) {
            setShowWelcomeModal(true);
            dispatch(setWelcomeModalVisibility({ showWelcomeModal: true }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // Handle prevent showing multipliers modal
    useEffect(() => {
        setPreventMultipliersModalShowing(preventShowingModal);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle wallet address change
    useEffect(() => {
        if (walletAddress) {
            const overdropStateItem = overdropUIState.find(
                (item) => item.walletAddress?.toLowerCase() == walletAddress.toLowerCase()
            );

            if (isConnected) {
                if (!overdropStateItem) {
                    setOverdropStateByWallet({
                        walletAddress: walletAddress,
                        dailyMultiplier: 0,
                        currentLevel: 0,
                    });
                    dispatch(setDefaultOverdropState({ walletAddress }));
                } else {
                    setOverdropStateByWallet(overdropStateItem);
                }
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, walletAddress, isConnected]);

    useEffect(() => {
        if (userData && userMultipliers && overdropStateByWallet) {
            const currentLevelItem = getCurrentLevelByPoints(userData?.points);
            const overdropStateCurrentWalletAddress = overdropUIState.find(
                (item) => item.walletAddress == walletAddress
            );

            if (overdropStateCurrentWalletAddress) {
                dispatch(
                    setOverdropState({
                        ...overdropStateCurrentWalletAddress,
                        currentLevel: currentLevelItem.level,
                        dailyMultiplier: getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY),
                    })
                );
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, userData, userMultipliers, walletAddress]);

    useEffect(() => {
        const overdropStateCurrentWalletAddress = overdropUIState.find((item) => item.walletAddress == walletAddress);

        if (userData && userMultipliers && overdropStateCurrentWalletAddress) {
            const levelItem = getCurrentLevelByPoints(userData.points);
            if (overdropStateCurrentWalletAddress.currentLevel < levelItem.level && levelItem.level !== 0) {
                setLevelChanged(true);
                setShowLevelUpModal(true);
                return;
            }
            if (
                overdropStateCurrentWalletAddress.dailyMultiplier <
                    getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY) &&
                getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY) !== 0
            ) {
                setDailyMultiplierChanged(true);
                setShowDailyMultiplierModal(true);
                return;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData, userMultipliers, walletAddress]);

    return (
        <>
            {showWelcomeModal ? (
                <WelcomeModal onClose={() => setShowWelcomeModal(false)} />
            ) : levelChanged && userData && showLevelUpModal ? (
                <LevelUpModal
                    currentLevel={getCurrentLevelByPoints(userData?.points).level}
                    onClose={() => setShowLevelUpModal(false)}
                />
            ) : dailyMultiplierChanged &&
              userMultipliers &&
              showDailyMultiplierModal &&
              !preventMultipliersModalShowing ? (
                <DailyModal
                    dayStreak={getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY) / 5}
                    percentage={getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY)}
                    onClose={() => setShowDailyMultiplierModal(false)}
                />
            ) : (
                ''
            )}
        </>
    );
};

export default ModalWrapper;
