import LanguageSelector from 'components/LanguageSelector';
import SPAAnchor from 'components/SPAAnchor';
import WalletInfo from 'components/WalletInfo';
import { NAV_MENU } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import OutsideClickHandler from 'react-outside-click-handler';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { getNetworkIconClassNameByNetworkId, getNetworkNameByNetworkId } from 'utils/network';
import { buildHref } from 'utils/routes';
import {
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
    hideVisibilityFunction: (value: boolean | null) => void;
};

const NavMenu: React.FC<NavMenuProps> = ({ visibility, hideVisibilityFunction }) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    // const { openConnectModal } = useConnectModal();

    return (
        <OutsideClickHandler onOutsideClick={() => visibility == true && hideVisibilityFunction(false)}>
            <Wrapper show={visibility}>
                <HeaderContainer>
                    <Network>
                        <NetworkIcon className={getNetworkIconClassNameByNetworkId(networkId)} />
                        <NetworkName>{getNetworkNameByNetworkId(networkId)}</NetworkName>
                    </Network>
                    <CloseIcon onClick={() => hideVisibilityFunction(false)} />
                    <LanguageSelector />
                </HeaderContainer>
                <ItemsContainer>
                    {NAV_MENU.map((item, index) => {
                        return (
                            <SPAAnchor
                                key={index}
                                href={buildHref(item.route)}
                                onClick={() => hideVisibilityFunction(null)}
                            >
                                <ItemContainer key={index} active={location.pathname === item.route}>
                                    <NavIcon className={item.iconClass} active={location.pathname === item.route} />
                                    <NavLabel>{t(item.i18label)}</NavLabel>
                                </ItemContainer>
                            </SPAAnchor>
                        );
                    })}
                </ItemsContainer>
                <FooterContainer>{isMobile && <WalletInfo />}</FooterContainer>
            </Wrapper>
        </OutsideClickHandler>
    );
};

export default NavMenu;
