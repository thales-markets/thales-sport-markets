import LanguageSelector from 'components/LanguageSelector';
import Logo from 'components/Logo';
import MintVoucher from 'components/MintVoucher';
import { Separator } from 'components/NavMenu/styled-components';
import SPAAnchor from 'components/SPAAnchor';
import WalletInfo from 'components/WalletInfo';
import {
    NAV_MENU_FIRST_SECTION,
    NAV_MENU_FOURTH_SECTION,
    NAV_MENU_SECOND_SECTION,
    NAV_MENU_THIRD_SECTION,
} from 'constants/ui';
import { ProfileIconWidget } from 'layouts/DappLayout/DappHeader/components/ProfileItem/ProfileItem';
import React from 'react';
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
    CloseIcon,
    FooterContainer,
    HeaderContainer,
    ItemContainer,
    ItemsContainer,
    LogoContainer,
    NavIcon,
    NavLabel,
    Network,
    NetworkIcon,
    NetworkName,
    WalletWrapper,
    Wrapper,
} from './styled-components';
import Button from 'components/Button';
import PWA from 'utils/PWA';

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

    return (
        <OutsideClickHandler onOutsideClick={() => visibility && setNavMenuVisibility(false)}>
            <Wrapper show={visibility}>
                <HeaderContainer>
                    <FlexDivCentered>
                        <Network>
                            <NetworkIcon className={getNetworkIconClassNameByNetworkId(networkId)} />
                            <NetworkName>{getNetworkNameByNetworkId(networkId)}</NetworkName>
                        </Network>
                        <LanguageSelector />
                    </FlexDivCentered>
                    {isWalletConnected && (
                        <WalletWrapper>
                            <WalletInfo />
                        </WalletWrapper>
                    )}
                    <WalletWrapper>
                        {PWA.beforeInstallEvent && (
                            <Button
                                backgroundColor={theme.button.background.quaternary}
                                textColor={theme.button.textColor.primary}
                                borderColor={theme.button.borderColor.secondary}
                                fontWeight="400"
                                additionalStyles={{
                                    maxWidth: 400,
                                    borderRadius: '15.5px',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    textTransform: 'capitalize',
                                }}
                                width="100%"
                                height="28px"
                                onClick={() =>
                                    PWA.beforeInstallEvent?.prompt().then((status: string) => {
                                        console.log('status: ', status);
                                        PWA.disableBeforeInstallEvent();
                                    })
                                }
                            >
                                {t('get-started.install-app')}
                                <i className="icon icon--esports" />
                            </Button>
                        )}
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
                </ItemsContainer>
                <FooterContainer>
                    <MintVoucher style={{ margin: '20px auto 0px auto', width: 205 }} />
                    <LogoContainer>
                        <Logo />
                        <CloseIcon onClick={() => setNavMenuVisibility(false)} />
                    </LogoContainer>
                </FooterContainer>
            </Wrapper>
        </OutsideClickHandler>
    );
};

export default NavMenuMobile;
