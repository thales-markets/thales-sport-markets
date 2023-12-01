import Button from 'components/Button';
import LanguageSelector from 'components/LanguageSelector';
import MintVoucher from 'components/MintVoucher';
import SPAAnchor from 'components/SPAAnchor';
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
import { getIsAA, getIsWalletConnected, getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';
import { getNetworkIconClassNameByNetworkId, getNetworkNameByNetworkId } from 'utils/network';
import { buildHref } from 'utils/routes';
import { useDisconnect } from 'wagmi';
import {
    CloseIcon,
    FooterContainer,
    HeaderContainer,
    ItemContainer,
    ItemsContainer,
    LanguageLabel,
    NavIcon,
    NavLabel,
    Network,
    NetworkIcon,
    NetworkName,
    Separator,
    Wrapper,
} from './styled-components';

type NavMenuProps = {
    visibility?: boolean | null;
    setNavMenuVisibility: (value: boolean | null) => void;
};

const NavMenu: React.FC<NavMenuProps> = ({ visibility, setNavMenuVisibility }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const theme: ThemeInterface = useTheme();
    const { disconnect } = useDisconnect();

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isAA = useSelector((state: RootState) => getIsAA(state));

    return (
        <OutsideClickHandler onOutsideClick={() => visibility == true && setNavMenuVisibility(false)}>
            <Wrapper show={visibility}>
                <HeaderContainer>
                    <Network>
                        <NetworkIcon className={getNetworkIconClassNameByNetworkId(networkId)} />
                        <NetworkName>{getNetworkNameByNetworkId(networkId)}</NetworkName>
                    </Network>
                    <CloseIcon onClick={() => setNavMenuVisibility(false)} />
                    <LanguageLabel>{t('markets.nav-menu.labels.language')}:</LanguageLabel>
                    <LanguageSelector />
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
                                    onClick={() => setNavMenuVisibility(null)}
                                    data-matomo-category="navigation-menu"
                                    data-matomo-action={item.name}
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
                                    onClick={() => setNavMenuVisibility(null)}
                                    data-matomo-category="navigation-menu"
                                    data-matomo-action={item.name}
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
                                    onClick={() => setNavMenuVisibility(null)}
                                    data-matomo-category="navigation-menu"
                                    data-matomo-action={item.name}
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
                                    onClick={() => setNavMenuVisibility(null)}
                                    data-matomo-category="navigation-menu"
                                    data-matomo-action={item.name}
                                >
                                    <NavIcon className={item.iconClass} active={location.pathname === item.route} />
                                    <NavLabel>{t(item.i18label)}</NavLabel>
                                </ItemContainer>
                            </SPAAnchor>
                        );
                    })}
                </ItemsContainer>
                <FooterContainer>
                    {!isAA && <MintVoucher style={{ width: '100%' }} />}
                    {isAA && (
                        <Button
                            backgroundColor={theme.button.background.quaternary}
                            textColor={theme.button.textColor.primary}
                            borderColor={theme.button.borderColor.secondary}
                            width="140px"
                            fontWeight="400"
                            additionalStyles={{
                                borderRadius: '5px',
                                fontSize: '14px',
                                textTransform: 'capitalize',
                            }}
                            height="28px"
                            onClick={() => {
                                disconnect();
                                setNavMenuVisibility(false);
                            }}
                        >
                            {t('get-started.sign-out')}
                        </Button>
                    )}
                </FooterContainer>
            </Wrapper>
        </OutsideClickHandler>
    );
};

export default NavMenu;
