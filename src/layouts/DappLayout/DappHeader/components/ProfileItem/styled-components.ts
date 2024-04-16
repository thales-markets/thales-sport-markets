import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

export const ProfileContainer = styled(FlexDivRow)`
    align-items: center;
    cursor: pointer;
`;
export const ProfileLabel = styled.span`
    font-weight: 600;
    font-size: 12px;
    color: ${(props) => props.theme.textColor.primary};
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
    color: ${(props) => (props.iconColor ? props.iconColor : props.theme.textColor.secondary)};
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
    background-color: ${(props) => props.theme.background.quaternary};
    box-shadow: ${(props) => props.theme.shadow.notification};
`;

export const Count = styled.span`
    color: ${(props) => props.theme.button.textColor.primary};
    font-weight: 800;
    font-size: 10px;
`;

export const TeamImage = styled.img<{ avatarSize?: number }>`
    width: ${(props) => (props.avatarSize ? props.avatarSize : '20')}px;
    height: ${(props) => (props.avatarSize ? props.avatarSize : '20')}px;
    border-radius: 50%;
`;
