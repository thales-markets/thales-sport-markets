import { MAIN_COLORS } from 'constants/ui';
import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

export const ProfileContainer = styled(FlexDivRow)`
    align-items: center;
    cursor: pointer;
`;
export const ProfileLabel = styled.span`
    font-weight: 600;
    font-size: 12px;
    color: ${MAIN_COLORS.TEXT.WHITE};
    text-transform: uppercase;
    margin-right: 15px;
`;

export const ProfileIconContainer = styled.div`
    position: relative;
    margin-right: 5px;
`;

export const ProfileIcon = styled.i.attrs({ className: 'icon icon--profile' })<{
    avatarSize?: number;
    iconColor?: string;
}>`
    font-size: ${(props) => (props.avatarSize ? props.avatarSize : '20')}px;
    color: ${(props) => (props.iconColor ? props.iconColor : MAIN_COLORS.TEXT.DARK_GRAY)};
`;

export const NotificationCount = styled.div`
    position: absolute;
    border-radius: 50%;
    bottom: -5px;
    left: -5px;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    height: 14px;
    width: 14px;
    background-color: ${MAIN_COLORS.BACKGROUNDS.BLUE};
    box-shadow: ${MAIN_COLORS.SHADOWS.NOTIFICATION};
`;

export const Count = styled.span`
    color: ${MAIN_COLORS.DARK_GRAY};
    font-weight: 800;
    font-size: 10px;
`;

export const TeamImage = styled.img<{ avatarSize?: number }>`
    width: ${(props) => (props.avatarSize ? props.avatarSize : '20')}px;
    height: ${(props) => (props.avatarSize ? props.avatarSize : '20')}px;
    border-radius: 50%;
`;
