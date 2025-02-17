import styled, { css, keyframes } from 'styled-components';
import { FlexDivColumnNative, FlexDivRow } from 'styles/common';

const WrapperAnimation = (props: any) => keyframes`
    0% {
        visibility: none;
        right: -255px;
    }
    100% {
        visibility: visible;
        right: 0px;
        -webkit-box-shadow: ${props.theme.shadow.navBar};
        -moz-box-shadow: ${props.theme.shadow.navBar};
        box-shadow: ${props.theme.shadow.navBar};
        height: 100%;
    }
`;

const WrapperAnimationClose = (props: any) => keyframes`
    0% {
        visibility: visible;
        right: 0px;
        -webkit-box-shadow: ${props.theme.shadow.navBar};
        -moz-box-shadow: ${props.theme.shadow.navBar};
        box-shadow: ${props.theme.shadow.navBar};
    }
    100% {
        visibility: none;
        right: -255px;
    }
`;

const animationOpen = css`
    animation: ${(props) => WrapperAnimation(props)} 0.3s linear;
`;

const animationClose = css`
    animation: ${(props) => WrapperAnimationClose(props)} 0.3s linear;
`;

export const Wrapper = styled.div<{ show?: boolean | null }>`
    display: flex;
    flex-direction: column;
    width: 255px;
    height: 100%;
    position: fixed;
    top: 0;
    ${(props) => (props.show == true ? 'right: 0;' : '')}
    ${(props) => (props.show == false || props.show == null ? 'right: -255px;' : '')}
    ${(props) => props.show === true && animationOpen};
    ${({ show }) => show === false && animationClose};
    background-color: ${(props) => props.theme.background.secondary};
    justify-content: space-between;
    z-index: 3000;
    ${(props) => (props.show == true ? `-webkit-box-shadow: ${props.theme.shadow.navBar};` : '')}
    ${(props) => (props.show == true ? `-moz-box-shadow: ${props.theme.shadow.navBar};` : '')}
    padding: 20px 10px;
`;

export const ItemsContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: auto;
    margin-right: auto;
`;

export const Separator = styled.div`
    height: 3px;
    margin-top: 20px;
    margin-bottom: 5px;
    background: ${(props) => props.theme.background.tertiary};
    border-radius: 5px;
`;

export const ItemContainer = styled.div<{ active?: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 15px;
    cursor: pointer;
    padding: 0px 5px;
    ${(props) => (props.active ? `color: ${props.theme.textColor.quaternary};` : '')}
    :hover {
        i {
            color: ${(props) =>
                props.theme.background.quaternary}!important; // TODO: March Madness fix, revert background to textColor
        }
        color: ${(props) =>
            props.theme.background.quaternary}!important; // TODO: March Madness fix, revert background to textColor
    }
`;

export const NavLabel = styled.span<{ active?: boolean }>`
    font-size: 16px;
    font-weight: ${(props) => (props.active ? '600' : '400')};
    line-height: 120%;
    text-transform: uppercase;
`;

export const NavIcon = styled.i<{ active?: boolean }>`
    font-size: 25px;
    margin-right: 10px;
    color: ${(props) => (props.active ? `${props.theme.textColor.quaternary}` : `${props.theme.textColor.primary}`)};
`;

export const FooterContainer = styled(FlexDivColumnNative)`
    align-items: center;
    justify-content: flex-end;
`;

export const Network = styled(FlexDivRow)`
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
`;

export const NetworkIcon = styled.i`
    font-size: 20px;
    color: ${(props) => props.theme.textColor.quaternary};
    margin-right: 5px;
`;

export const NetworkName = styled.span`
    font-size: 12px;
    color: ${(props) => props.theme.textColor.primary};
    font-weight: 600;
`;

export const HeaderContainer = styled(FlexDivColumnNative)`
    justify-content: center;
    width: 100%;
`;

export const CloseIcon = styled.i.attrs({ className: 'icon icon--close' })`
    color: white;
    font-size: 20px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
`;

export const NotificationCount = styled.div`
    border-radius: 50%;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    height: 18px;
    width: 18px;
    background-color: ${(props) => props.theme.error.textColor.primary};
    box-shadow: ${(props) => props.theme.shadow.errorNotification};
    margin-right: 5px;
`;

export const Count = styled.span`
    color: ${(props) => props.theme.button.textColor.primary};
    font-weight: 600;
    font-size: 13px;
`;
