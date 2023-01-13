import LanguageSelector from 'components/LanguageSelector';
import MintVoucher from 'components/MintVoucher';
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
import { getIsMobile } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { getNetworkIconClassNameByNetworkId, getNetworkNameByNetworkId } from 'utils/network';
import { buildHref } from 'utils/routes';
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

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

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
                        if (item.name == 'profile' && !isWalletConnected) return;
                        return (
                            <SPAAnchor key={index} href={buildHref(item.route)}>
                                <ItemContainer
                                    key={index}
                                    active={location.pathname === item.route}
                                    onClick={() => setNavMenuVisibility(null)}
                                >
                                    {isWalletConnected ? (
                                        <ProfileIconWidget avatarSize={25} iconColor={'#FFFFFF'} />
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
                        return (
                            <SPAAnchor key={index} href={buildHref(item.route)}>
                                <ItemContainer
                                    key={index}
                                    active={location.pathname === item.route}
                                    onClick={() => setNavMenuVisibility(null)}
                                >
                                    <NavIcon className={item.iconClass} active={location.pathname === item.route} />
                                    <NavLabel>{t(item.i18label)}</NavLabel>
                                </ItemContainer>
                            </SPAAnchor>
                        );
                    })}
                    <Separator />
                    {NAV_MENU_THIRD_SECTION.map((item, index) => {
                        return (
                            <SPAAnchor key={index} href={buildHref(item.route)}>
                                <ItemContainer
                                    key={index}
                                    active={location.pathname === item.route}
                                    onClick={() => setNavMenuVisibility(null)}
                                >
                                    <NavIcon className={item.iconClass} active={location.pathname === item.route} />
                                    <NavLabel>{t(item.i18label)}</NavLabel>
                                </ItemContainer>
                            </SPAAnchor>
                        );
                    })}
                    <Separator />
                    {NAV_MENU_FOURTH_SECTION.map((item, index) => {
                        return (
                            <SPAAnchor key={index} href={buildHref(item.route)}>
                                <ItemContainer
                                    key={index}
                                    active={location.pathname === item.route}
                                    onClick={() => setNavMenuVisibility(null)}
                                >
                                    <NavIcon className={item.iconClass} active={location.pathname === item.route} />
                                    <NavLabel>{t(item.i18label)}</NavLabel>
                                </ItemContainer>
                            </SPAAnchor>
                        );
                    })}
                </ItemsContainer>
                <FooterContainer>
                    <MintVoucher
                        style={{ width: '100%' }}
                        buttonStyle={{
                            width: '100%',
                            background: '#303656',
                            borderRadius: 3,
                            border: `1.5px solid #3FD1FF`,
                            color: '#3FD1FF',
                            fontSize: 14,
                            lineHeight: '16px',
                        }}
                    />
                    {isMobile && <WalletInfo />}
                </FooterContainer>
            </Wrapper>
        </OutsideClickHandler>
    );
};

export default NavMenu;
