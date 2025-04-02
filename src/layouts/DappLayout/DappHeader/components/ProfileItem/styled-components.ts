import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

export const ProfileContainer = styled(FlexDivRow)`
    position: relative;
    align-items: center;
    cursor: pointer;
    margin-right: 5px;
`;
export const ProfileLabel = styled.span<{ color?: string }>`
    font-weight: 600;
    font-size: 12px;
    width: 82px;
    color: ${(props) => (props.color ? props.color : props.theme.textColor.secondary)};
    text-transform: lowercase;
    white-space: pre;
`;

export const ProfileIconContainer = styled.div<{ marginRight?: string; margin?: string }>`
    display: flex;
    align-items: center;
    position: relative;
    margin-right: ${(props) => props.marginRight || '5px'};
    margin: ${(props) => (props.margin ? props.margin : '')};
`;

export const ProfileIcon = styled.i.attrs({ className: 'icon icon--profile2' })<{
    avatarSize?: number;
    iconColor?: string;
}>`
    font-size: ${(props) => (props.avatarSize ? props.avatarSize : '20')}px;
    font-weight: 400;
    color: ${(props) => (props.iconColor ? props.iconColor : props.theme.textColor.secondary)};
    cursor: pointer;
`;

export const NotificationCount = styled.div<{ top?: string; left?: string }>`
    position: absolute;
    top: ${(props) => (props.top ? props.top : '-10px')};
    left: ${(props) => (props.left ? props.left : '-10px')};
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
