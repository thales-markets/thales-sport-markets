import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import useUserMultipliersQuery from 'queries/overdrop/useUserMultipliersQuery';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getOverdropUIState, setDefaultOverdropState, setOverdropState } from 'redux/modules/ui';
import { getIsWalletConnected, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { MultiplierType, OverdropUIState, OverdropUserData } from 'types/overdrop';
import { getCurrentLevelByPoints, getMultiplierValueFromQuery } from 'utils/overdrop';
import DailyModal from '../DailyModal';
import LevelUpModal from '../LevelUpModal';
import WelcomeModal from '../WelcomeModal';

const ModalWrapper: React.FC = () => {
    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const overdropUIState = useSelector((state: RootState) => getOverdropUIState(state));

    const [levelChanged, setLevelChanged] = useState<boolean>(false);
    const [dailyMultiplierChanged, setDailyMultiplierChanged] = useState<boolean>(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);

    const [overdropStateByWallet, setOverdropStateByWallet] = useState<OverdropUIState | undefined>(undefined);

    const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);
    const [showDailyMultiplierModal, setShowDailyMultiplierModal] = useState<boolean>(false);

    const userDataQuery = useUserDataQuery(walletAddress, {
        enabled: !!isAppReady,
    });

    const userMultipliersQuery = useUserMultipliersQuery(walletAddress, {
        enabled: !!isAppReady,
    });

    const userData: OverdropUserData | undefined =
        userDataQuery?.isSuccess && userDataQuery?.data ? userDataQuery.data : undefined;

    const userMultipliers =
        userMultipliersQuery.isSuccess && userMultipliersQuery.data ? userMultipliersQuery.data : undefined;

    // Handle wallet address change
    useEffect(() => {
        const overdropStateItem = overdropUIState.find((item) => item.walletAddress == walletAddress);

        if (isWalletConnected) {
            if (!overdropStateItem) {
                setOverdropStateByWallet({
                    walletAddress: walletAddress,
                    dailyMultiplier: 0,
                    currentLevel: 0,
                    welcomeModalFlag: false,
                    preventShowingDailyModal: false,
                });
                dispatch(setDefaultOverdropState({ walletAddress }));
            } else {
                setOverdropStateByWallet(overdropStateItem);
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, walletAddress, isWalletConnected]);

    useEffect(() => {
        if (userData && userMultipliers && overdropStateByWallet) {
            const currentLevelItem = getCurrentLevelByPoints(userData?.points);

            if (overdropStateByWallet.welcomeModalFlag == false) setShowWelcomeModal(true);
            dispatch(
                setOverdropState({
                    ...overdropStateByWallet,
                    welcomeModalFlag: true,
                    currentLevel: currentLevelItem.level,
                    dailyMultiplier: getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY),
                })
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, userData, userMultipliers, overdropStateByWallet]);

    useEffect(() => {
        if (userData && userMultipliers && overdropStateByWallet) {
            const levelItem = getCurrentLevelByPoints(userData.points);
            if (overdropStateByWallet.currentLevel !== levelItem.level && levelItem.level !== 0) {
                setLevelChanged(true);
                setShowLevelUpModal(true);
                return;
            }
            if (
                overdropStateByWallet.dailyMultiplier !==
                    getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY) &&
                getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY) !== 0
            ) {
                setDailyMultiplierChanged(true);
                setShowDailyMultiplierModal(true);
                return;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData, userMultipliers, overdropStateByWallet]);

    return (
        <>
            {showWelcomeModal ? (
                <WelcomeModal onClose={() => setShowWelcomeModal(false)} />
            ) : levelChanged && userData && showLevelUpModal ? (
                <LevelUpModal
                    currentLevel={getCurrentLevelByPoints(userData?.points).level}
                    onClose={() => setShowLevelUpModal(false)}
                />
            ) : dailyMultiplierChanged && userMultipliers && showDailyMultiplierModal ? (
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
