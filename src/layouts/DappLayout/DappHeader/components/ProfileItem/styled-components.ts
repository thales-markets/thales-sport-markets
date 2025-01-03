import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

export const ProfileContainer = styled(FlexDivRow)`
    align-items: center;
    cursor: pointer;
    margin-right: 5px;
`;
export const ProfileLabel = styled.span`
    font-weight: 600;
    font-size: 12px;
    color: ${(props) => props.theme.christmasTheme.textColor.primary};
    text-transform: uppercase;
`;

export const ProfileIconContainer = styled.div<{ marginRight?: string }>`
    display: flex;
    align-items: center;
    position: relative;
    margin-right: ${(props) => props.marginRight || '5px'};
`;

export const ProfileIcon = styled.i.attrs({ className: 'icon icon--profile2' })<{
    avatarSize?: number;
    iconColor?: string;
}>`
    font-size: ${(props) => (props.avatarSize ? props.avatarSize : '20')}px;
    font-weight: 400;
    color: ${(props) => (props.iconColor ? props.iconColor : props.theme.christmasTheme.textColor.primary)};
`;

export const NotificationCount = styled.div`
    border-radius: 50%;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    height: 18px;
    width: 18px;
    background-color: ${(props) => props.theme.background.quaternary};
    box-shadow: ${(props) => props.theme.shadow.notification};
    margin-right: 5px;
`;

export const Count = styled.span`
    color: ${(props) => props.theme.button.textColor.primary};
    font-weight: 600;
    font-size: 13px;
`;
