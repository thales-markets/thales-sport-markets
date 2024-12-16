import Button from 'components/Button';
import FreeBetFundModal from 'components/FreeBetFundModal';
import LanguageSelector from 'components/LanguageSelector';
import SPAAnchor from 'components/SPAAnchor';
import {
    NAV_MENU_FIRST_SECTION,
    NAV_MENU_FOURTH_SECTION,
    NAV_MENU_SECOND_SECTION,
    NAV_MENU_THIRD_SECTION,
} from 'constants/ui';
import { ProfileIconWidget } from 'layouts/DappLayout/DappHeader/components/ProfileItem/ProfileItem';
import useBlockedGamesQuery from 'queries/resolveBlocker/useBlockedGamesQuery';
import useWhitelistedForUnblock from 'queries/resolveBlocker/useWhitelistedForUnblock';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OutsideClickHandler from 'react-outside-click-handler';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import { getIsConnectedViaParticle, getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';
import { getNetworkIconClassNameByNetworkId, getNetworkNameByNetworkId } from 'utils/network';
import { buildHref } from 'utils/routes';
import {
    CloseIcon,
    Count,
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
    NotificationCount,
    Separator,
    Wrapper,
} from './styled-components';

type NavMenuProps = {
    visibility?: boolean | null;
    setNavMenuVisibility: (value: boolean | null) => void;
    skipOutsideClickOnElement?: React.RefObject<HTMLImageElement>;
};

const PARTICLE_WALLET = 'https://wallet.particle.network/';

const NavMenu: React.FC<NavMenuProps> = ({ visibility, setNavMenuVisibility, skipOutsideClickOnElement }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const theme: ThemeInterface = useTheme();

    const isAppReady = useSelector(getIsAppReady);
    const networkId = useSelector(getNetworkId);
    const isWalletConnected = useSelector(getIsWalletConnected);
    const walletAddress = useSelector(getWalletAddress) || '';
    const isConnectedViaParticle = useSelector(getIsConnectedViaParticle);

    const [openFreeBetModal, setOpenFreeBetModal] = useState<boolean>(false);

    const whitelistedForUnblockQuery = useWhitelistedForUnblock(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const isWitelistedForUnblock = useMemo(
        () => whitelistedForUnblockQuery.isSuccess && whitelistedForUnblockQuery.data,
        [whitelistedForUnblockQuery.data, whitelistedForUnblockQuery.isSuccess]
    );

    const blockedGamesQuery = useBlockedGamesQuery(false, networkId, {
        enabled: isAppReady && isWitelistedForUnblock,
    });
    const blockedGamesCount = useMemo(
        () =>
            blockedGamesQuery.isSuccess && blockedGamesQuery.data && isWitelistedForUnblock
                ? blockedGamesQuery.data.length
                : 0,
        [blockedGamesQuery.data, blockedGamesQuery.isSuccess, isWitelistedForUnblock]
    );
    useEffect(() => {
        // Discord Widget bot: move with nav menu
        const crate = (window as any).crate;
        if (crate) {
            const moveRightCss = '&:not(.open) .button { right: 275px; }';
            if (visibility) {
                crate.options.css = moveRightCss + crate.options.css;
            } else {
                crate.options.css = crate.options.css.replace(moveRightCss, '');
            }
        }
    }, [visibility]);

    return (
        <OutsideClickHandler
            onOutsideClick={(e: MouseEvent) =>
                (e.target as HTMLImageElement) !== skipOutsideClickOnElement?.current &&
                visibility == true &&
                setNavMenuVisibility(false)
            }
        >
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
                        if (item.name == 'resolve-blocker' && !isWitelistedForUnblock) return;
                        return (
                            <SPAAnchor key={index} href={buildHref(item.route)}>
                                <ItemContainer
                                    key={index}
                                    active={location.pathname === item.route}
                                    onClick={() => setNavMenuVisibility(null)}
                                >
                                    {isWalletConnected && item.name == 'profile' ? (
                                        <ProfileIconWidget
                                            avatarSize={25}
                                            iconColor={theme.textColor.primary}
                                            marginRight="10px"
                                        />
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
                        if (!item.supportedNetworks.includes(networkId)) return;
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
                        if (!item.supportedNetworks.includes(networkId)) return;
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
                    <Button
                        borderColor={theme.button.borderColor.secondary}
                        backgroundColor="transparent"
                        textColor={theme.button.textColor.quaternary}
                        width="100%"
                        margin={isConnectedViaParticle ? '0 0 5px 0' : ''}
                        onClick={() => setOpenFreeBetModal(!openFreeBetModal)}
                    >
                        {t('profile.send-free-bet')}
                    </Button>
                    {openFreeBetModal && <FreeBetFundModal onClose={() => setOpenFreeBetModal(false)} />}
                    {isConnectedViaParticle && (
                        <Button
                            backgroundColor={theme.button.background.quaternary}
                            textColor={theme.button.textColor.primary}
                            borderColor={theme.button.borderColor.secondary}
                            fontWeight="400"
                            width="100%"
                            additionalStyles={{
                                borderRadius: '5px',
                                fontSize: '14px',
                                textTransform: 'capitalize',
                                padding: '3px 20px',
                            }}
                            height="28px"
                            onClick={() => {
                                window.open(PARTICLE_WALLET, '_blank');
                            }}
                        >
                            {t('markets.nav-menu.buttons.particle-wallet')}
                        </Button>
                    )}
                </FooterContainer>
            </Wrapper>
        </OutsideClickHandler>
    );
};

export default NavMenu;
