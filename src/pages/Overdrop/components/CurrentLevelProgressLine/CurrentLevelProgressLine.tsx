import { OVERDROP_LEVELS } from 'constants/overdrop';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { OverdropUserData } from 'types/overdrop';
import { OverdropLevel } from 'types/ui';
import { getCurrentLevelByPoints, getNextLevelItemByPoints, getProgressLevel } from 'utils/overdrop';
import ProgressLine from '../ProgressLine';

type CurrentLevelProgressLineProps = {
    hideLevelLabel?: boolean;
    showNumbersOnly?: boolean;
    progressUpdateXP?: number;
    height?: string;
};

const CurrentLevelProgressLine: React.FC<CurrentLevelProgressLineProps> = ({
    hideLevelLabel,
    progressUpdateXP,
    height,
}) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const userDataQuery = useUserDataQuery(walletAddress, {
        enabled: isAppReady && isWalletConnected,
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
        if (userData) {
            return getNextLevelItemByPoints(userData?.points);
        }

        return OVERDROP_LEVELS[1];
    }, [userData]);

    const progress =
        levelItem?.level == OVERDROP_LEVELS.length - 1
            ? 100
            : userData && nextLevelItem
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
            currentLevelMinimum={levelItem.minimumPoints}
            nextLevelMinimumPoints={nextLevelItem?.minimumPoints || OVERDROP_LEVELS[1].minimumPoints}
            level={levelItem?.level}
            hideLevelLabel={hideLevelLabel}
            height={height}
        />
    );
};

export default CurrentLevelProgressLine;
