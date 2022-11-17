import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import useClaimablePositionCountQuery from 'queries/markets/useClaimablePositionCountQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { buildHref } from 'utils/routes';
import {
    ProfileContainer,
    ProfileIconContainer,
    ProfileIcon,
    NotificationCount,
    ProfileLabel,
    Count,
} from './styled-components';

const ProfileItem: React.FC = () => {
    const { t } = useTranslation();
    return (
        <SPAAnchor href={buildHref(ROUTES.Profile)}>
            <ProfileContainer data-matomo-category="dapp-header" data-matomo-action="profile">
                <ProfileIconWidget />
                <ProfileLabel>{t('markets.nav-menu.items.profile')}</ProfileLabel>
            </ProfileContainer>
        </SPAAnchor>
    );
};

export const ProfileIconWidget: React.FC = () => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const claimablePositionsCountQuery = useClaimablePositionCountQuery(walletAddress, networkId, {
        enabled: isWalletConnected,
    });

    const claimablePositionCount =
        claimablePositionsCountQuery.isSuccess && claimablePositionsCountQuery.data
            ? claimablePositionsCountQuery.data
            : null;

    return (
        <>
            <ProfileIconContainer>
                <ProfileIcon />
                {claimablePositionCount && (
                    <NotificationCount>
                        <Count>{claimablePositionCount}</Count>
                    </NotificationCount>
                )}
            </ProfileIconContainer>
        </>
    );
};

export default ProfileItem;
