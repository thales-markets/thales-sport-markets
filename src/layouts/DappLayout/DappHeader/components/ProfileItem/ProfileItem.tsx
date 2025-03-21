import useClaimablePositionCountV2Query from 'queries/markets/useClaimablePositionCountV2Query';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { truncateAddress } from 'thales-utils';
import { RootState } from 'types/redux';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';
import {
    Count,
    NotificationCount,
    ProfileContainer,
    ProfileIcon,
    ProfileIconContainer,
    ProfileLabel,
} from './styled-components';

type ProfileItemProperties = {
    labelHidden?: boolean;
    avatarSize?: number;
    color?: string;
    marginRight?: string;
    top?: string;
    left?: string;
};

const ProfileItem: React.FC<ProfileItemProperties> = ({ labelHidden, avatarSize, top, left, color }) => {
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const { address } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    return (
        <ProfileContainer>
            <ProfileIconWidget top={top} left={left} avatarSize={avatarSize} color={color} />
            {!labelHidden && <ProfileLabel color={color}>{truncateAddress(walletAddress, 6, 4)}</ProfileLabel>}
        </ProfileContainer>
    );
};

export const ProfileIconWidget: React.FC<ProfileItemProperties> = ({ avatarSize, color, marginRight, top, left }) => {
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const claimablePositionsCountQuery = useClaimablePositionCountV2Query(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );
    const claimablePositionCount =
        claimablePositionsCountQuery.isSuccess && claimablePositionsCountQuery.data
            ? claimablePositionsCountQuery.data
            : null;

    const notificationsCount = claimablePositionCount || 0;

    return (
        <>
            <ProfileIconContainer marginRight={marginRight}>
                {!!notificationsCount && (
                    <NotificationCount top={top} left={left}>
                        <Count>{notificationsCount}</Count>
                    </NotificationCount>
                )}
                <ProfileIcon avatarSize={avatarSize} iconColor={color} />
            </ProfileIconContainer>
        </>
    );
};

export default ProfileItem;
