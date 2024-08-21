import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import useClaimablePositionCountV2Query from 'queries/markets/useClaimablePositionCountV2Query';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { buildHref } from 'utils/routes';
import {
    Badge,
    Count,
    NotificationCount,
    ProfileContainer,
    ProfileIconContainer,
    ProfileLabel,
} from './styled-components';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import { OverdropUserData } from 'types/overdrop';
import { OverdropLevel } from 'types/ui';
import { getCurrentLevelByPoints } from 'utils/overdrop';
import { getIsAppReady } from 'redux/modules/app';

type ProfileItemProperties = {
    labelHidden?: boolean;
    isNav?: boolean;
};

const ProfileItem: React.FC<ProfileItemProperties> = ({ labelHidden, isNav }) => {
    const { t } = useTranslation();
    return (
        <SPAAnchor style={{ display: 'flex' }} href={buildHref(ROUTES.Profile)}>
            <ProfileContainer>
                <ProfileIconWidget isNav={isNav} />
                {!labelHidden && <ProfileLabel>{t('markets.nav-menu.items.profile')}</ProfileLabel>}
            </ProfileContainer>
        </SPAAnchor>
    );
};

export const ProfileIconWidget: React.FC<ProfileItemProperties> = ({ isNav }) => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const claimablePositionsCountQuery = useClaimablePositionCountV2Query(walletAddress, networkId, {
        enabled: isWalletConnected,
    });
    const claimablePositionCount =
        claimablePositionsCountQuery.isSuccess && claimablePositionsCountQuery.data
            ? claimablePositionsCountQuery.data
            : null;

    const notificationsCount = claimablePositionCount || 0;

    const userDataQuery = useUserDataQuery(walletAddress, {
        enabled: !!isAppReady,
    });

    const userData: OverdropUserData | undefined = useMemo(() => {
        if (userDataQuery?.isSuccess && userDataQuery?.data) {
            return userDataQuery.data;
        }
        return;
    }, [userDataQuery.data, userDataQuery?.isSuccess]);

    const levelItem: OverdropLevel | undefined = useMemo(() => {
        const levelItem = getCurrentLevelByPoints(userData?.points ?? 0);
        return levelItem;
    }, [userData]);

    return (
        <>
            <ProfileIconContainer>
                {!!notificationsCount && (
                    <NotificationCount>
                        <Count>{notificationsCount}</Count>
                    </NotificationCount>
                )}
                <Badge isNav={isNav} src={levelItem.largeBadge} />
            </ProfileIconContainer>
        </>
    );
};

export default ProfileItem;
