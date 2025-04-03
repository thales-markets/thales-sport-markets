import usePositionCountV2Query from 'queries/markets/usePositionCountV2Query';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { truncateAddress } from 'thales-utils';
import { RootState } from 'types/redux';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';
import {
    ClaimableTicketsNotificationCount,
    Count,
    OpenTicketsNotificationCount,
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
    margin?: string;
};

const ProfileItem: React.FC<ProfileItemProperties> = ({ color }) => {
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const { address } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    return (
        <ProfileContainer>
            <ProfileLabel color={color}>{truncateAddress(walletAddress, 6, 4)}</ProfileLabel>
        </ProfileContainer>
    );
};

export const ProfileIconWidget: React.FC<ProfileItemProperties> = ({
    avatarSize,
    color,
    marginRight,
    top,
    left,
    margin,
}) => {
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const positionsCountQuery = usePositionCountV2Query(walletAddress, { networkId, client }, { enabled: isConnected });

    const claimablePositionCount = useMemo(
        () => (positionsCountQuery.isSuccess && positionsCountQuery.data ? positionsCountQuery.data.claimable : 0),
        [positionsCountQuery.isSuccess, positionsCountQuery.data]
    );
    const openPositionCount = useMemo(
        () => (positionsCountQuery.isSuccess && positionsCountQuery.data ? positionsCountQuery.data.open : 0),
        [positionsCountQuery.isSuccess, positionsCountQuery.data]
    );

    return (
        <ProfileIconContainer marginRight={marginRight} margin={margin}>
            {!!claimablePositionCount && (
                <ClaimableTicketsNotificationCount top={top} left={left}>
                    <Count>{claimablePositionCount}</Count>
                </ClaimableTicketsNotificationCount>
            )}
            {!!openPositionCount && (
                <OpenTicketsNotificationCount>
                    <Count>{openPositionCount}</Count>
                </OpenTicketsNotificationCount>
            )}
            <ProfileIcon avatarSize={avatarSize} iconColor={color} />
        </ProfileIconContainer>
    );
};

export default ProfileItem;
