import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import useUserMultipliersQuery from 'queries/overdrop/useUserMultipliersQuery';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getOverdropUIState, setOverdropState } from 'redux/modules/ui';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { MultiplierType, OverdropUserData } from 'types/overdrop';
import { getCurrentLevelByPoints, getMultiplierValueFromQuery } from 'utils/overdrop';
import DailyModal from '../DailyModal';
import LevelUpModal from '../LevelUpModal';
import WelcomeModal from '../WelcomeModal';

const ModalWrapper: React.FC = () => {
    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const overdropUIState = useSelector((state: RootState) => getOverdropUIState(state));

    const [levelChanged, setLevelChanged] = useState<boolean>(false);
    const [dailyMultiplierChanged, setDailyMultiplierChanged] = useState<boolean>(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);

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

    useEffect(() => {
        if (userData && userMultipliers) {
            const levelItem = getCurrentLevelByPoints(userData.points);
            if (overdropUIState.currentLevel !== levelItem.level && levelItem.level !== 0) {
                setLevelChanged(true);
                setShowLevelUpModal(true);
                return;
            }
            if (
                overdropUIState.dailyMultiplier !==
                    getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY) &&
                getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY) !== 0
            ) {
                setDailyMultiplierChanged(true);
                setShowDailyMultiplierModal(true);
                return;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData, userMultipliers]);

    useEffect(() => {
        if (overdropUIState.welcomeModalFlag == false) {
            setShowWelcomeModal(true);
            dispatch(setOverdropState({ ...overdropUIState, welcomeModalFlag: true }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
        if (userData && userMultipliers) {
            const currentLevelItem = getCurrentLevelByPoints(userData?.points);
            dispatch(
                setOverdropState({
                    ...overdropUIState,
                    currentLevel: currentLevelItem.level,
                    dailyMultiplier: getMultiplierValueFromQuery(userMultipliers, MultiplierType.DAILY),
                })
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, userData, userMultipliers]);

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
