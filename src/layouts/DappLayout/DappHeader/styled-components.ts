import burger from 'assets/images/burger.svg';
import OverdropButtonBackground from 'assets/images/overdrop/overdrop-button-background.webp';
import overdrop from 'assets/images/overdrop/overdrop-nav.webp';
import styled from 'styled-components';
import { FlexDiv, FlexDivEnd, FlexDivRow, FlexDivRowCentered, FlexDivStart } from 'styles/common';

export const Container = styled(FlexDivRowCentered)`
    width: 100%;

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

export const LeftContainer = styled(FlexDivRow)`
    width: 100%;
    width: 263px;
    justify-content: center;
`;

export const MiddleContainer = styled(FlexDivRowCentered)`
    width: calc(100% - 263px - 360px - 50px);
    justify-content: space-between;
`;

export const RightContainer = styled(FlexDivRowCentered)`
    position: relative;
    width: 360px;
`;

export const MiddleContainerSectionLeft = styled(FlexDivStart)`
    gap: 10px;
`;

export const MiddleContainerSectionRight = styled(FlexDivEnd)``;

export const MenuIcon = styled.img.attrs({ src: burger })`
    cursor: pointer;
    height: 26px;
    width: 50px;
    filter: invert(39%) sepia(9%) saturate(1318%) hue-rotate(199deg) brightness(71%) contrast(88%);
    @media (max-width: 420px) {
        width: 36px;
    }
`;

export const OverdropIcon = styled.img.attrs({ src: overdrop })`
    height: 75px;
    cursor: pointer;
    margin-top: -27px;
    margin-bottom: -27px;
    @media (max-width: 576px) {
        height: 70px;
        margin-right: 0;
    }

    @media (max-width: 420px) {
        height: 65px;
    }
`;

export const WrapperMobile = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    margin-bottom: 10px;
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

export const ProfileLabel = styled.p`
    font-size: 14px;
    text-transform: uppercase;
    font-weight: 600;
    color: ${(props) => props.theme.textColor.secondary};
    cursor: pointer;
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

const NotificationCount = styled.div`
    position: absolute;
    border-radius: 50%;
    bottom: -8px;
    left: 0;
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
    background-color: ${(props) => props.theme.error.textColor.primary};
    box-shadow: ${(props) => props.theme.shadow.errorNotification};
`;

export const Count = styled.span`
    color: ${(props) => props.theme.button.textColor.primary};
    font-weight: 600;
    font-size: 12px;
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
    margin-left: 25px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: ${(props) => props.theme.overdrop.textColor.primary};
    @media (max-width: 950px) {
        font-size: 8px;
        width: 140px;
        height: 30px;
        margin-left: 10px;
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

export const CurrencyIcon = styled.i`
    text-transform: none;
    font-size: 20px;
    font-weight: 400;
    line-height: 20px;
    margin: 0 4px;
    color: ${(props) => props.theme.button.textColor.primary};
`;
