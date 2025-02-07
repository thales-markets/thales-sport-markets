import Button from 'components/Button';
import FreeBetFundModal from 'components/FreeBetFundModal';
import OutsideClickHandler from 'components/OutsideClick';
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
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsConnectedViaParticle } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import { getNetworkIconClassNameByNetworkId, getNetworkNameByNetworkId } from 'utils/network';
import { buildHref } from 'utils/routes';
import { useAccount, useChainId, useClient, useDisconnect } from 'wagmi';
import {
    CloseIcon,
    Count,
    FooterContainer,
    HeaderContainer,
    ItemContainer,
    ItemsContainer,
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

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const walletAddress = address || '';

    const isConnectedViaParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));

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
    useEffect(() => {
        // Discord Widget bot: move with nav menu
        const crate = (window as any).crate;
        const moveRightCss = '&:not(.open) .button { right: 275px; }';
        if (crate) {
            if (visibility) {
                crate.options.css = moveRightCss + crate.options.css;
            } else {
                crate.options.css = crate.options.css.replace(moveRightCss, '');
            }
        }

        return () => {
            if (crate) {
                crate.options.css = crate.options.css.replace(moveRightCss, '');
            }
        };
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
                                    onClick={() => setNavMenuVisibility(null)}
                                >
                                    {isConnected && item.name == 'profile' ? (
                                        <ProfileIconWidget
                                            top="-10px"
                                            left="-10px"
                                            avatarSize={25}
                                            iconColor={theme.textColor.primary}
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
                    <ItemContainer onClick={() => setOpenFreeBetModal(true)}>
                        <NavIcon className={`icon icon--gift`} />
                        <NavLabel>{t('profile.send-free-bet')}</NavLabel>
                    </ItemContainer>
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
                    {isConnected && (
                        <Button
                            borderColor={theme.button.borderColor.secondary}
                            backgroundColor="transparent"
                            textColor={theme.button.textColor.quaternary}
                            width="100%"
                            margin="10px 0"
                            onClick={() => {
                                disconnect();
                                setNavMenuVisibility(null);
                            }}
                        >
                            {t('markets.nav-menu.buttons.disconnect')}
                        </Button>
                    )}

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
                                marginTop: '8px',
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
