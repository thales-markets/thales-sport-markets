import burger from 'assets/images/burger.svg';
import OverdropButtonBackground from 'assets/images/overdrop/overdrop-button-background.webp';
import overdrop from 'assets/images/overdrop/overdrop-nav.webp';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumnCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';

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
`;

export const MiddleContainer = styled(FlexDivRowCentered)`
    width: 100%;
    max-width: 821px;
    justify-content: center;
`;

export const RightContainer = styled(FlexDivRowCentered)`
    position: relative;
    gap: 15px;
`;

export const MenuIcon = styled.img.attrs({ src: burger })`
    cursor: pointer;
    height: 25px;
    width: 35px;
    filter: invert(39%) sepia(9%) saturate(1318%) hue-rotate(199deg) brightness(71%) contrast(88%);
`;

export const OverdropIcon = styled.img.attrs({ src: overdrop })`
    height: 75px;
    cursor: pointer;
    margin-right: 20px;
    margin-top: -27px;
    margin-bottom: -27px;
    @media (max-width: 576px) {
        height: 70px;
        margin-right: 0;
    }
`;

export const WrapperMobile = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    margin-bottom: 6px;
`;

export const SearchIconContainer = styled.div`
    display: flex;
    justify-content: end;
`;

export const MenuIconContainer = styled.div`
    display: flex;
    position: relative;
    margin-right: 0px !important;
    @media (max-width: 950px) {
        display: flex;
        justify-content: start;
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
`;

export const SearchIcon = styled.i`
    font-size: 25px;
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
    height: 20px;
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

export const ActivateContainer = styled(FlexDivColumnCentered)`
    align-items: center;
    gap: 8px;
`;

export const CurrencyIcon = styled.i`
    text-transform: none;
    font-size: 16px;
    margin: 0 4px;
    color: ${(props) => props.theme.button.textColor.primary};
`;
