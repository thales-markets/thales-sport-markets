import { NAV_MENU } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { getNetworkIconClassNameByNetworkId, getNetworkNameByNetworkId } from 'utils/network';
import {
    Button,
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
    Wrapper,
} from './styled-components';

type NavMenuProps = {
    visibility?: boolean | null;
    hideVisibilityFunction: () => void;
};

const NavMenu: React.FC<NavMenuProps> = ({ visibility, hideVisibilityFunction }) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    return (
        <Wrapper show={visibility}>
            <HeaderContainer>
                <Network>
                    <NetworkIcon className={getNetworkIconClassNameByNetworkId(networkId)} />
                    <NetworkName>{getNetworkNameByNetworkId(networkId)}</NetworkName>
                </Network>
                <CloseIcon onClick={() => hideVisibilityFunction()} />
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
