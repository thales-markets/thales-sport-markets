import OverdropButtonBackground from 'assets/images/overdrop/overdrop-button-background.webp';
import overdrop from 'assets/images/overdrop/overdrop-nav.webp';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';

export const Container = styled(FlexDivRowCentered)`
    width: 100%;
    gap: 10px;
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
    width: 100%;
    max-width: 278px;
    justify-content: center;
    padding-right: 15px;
    z-index: 1;
`;

export const MiddleContainer = styled(FlexDivRowCentered)`
    width: 100%;
    z-index: 1;
    max-width: 821px;
`;

export const RightContainer = styled(FlexDivRowCentered)`
    position: relative;
    width: 100%;
    max-width: 360px;
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

export const MenuIcon = styled.i`
    cursor: pointer;
    font-size: 26px;
    color: ${(props) => props.theme.christmasTheme.textColor.primary};
    /* filter: invert(39%) sepia(9%) saturate(1318%) hue-rotate(199deg) brightness(71%) contrast(88%); */
`;

export const OverdropIcon = styled.img.attrs({ src: overdrop })`
    height: 75px;
    cursor: pointer;
    margin-right: 20px;
    @media (max-width: 576px) {
        height: 70px;
        margin-right: 0;
    }
`;

export const WrapperMobile = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    z-index: 1;
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
    display: flex;
    position: relative;
    margin-right: 0px !important;
    @media (max-width: 950px) {
        width: 50%;
        display: flex;
        justify-content: start;
        position: absolute;
        left: 12px;
    }
`;

export const LogoContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
`;

export const IconWrapper = styled.div`
    border-radius: 30px;
    width: 28px;
    height: 28px;
    position: absolute;
    top: -15px;
`;

export const SearchIcon = styled.i`
    font-size: 25px;
    cursor: pointer;
    position: absolute;
    top: 0px;
    left: 0px;
    &:before {
        font-family: OvertimeIconsV2 !important;
        content: '\\00E5';
        color: ${(props) => props.theme.textColor.secondary};
    }
`;

export const SearchContainer = styled.div`
    background: ${(props) => props.theme.background.secondary};
    height: 100%;
    text-align: center;
    @media (max-width: 950px) {
        margin: 0 5px;
        border-radius: 20px;
    }
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

export const BlockedGamesNotificationCount = styled(NotificationCount)`
    left: -5px;
    background-color: ${(props) => props.theme.error.textColor.primary};
    box-shadow: ${(props) => props.theme.shadow.errorNotification};
`;

export const Count = styled.span`
    color: ${(props) => props.theme.button.textColor.primary};
    font-weight: 600;
    font-size: 12px;
`;

export const MobileButtonWrapper = styled.div`
    width: 100%;
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(calc(25% - 5px), 1fr));
    gap: 6px;
    min-height: 32px;
    @media (max-width: 767px) {
        min-height: 28px;
    }
    button {
        width: 100%;
    }
`;

export const OverdropButtonContainer = styled(FlexDiv)`
    position: relative;
    background-image: url(${OverdropButtonBackground});
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 160px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: ${(props) => props.theme.overdrop.textColor.primary};
    @media (max-width: 950px) {
        font-size: 8px;
        width: 140px;
        height: 30px;
        margin-left: 20px;
    }

    @media (max-width: 767px) {
        font-size: 8px;
        width: 120px;
        height: 30px;
    }
`;

export const SmallBadgeImage = styled.img`
    position: absolute;
    left: -25px;
    width: 50px;
    height: 50px;
    @media (max-width: 767px) {
        width: 30px;
        height: 30px;
        left: -10px;
    }
`;

export const SettingsContainer = styled(FlexDivRowCentered)`
    padding-right: 5px;
    position: relative;
    margin: 0 10px;
    cursor: pointer;
`;

export const HeaderIcon = styled.i<{
    iconSize?: number;
    iconColor?: string;
}>`
    margin-right: 5px;
    font-size: ${(props) => (props.iconSize ? props.iconSize : '20')}px;
    color: ${(props) => (props.iconColor ? props.iconColor : props.theme.christmasTheme.textColor.primary)};
`;

export const HeaderLabel = styled.span`
    font-weight: 600;
    font-size: 12px;
    color: ${(props) => props.theme.christmasTheme.textColor.primary};
    text-transform: uppercase;
`;

export const DropdownContainer = styled.div`
    position: absolute;
    width: 180px;
    top: 28px;
    left: 0;
    z-index: 1000;
`;

export const DropDown = styled(FlexDivColumn)`
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    background: ${(props) => props.theme.background.secondary};
    color: white;
    border-radius: 5px;
    position: absolute;
    margin-top: 2px;
    padding: 4px;
    width: 100%;
`;

export const DropDownItem = styled(FlexDiv)`
    padding: 7px 10px 9px 10px;
    cursor: pointer;
    &:hover {
        background: ${(props) => props.theme.background.tertiary};
        border-radius: 5px;
    }
`;

export const Label = styled.div`
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    color: white;
    display: block;
    text-transform: capitalize;
`;
