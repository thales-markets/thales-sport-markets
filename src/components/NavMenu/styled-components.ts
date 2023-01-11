import styled, { css, keyframes } from 'styled-components';
import { MAIN_COLORS } from 'constants/ui';
import { FlexDivColumnNative, FlexDivRow } from 'styles/common';

export const WrapperAnimation = keyframes`
    0% {
        visibility: none;
        right: -255px;
    }
    100% {
        visibility: visible;
        right: 0px;
        -webkit-box-shadow: ${MAIN_COLORS.SHADOWS.NAV_BAR};
        -moz-box-shadow: ${MAIN_COLORS.SHADOWS.NAV_BAR};
        box-shadow: ${MAIN_COLORS.SHADOWS.NAV_BAR};
        height: 100%;
    }
`;

export const WrapperAnimationClose = keyframes`
    0% {
        visibility: visible;
        right: 0px;
        -webkit-box-shadow: ${MAIN_COLORS.SHADOWS.NAV_BAR};
        -moz-box-shadow: ${MAIN_COLORS.SHADOWS.NAV_BAR};
        box-shadow: ${MAIN_COLORS.SHADOWS.NAV_BAR};
    }
    100% {
        visibility: none;
        right: -255px;
    }
`;

const animationOpen = css`
    animation: ${WrapperAnimation} 0.3s linear;
`;

const animationClose = css`
    animation: ${WrapperAnimationClose} 0.3s linear;
`;

export const Wrapper = styled.div<{ show?: boolean | null }>`
    display: flex;
    flex-direction: column;
    width: 255px;
    height: 100%;
    position: fixed;
    top: 0;
    ${(props) => (props?.show == true ? 'right: 0;' : '')}
    ${(props) => (props?.show == false || props?.show == null ? 'right: -255px;' : '')}
    ${(props) => props?.show === true && animationOpen};
    ${({ show }) => show === false && animationClose};
    background-color: ${(props) => props.theme.nav.background};
    justify-content: space-between;
    z-index: 3;
    ${(props) => (props?.show == true ? `-webkit-box-shadow: ${MAIN_COLORS.SHADOWS.NAV_BAR};` : '')};
    ${(props) => (props?.show == true ? `-moz-box-shadow: ${MAIN_COLORS.SHADOWS.NAV_BAR};` : '')};
    ${(props) => (props?.show == true ? `${MAIN_COLORS.SHADOWS.NAV_BAR};` : '')};
    padding: 20px 10px;
`;

export const ItemsContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: auto;
    margin-right: auto;
`;

export const LanguageLabel = styled.label`
    font-family: 'Nunito' !important;
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 20px;
    text-transform: uppercase;
    margin: 20px auto 5px auto;
    color: ${(props) => props.theme.textColor.quaternary};
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
    ${(props) => (props.active ? `color: ${props.theme.nav.text.primary};` : '')}
    :hover {
        i {
            color: ${(props) => props.theme.nav.text.primary}!important;
        }
        color: ${(props) => props.theme.nav.text.primary} !important;
    }
`;

export const NavLabel = styled.span<{ active?: boolean }>`
    font-size: 16px;
    font-weight: ${(props) => (props?.active ? '600' : '400')};
    line-height: 120%;
    text-transform: uppercase;
`;

export const NavIcon = styled.i<{ active?: boolean }>`
    font-size: 25px;
    margin-right: 10px;
    color: ${(props) => (props?.active ? `${props.theme.nav.text.primary}` : `${props.theme.nav.text.secondary}`)};
`;

export const ButtonsContainer = styled.div`
    display: flex;
    flex-direction: row;
`;

export const Button = styled.button`
    width: 49%;
    border: 1.5px solid #5f6180;
    padding: 6px 0px;
    color: ${(props) => props.theme.nav.text.secondary};
    background: transparent;
    cursor: pointer;
`;

export const FooterContainer = styled(FlexDivRow)`
    align-items: center;
    justify-content: center;
`;

export const Network = styled(FlexDivRow)`
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
`;

export const NetworkIcon = styled.i`
    font-size: 20px;
    color: ${(props) => props.theme.nav.text.primary};
    margin-right: 5px;
`;

export const NetworkName = styled.span`
    font-size: 12px;
    color: ${(props) => props.theme.nav.text.secondary};
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

export const WalletAddress = styled.span`
    font-weight: 600;
    font-size: 10px;
    line-height: 120%;
`;

export const WalletIcon = styled.i.attrs({ className: 'icon icon--wallet' })`
    color: white;
    font-size: 15px;
    margin-right: 6px;
`;

export const WalletAddressContainer = styled(FlexDivRow)`
    align-items: center;
    justify-content: center;
    cursor: pointer;
    :hover {
        i {
            color: ${(props) => props.theme.nav.text.primary} !important;
        }
        color: ${(props) => props.theme.nav.text.primary} !important;
    }
`;
