import Button from 'components/Button';
import FreeBetFundModal from 'components/FreeBetFundModal';
import LanguageSelector from 'components/LanguageSelector';
import Logo from 'components/Logo';
import { Separator } from 'components/NavMenu/styled-components';
import SPAAnchor from 'components/SPAAnchor';
import WalletInfo from 'components/WalletInfo';
import { LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import {
    NAV_MENU_FIFTH_SECTION,
    NAV_MENU_FIRST_SECTION,
    NAV_MENU_FOURTH_SECTION,
    NAV_MENU_SECOND_SECTION,
    NAV_MENU_THIRD_SECTION,
} from 'constants/ui';
import { ProfileIconWidget } from 'layouts/DappLayout/DappHeader/components/ProfileItem/ProfileItem';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import OutsideClickHandler from 'react-outside-click-handler';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsWalletConnected, getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { ThemeInterface } from 'types/ui';
import { getNetworkIconClassNameByNetworkId, getNetworkNameByNetworkId } from 'utils/network';
import { buildHref } from 'utils/routes';
import {
    ButtonWrapper,
    CloseIcon,
    FooterContainer,
    HeaderContainer,
    ItemContainer,
    ItemsContainer,
    NavIcon,
    NavLabel,
    Network,
    NetworkIcon,
    NetworkName,
    WalletWrapper,
    Wrapper,
} from './styled-components';
import { LogoContainer, OverdropIcon } from 'layouts/DappLayout/DappHeader/styled-components';

type NavMenuMobileProps = {
    visibility?: boolean | null;
    setNavMenuVisibility: (value: boolean) => void;
};

const NavMenuMobile: React.FC<NavMenuMobileProps> = ({ visibility, setNavMenuVisibility }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const theme: ThemeInterface = useTheme();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const [openFreeBetModal, setOpenFreeBetModal] = useState<boolean>(false);

    return (
        <OutsideClickHandler onOutsideClick={() => visibility && setNavMenuVisibility(false)}>
            <Wrapper show={visibility}>
                <HeaderContainer>
                    <LogoContainer>
                        <Logo width={150} />
                        <SPAAnchor style={{ display: 'flex' }} href={buildHref(ROUTES.Overdrop)}>
                            <OverdropIcon />
                        </SPAAnchor>
                    </LogoContainer>

                    <FlexDivCentered>
                        <Network>
                            <NetworkIcon className={getNetworkIconClassNameByNetworkId(networkId)} />
                            <NetworkName>{getNetworkNameByNetworkId(networkId)}</NetworkName>
                        </Network>
                        <LanguageSelector />
                    </FlexDivCentered>
                    <WalletWrapper>
                        <WalletInfo />
                    </WalletWrapper>
                </HeaderContainer>
                <ItemsContainer>
                    {NAV_MENU_FIRST_SECTION.map((item, index) => {
                        if (!item.supportedNetworks.includes(networkId)) return;
                        if (item.name == 'profile' && !isWalletConnected) return;
                        return (
                            <SPAAnchor key={index} href={buildHref(item.route)}>
                                <ItemContainer
                                    key={index}
                                    active={location.pathname === item.route}
                                    onClick={() => setNavMenuVisibility(false)}
                                >
                                    {isWalletConnected ? (
                                        <ProfileIconWidget avatarSize={25} iconColor={theme.textColor.primary} />
                                    ) : (
                                        <NavIcon className={item.iconClass} active={location.pathname === item.route} />
                                    )}
                                    <NavLabel>{t(item.i18label)}</NavLabel>
                                </ItemContainer>
                            </SPAAnchor>
                        );
                    })}
                    <Separator />
                    {NAV_MENU_SECOND_SECTION.map((item, index) => {
                        if (!item.supportedNetworks.includes(networkId)) return;
                        return (
                            <SPAAnchor key={index} href={buildHref(item.route)}>
                                <ItemContainer
                                    key={index}
                                    active={location.pathname === item.route}
                                    onClick={() => setNavMenuVisibility(false)}
                                >
                                    <NavIcon className={item.iconClass} active={location.pathname === item.route} />
                                    <NavLabel>{t(item.i18label)}</NavLabel>
                                </ItemContainer>
                            </SPAAnchor>
                        );
                    })}
                    <Separator />
                    {NAV_MENU_THIRD_SECTION.map((item, index) => {
                        if (!item.supportedNetworks.includes(networkId)) return;
                        return (
                            <SPAAnchor
                                key={index}
                                href={
                                    item.route === ROUTES.Leaderboard
                                        ? LINKS.ParlayLeaderboardV1
                                        : buildHref(item.route)
                                }
                            >
                                <ItemContainer
                                    key={index}
                                    active={location.pathname === item.route}
                                    onClick={() => setNavMenuVisibility(false)}
                                >
                                    <NavIcon className={item.iconClass} active={location.pathname === item.route} />
                                    <NavLabel>{t(item.i18label)}</NavLabel>
                                </ItemContainer>
                            </SPAAnchor>
                        );
                    })}
                    <Separator />
                    {NAV_MENU_FOURTH_SECTION.map((item, index) => {
                        if (!item.supportedNetworks.includes(networkId)) return;
                        return (
                            <SPAAnchor key={index} href={buildHref(item.route)}>
                                <ItemContainer
                                    key={index}
                                    active={location.pathname === item.route}
                                    onClick={() => setNavMenuVisibility(false)}
                                >
                                    <NavIcon className={item.iconClass} active={location.pathname === item.route} />
                                    <NavLabel>{t(item.i18label)}</NavLabel>
                                </ItemContainer>
                            </SPAAnchor>
                        );
                    })}
                    <Separator />
                    {NAV_MENU_FIFTH_SECTION.map((item, index) => {
                        if (!item.supportedNetworks.includes(networkId)) return;
                        return (
                            <SPAAnchor key={index} href={buildHref(item.route)}>
                                <ItemContainer
                                    key={index}
                                    active={location.pathname === item.route}
                                    onClick={() => setNavMenuVisibility(false)}
                                >
                                    <NavIcon className={item.iconClass} active={location.pathname === item.route} />
                                    <NavLabel>{t(item.i18label)}</NavLabel>
                                </ItemContainer>
                            </SPAAnchor>
                        );
                    })}
                    <ButtonWrapper>
                        <Button
                            borderColor={theme.button.borderColor.secondary}
                            backgroundColor="transparent"
                            textColor={theme.button.textColor.quaternary}
                            width="100%"
                            onClick={() => setOpenFreeBetModal(!openFreeBetModal)}
                        >
                            {t('profile.send-free-bet')}
                        </Button>
                    </ButtonWrapper>
                </ItemsContainer>

                <FooterContainer>
                    <CloseIcon onClick={() => setNavMenuVisibility(false)} />
                </FooterContainer>
            </Wrapper>
            {openFreeBetModal && <FreeBetFundModal onClose={() => setOpenFreeBetModal(false)} />}
        </OutsideClickHandler>
    );
};

export default NavMenuMobile;
