import SPAAnchor from 'components/SPAAnchor';
import { NAV_MENU } from 'constants/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import OutsideClickHandler from 'react-outside-click-handler';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { truncateAddress } from 'utils/formatters/string';
import { getNetworkIconClassNameByNetworkId, getNetworkNameByNetworkId } from 'utils/network';
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
    WalletAddress,
    WalletAddressContainer,
    WalletIcon,
    Wrapper,
} from './styled-components';
import { useAccountModal } from '@rainbow-me/rainbowkit';
import { buildHref } from 'utils/routes';
import LanguageSelector from 'components/LanguageSelector';

type NavMenuProps = {
    visibility?: boolean | null;
    hideVisibilityFunction: (value: boolean | null) => void;
};

const NavMenu: React.FC<NavMenuProps> = ({ visibility, hideVisibilityFunction }) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const { openAccountModal } = useAccountModal();
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
                                <ItemContainer key={index}>
                                    <NavIcon className={item.iconClass} />
                                    <NavLabel>{t(item.i18label)}</NavLabel>
                                </ItemContainer>
                            </SPAAnchor>
                        );
                    })}
                </ItemsContainer>
                <FooterContainer>
                    {isWalletConnected && (
                        <WalletAddressContainer onClick={() => openAccountModal?.()}>
                            <WalletIcon />
                            <WalletAddress>{truncateAddress(walletAddress)}</WalletAddress>
                        </WalletAddressContainer>
                    )}
                </FooterContainer>
            </Wrapper>
        </OutsideClickHandler>
    );
};

export default NavMenu;
