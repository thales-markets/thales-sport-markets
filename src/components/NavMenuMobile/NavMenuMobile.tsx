import LanguageSelector from 'components/LanguageSelector';
import Logo from 'components/Logo';
import SPAAnchor from 'components/SPAAnchor';
import WalletInfo from 'components/WalletInfo';
import { NAV_MENU } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import OutsideClickHandler from 'react-outside-click-handler';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered } from 'styles/common';
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
    Wrapper,
    WalletWrapper,
} from './styled-components';

type NavMenuMobileProps = {
    visibility?: boolean | null;
    setNavMenuVisibility: (value: boolean) => void;
};

const NavMenuMobile: React.FC<NavMenuMobileProps> = ({ visibility, setNavMenuVisibility }) => {
    const { t } = useTranslation();
    const location = useLocation();

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
                    <WalletWrapper>
                        <WalletInfo />
                    </WalletWrapper>
                </HeaderContainer>
                <ItemsContainer>
                    {NAV_MENU.map((item, index) => {
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
                    <LogoContainer>
                        <Logo />
                    </LogoContainer>
                    <CloseIcon onClick={() => setNavMenuVisibility(false)} />
                </FooterContainer>
            </Wrapper>
        </OutsideClickHandler>
    );
};

export default NavMenuMobile;
