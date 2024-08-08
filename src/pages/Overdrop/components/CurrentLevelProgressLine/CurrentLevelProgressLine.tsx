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

type CurrentLevelProgressLineProps = {
    hideLevelLabel?: boolean;
    showNumbersOnly?: boolean;
    progressUpdateXP?: number;
};

const CurrentLevelProgressLine: React.FC<CurrentLevelProgressLineProps> = ({
    hideLevelLabel,
    showNumbersOnly,
    progressUpdateXP,
}) => {
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

    const progress =
        userData && nextLevelItem
            ? getProgressLevel(userData.points, levelItem.minimumPoints, nextLevelItem.minimumPoints)
            : 0;

    const progressUpdate =
        userData && nextLevelItem
            ? getProgressLevel(
                  userData.points + (progressUpdateXP || 0),
                  levelItem.minimumPoints,
                  nextLevelItem.minimumPoints
              )
            : 0;

    return (
        <ProgressLine
            progressUpdate={progressUpdate - progress}
            progress={progress}
            currentPoints={userData?.points || 0}
            nextLevelMinimumPoints={nextLevelItem?.minimumPoints || 0}
            level={levelItem?.level}
            hideLevelLabel={hideLevelLabel}
            showNumbersOnly={showNumbersOnly}
        />
    );
};

export default CurrentLevelProgressLine;
