import burger from 'assets/images/burger.svg';
import styled from 'styled-components';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Container = styled(FlexDivRowCentered)`
    width: 100%;
    margin-top: 10px;
    @media (max-width: 767px) {
        flex-direction: column;
    }
    @keyframes pulsing {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.2);
            @media (max-width: 767px) {
                transform: scale(1.1);
            }

            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;

export const LeftContainer = styled(FlexDivRowCentered)`
    width: 263px;
`;

export const MiddleContainer = styled(FlexDivRowCentered)`
    width: 806px;
    margin: 0 25px;
`;

export const RightContainer = styled(FlexDivRowCentered)`
    width: 360px;
    @media (max-width: 767px) {
        flex-direction: column;
    }
    > div {
        :not(:last-child) {
            margin-right: 20px;
            @media (max-width: 767px) {
                margin-right: 0px;
                margin-bottom: 10px;
            }
        }
    }
`;

export const MenuIcon = styled.img.attrs({ src: burger })`
    cursor: pointer;
    height: 25px;
    width: 35px;
    filter: invert(39%) sepia(9%) saturate(1318%) hue-rotate(199deg) brightness(71%) contrast(88%);
`;

export const WrapperMobile = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: center;
`;

export const SearchIconContainer = styled.div`
    width: 50%;
    display: flex;
    justify-content: end;
    position: absolute;
    right: 12px;
`;

export const MenuIconContainer = styled.div`
    width: 50%;
    display: flex;
    justify-content: start;
    position: absolute;
    left: 12px;
    margin-top: 10px;
`;

export const LogoContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;

export const IconWrapper = styled.div`
    border-radius: 30px;
    background: ${(props) => props.theme.background.tertiary};
    width: 32px;
    height: 32px;
    position: absolute;
    top: -10px;
`;

export const SearchIcon = styled.i`
    font-size: 40px;
    cursor: pointer;
    margin-bottom: 3px;
    position: absolute;
    top: -7px;
    left: -6px;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\0042';
        color: ${(props) => props.theme.background.primary};
    }
`;

export const SearchContainer = styled.div`
    background: ${(props) => props.theme.background.secondary};
    height: 100%;
    text-align: center;
    margin-right: 2px;
`;

export const NotificationCount = styled.div`
    position: absolute;
    border-radius: 50%;
    bottom: -8px;
    left: 24px;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    height: 16px;
    width: 16px;
    background-color: ${(props) => props.theme.background.quaternary};
    box-shadow: ${(props) => props.theme.shadow.notification};
`;

export const Count = styled.span`
    color: ${(props) => props.theme.button.textColor.primary};
    font-weight: 800;
    font-size: 12px;
`;

export const MobileButtonWrapper = styled(FlexDivRowCentered)`
    width: 100%;
    margin-top: 10px;
    gap: 20px;
    min-height: 32px;
    @media (max-width: 767px) {
        min-height: 28px;
    }
`;

export const ReferAndEarn = styled.button`
    color: ${(props) => props.theme.button.textColor.secondary};
    cursor: pointer;
    font-weight: bold;
    text-transform: uppercase;
    height: 30px;
    width: 140px;
    border-radius: 20px;
    font-size: 13px;
    background: linear-gradient(89.94deg, #8f32d8 1.79%, #d70c61 99.65%);
    border: none;
`;

export const HeaderIcon = styled.i<{
    iconSize?: number;
    iconColor?: string;
}>`
    margin-right: 5px;
    font-size: ${(props) => (props.iconSize ? props.iconSize : '20')}px;
    color: ${(props) => (props.iconColor ? props.iconColor : props.theme.textColor.secondary)};
`;

export const HeaderLabel = styled.span`
    font-weight: 600;
    font-size: 12px;
    color: ${(props) => props.theme.textColor.secondary};
    text-transform: uppercase;
`;