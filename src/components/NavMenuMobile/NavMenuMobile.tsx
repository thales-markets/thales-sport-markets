import Button from 'components/Button';
import FreeBetFundModal from 'components/FreeBetFundModal';
import Logo from 'components/Logo';
import { Count, NotificationCount, Separator } from 'components/NavMenu/styled-components';
import OutsideClickHandler from 'components/OutsideClick';
import SPAAnchor from 'components/SPAAnchor';
import WalletInfo from 'components/WalletInfo';
import ROUTES from 'constants/routes';
import {
    NAV_MENU_FIRST_SECTION,
    NAV_MENU_FOURTH_SECTION,
    NAV_MENU_SECOND_SECTION,
    NAV_MENU_THIRD_SECTION,
} from 'constants/ui';
import { ProfileIconWidget } from 'layouts/DappLayout/DappHeader/components/ProfileItem/ProfileItem';
import { LogoContainer, OverdropIcon } from 'layouts/DappLayout/DappHeader/styled-components';
import useBlockedGamesQuery from 'queries/resolveBlocker/useBlockedGamesQuery';
import useWhitelistedForUnblock from 'queries/resolveBlocker/useWhitelistedForUnblock';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';
import { getNetworkIconClassNameByNetworkId, getNetworkNameByNetworkId } from 'utils/network';
import { buildHref } from 'utils/routes';
import { useAccount, useChainId, useClient } from 'wagmi';
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
    NetworkWrapper,
    WalletWrapper,
    Wrapper,
} from './styled-components';

type NavMenuMobileProps = {
    visibility?: boolean | null;
    setNavMenuVisibility: (value: boolean) => void;
};

const NavMenuMobile: React.FC<NavMenuMobileProps> = ({ visibility, setNavMenuVisibility }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = address || '';

    const [openFreeBetModal, setOpenFreeBetModal] = useState<boolean>(false);

    const whitelistedForUnblockQuery = useWhitelistedForUnblock(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );
    const isWitelistedForUnblock = useMemo(
        () => whitelistedForUnblockQuery.isSuccess && whitelistedForUnblockQuery.data,
        [whitelistedForUnblockQuery.data, whitelistedForUnblockQuery.isSuccess]
    );

    const blockedGamesQuery = useBlockedGamesQuery(
        false,
        { networkId, client },
        {
            enabled: isWitelistedForUnblock,
        }
    );
    const blockedGamesCount = useMemo(
        () =>
            blockedGamesQuery.isSuccess && blockedGamesQuery.data && isWitelistedForUnblock
                ? blockedGamesQuery.data.length
                : 0,
        [blockedGamesQuery.data, blockedGamesQuery.isSuccess, isWitelistedForUnblock]
    );

    return (
        <OutsideClickHandler onOutsideClick={() => visibility && setNavMenuVisibility(false)}>
            <Wrapper show={visibility}>
                <HeaderContainer>
                    <LogoContainer>
                        <Logo width={150} />
                        <SPAAnchor
                            onClick={() => setNavMenuVisibility(false)}
                            style={{ display: 'flex' }}
                            href={buildHref(ROUTES.Overdrop)}
                        >
                            <OverdropIcon />
                        </SPAAnchor>
                    </LogoContainer>

                    <NetworkWrapper>
                        <Network>
                            <NetworkIcon className={getNetworkIconClassNameByNetworkId(networkId)} />
                            <NetworkName>{getNetworkNameByNetworkId(networkId)}</NetworkName>
                        </Network>
                    </NetworkWrapper>
                    <WalletWrapper>
                        <WalletInfo />
                    </WalletWrapper>
                </HeaderContainer>
                <ItemsContainer>
                    {NAV_MENU_FIRST_SECTION.map((item, index) => {
                        if (!item.supportedNetworks.includes(networkId)) return;
                        if (item.name == 'profile' && !isConnected) return;
                        if (item.name == 'resolve-blocker' && !isWitelistedForUnblock) return;
                        return (
                            <SPAAnchor key={index} href={buildHref(item.route)}>
                                <ItemContainer
                                    key={index}
                                    active={location.pathname === item.route}
                                    onClick={() => setNavMenuVisibility(false)}
                                >
                                    {isConnected && item.name == 'profile' ? (
                                        <ProfileIconWidget avatarSize={25} iconColor={theme.textColor.primary} />
                                    ) : (
                                        <>
                                            {item.name == 'resolve-blocker' && blockedGamesCount > 0 && (
                                                <NotificationCount>
                                                    <Count>{blockedGamesCount}</Count>
                                                </NotificationCount>
                                            )}
                                            <NavIcon
                                                className={item.iconClass}
                                                active={location.pathname === item.route}
                                            />
                                        </>
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
