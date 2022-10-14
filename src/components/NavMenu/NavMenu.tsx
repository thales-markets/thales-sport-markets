import { NAV_MENU } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Button,
    FooterContainer,
    HeaderContainer,
    ItemContainer,
    ItemsContainer,
    NavIcon,
    NavLabel,
    Network,
    NetworkIcon,
    NetworkName,
    Wrapper,
} from './styled-components';

const NavMenu: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Wrapper>
            <HeaderContainer>
                <Network>
                    <NetworkIcon className="icon icon--logo" />
                    <NetworkName>{'Mainnet'}</NetworkName>
                </Network>
            </HeaderContainer>
            <ItemsContainer>
                {NAV_MENU.map((item, index) => {
                    return (
                        <ItemContainer key={index}>
                            <NavIcon className={item.iconClass} />
                            <NavLabel>{t(item.i18label)}</NavLabel>
                        </ItemContainer>
                    );
                })}
                {/* <ItemContainer>
                    <NavIcon className="icon icon--logo" />
                    <NavLabel>{t('markets.nav-menu.markets')}</NavLabel>
                </ItemContainer>
                <ItemContainer>
                    <NavIcon className="icon icon--logo" />
                    <NavLabel>{t('markets.nav-menu.markets')}</NavLabel>
                </ItemContainer>
                <ItemContainer>
                    <NavIcon className="icon icon--logo" />
                    <NavLabel>{t('markets.nav-menu.markets')}</NavLabel>
                </ItemContainer>
                <ItemContainer>
                    <NavIcon className="icon icon--logo" />
                    <NavLabel>{t('markets.nav-menu.markets')}</NavLabel>
                </ItemContainer>
                <ItemContainer>
                    <NavIcon className="icon icon--logo" />
                    <NavLabel>{t('markets.nav-menu.markets')}</NavLabel>
                </ItemContainer> */}
            </ItemsContainer>
            <FooterContainer>
                <Button>{t('markets.nav-menu.buttons.switch')}</Button>
                <Button>{t('markets.nav-menu.buttons.disconnect')}</Button>
            </FooterContainer>
        </Wrapper>
    );
};

export default NavMenu;
