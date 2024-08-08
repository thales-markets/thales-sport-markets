import { OVERDROP_LEVELS } from 'constants/overdrop';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { OverdropUserData } from 'types/overdrop';
import { OverdropLevel } from 'types/ui';
import { getCurrentLevelByPoints, getNextLevelItemByPoints, getProgressLevel } from 'utils/overdrop';
import ProgressLine from '../ProgressLine';

const CurrentLevelProgressLine: React.FC = () => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const userDataQuery = useUserDataQuery(walletAddress, {
        enabled: !!isAppReady,
    });

    const userData: OverdropUserData | undefined = useMemo(() => {
        if (userDataQuery?.isSuccess && userDataQuery?.data) {
            return userDataQuery.data;
        }
        return;
    }, [userDataQuery.data, userDataQuery?.isSuccess]);

    const levelItem: OverdropLevel = useMemo(() => {
        if (userData) {
            const levelItem = getCurrentLevelByPoints(userData.points);
            return levelItem;
        }
        return OVERDROP_LEVELS[0];
    }, [userData]);

    const nextLevelItem: OverdropLevel = useMemo(() => {
        return getNextLevelItemByPoints(userData?.points);
    }, [userData]);

    return (
        <ProgressLine
            progress={
                userData && nextLevelItem
                    ? getProgressLevel(userData.points, levelItem.minimumPoints, nextLevelItem.minimumPoints)
                    : 0
            }
            currentPoints={userData?.points || 0}
            nextLevelMinimumPoints={nextLevelItem?.minimumPoints || 0}
            level={levelItem?.level}
        />
    );
};

export default CurrentLevelProgressLine;
