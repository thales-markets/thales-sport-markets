import styled, { css, keyframes } from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnNative, FlexDivRow, FlexDivRowCentered } from 'styles/common';

const WrapperAnimation = (props: any) => keyframes`
    0% {
        visibility: none;
        top: -70vh;
    }
    100% {
        visibility: visible;
        right: 0px;
        -webkit-box-shadow: ${props.theme.shadow.navBar};
        -moz-box-shadow: ${props.theme.shadow.navBar};
        box-shadow: ${props.theme.shadow.navBar};
        width: 100%;
    }
`;

const WrapperAnimationClose = (props: any) => keyframes`
    0% {
        visibility: visible;
        top: 0vh;
        -webkit-box-shadow: ${props.theme.shadow.navBar};
        -moz-box-shadow: ${props.theme.shadow.navBar};
        box-shadow: ${props.theme.shadow.navBar};
    }
    100% {
        visibility: none;
        top: -70vh;
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
    width: 100%;
    max-height: 100vh;
    overflow-y: auto;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    ${(props) => (props.show == true ? 'top: 0;' : '')}
    ${(props) => (props.show == false || props.show == null ? 'top: -700px;' : '')}
    ${(props) => props.show === true && animationOpen};
    ${({ show }) => show === false && animationClose};
    background-color: ${(props) => props.theme.background.secondary};
    justify-content: space-between;
    z-index: 200;
    ${(props) => (props.show == true ? `-webkit-box-shadow: ${props.theme.shadow.navBar};` : '')}
    ${(props) => (props.show == true ? `-moz-box-shadow: ${props.theme.shadow.navBar};` : '')}
    padding: 5px 10px 40px 10px;
    border-radius: 0px 0px 25px 25px;
`;

export const ItemsContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: auto;
    margin-right: auto;
`;

export const ItemContainer = styled.div<{ active?: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 15px;
    cursor: pointer;
    padding: 0px 5px;
    ${(props) => (props.active ? `color: ${props.theme.link.textColor.primary};` : '')}
    :hover {
        i {
            color: ${(props) => props.theme.textColor.quaternary}!important;
        }
        color: ${(props) => props.theme.textColor.quaternary} !important;
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
    font-weight: 400;
    color: ${(props) => (props.active ? `${props.theme.link.textColor.primary}` : `${props.theme.textColor.primary}`)};
`;

export const FooterContainer = styled(FlexDivColumn)`
    align-items: center;
    justify-content: center;
    position: relative;
`;

export const NetworkWrapper = styled(FlexDivRowCentered)`
    margin: 0 auto;
`;

export const Network = styled(FlexDivRow)`
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
    margin-right: 10px;
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

export const CloseIcon = styled.i.attrs({ className: 'icon icon--arrow-up' })`
    color: white;
    font-size: 20px;
    position: absolute;
    bottom: -30px;
    right: calc(50% - 10px);
    cursor: pointer;
`;

export const WalletWrapper = styled(FlexDiv)`
    width: max-content;
    align-self: center;
    justify-self: center;
    margin-top: 15px;
`;

export const ButtonWrapper = styled(FlexDiv)`
    align-items: center;
    justify-content: center;
    margin: 20px 0px;
`;
