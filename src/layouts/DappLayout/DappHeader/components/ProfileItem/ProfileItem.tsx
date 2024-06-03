import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { countries } from 'constants/worldCup';
import useFavoriteTeamDataQuery from 'queries/favoriteTeam/useFavoriteTeamDataQuery';
import useClaimablePositionCountV2Query from 'queries/markets/useClaimablePositionCountV2Query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { buildHref } from 'utils/routes';
import {
    Count,
    NotificationCount,
    ProfileContainer,
    ProfileIcon,
    ProfileIconContainer,
    ProfileLabel,
    TeamImage,
} from './styled-components';

type ProfileItemProperties = {
    labelHidden?: boolean;
    avatarSize?: number;
    iconColor?: string;
};

const ProfileItem: React.FC<ProfileItemProperties> = ({ labelHidden, avatarSize }) => {
    const { t } = useTranslation();
    return (
        <SPAAnchor href={buildHref(ROUTES.Profile)}>
            <ProfileContainer>
                <ProfileIconWidget avatarSize={avatarSize} />
                {!labelHidden && <ProfileLabel>{t('markets.nav-menu.items.profile')}</ProfileLabel>}
            </ProfileContainer>
        </SPAAnchor>
    );
};

export const ProfileIconWidget: React.FC<ProfileItemProperties> = ({ avatarSize, iconColor }) => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const favoriteTeamDataQuery = useFavoriteTeamDataQuery(walletAddress, networkId);
    const favoriteTeamData =
        favoriteTeamDataQuery.isSuccess && favoriteTeamDataQuery.data ? favoriteTeamDataQuery.data : null;

    const claimablePositionsCountQuery = useClaimablePositionCountV2Query(walletAddress, networkId, {
        enabled: isWalletConnected,
    });
    const claimablePositionCount =
        claimablePositionsCountQuery.isSuccess && claimablePositionsCountQuery.data
            ? claimablePositionsCountQuery.data
            : null;

    const notificationsCount = claimablePositionCount || 0;

    return (
        <>
            <ProfileIconContainer>
                {!!notificationsCount && (
                    <NotificationCount>
                        <Count>{notificationsCount}</Count>
                    </NotificationCount>
                )}
                {favoriteTeamData?.favoriteTeam ? (
                    <TeamImage
                        avatarSize={avatarSize}
                        src={`https://thales-protocol.s3.eu-north-1.amazonaws.com/zebro_${countries[
                            favoriteTeamData?.favoriteTeam - 1
                        ]
                            .toLocaleLowerCase()
                            .split(' ')
                            .join('_')}.png`}
                    />
                ) : (
                    <ProfileIcon avatarSize={avatarSize} iconColor={iconColor} />
                )}
            </ProfileIconContainer>
        </>
    );
};

export default ProfileItem;
