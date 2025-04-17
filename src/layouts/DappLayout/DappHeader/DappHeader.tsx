import ActivateAccount from 'components/ActivateAccount';
import Button from 'components/Button';
import ConnectWalletModal from 'components/ConnectWalletModal';
import Logo from 'components/Logo';
import NavMenu from 'components/NavMenu';
import NavMenuMobile from 'components/NavMenuMobile';
import SPAAnchor from 'components/SPAAnchor';
import Search from 'components/Search';
import ThalesToOverMigrationModal from 'components/ThalesToOverMigrationModal';
import WalletInfo from 'components/WalletInfo';
import { OVERDROP_LEVELS } from 'constants/overdrop';
import ROUTES from 'constants/routes';
import { ProfileTab } from 'enums/ui';
import useInterval from 'hooks/useInterval';
import useBlockedGamesQuery from 'queries/resolveBlocker/useBlockedGamesQuery';
import useWhitelistedForUnblock from 'queries/resolveBlocker/useWhitelistedForUnblock';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getMarketSearch, setMarketSearch } from 'redux/modules/market';
import { getOverdropUIState, getStopPulsing, setStopPulsing } from 'redux/modules/ui';
import { getIsBiconomy, getWalletConnectModalVisibility, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { RootState } from 'types/redux';
import { OverdropLevel, ThemeInterface } from 'types/ui';
import { buildHref } from 'utils/routes';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';
import { ProfileIconWidget } from './components/ProfileItem/ProfileItem';
import {
    BlockedGamesNotificationCount,
    Container,
    Count,
    CurrencyIcon,
    IconWrapper,
    LeftContainer,
    LogoContainer,
    MenuIcon,
    MenuIconContainer,
    MiddleContainer,
    MiddleContainerSectionLeft,
    MiddleContainerSectionRight,
    MobileButtonWrapper,
    OverdropButtonContainer,
    OverdropIcon,
    OverdropIconWrapper,
    OverdropWrapper,
    ProfileLabel,
    RightContainer,
    SearchContainer,
    SearchIcon,
    SearchIconContainer,
    SmallBadgeImage,
    WrapperMobile,
} from './styled-components';

const PULSING_COUNT = 10;

const customModalStyles = {
    content: {
        top: '85px',
        left: '0',
        right: 'auto',
        bottom: 'auto',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        width: '100%',
        height: '40px',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'unset',
        WebkitBackdropFilter: 'unset',
        webkitBackdropFilter: 'unset',
        zIndex: '10',
    },
};

const DappHeader: React.FC = () => {
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const marketSearch = useSelector(getMarketSearch);
    const stopPulsing = useSelector(getStopPulsing);
    const isMobile = useSelector(getIsMobile);
    const overdropUIState = useSelector(getOverdropUIState);
    const connectWalletModalVisibility = useSelector((state: RootState) => getWalletConnectModalVisibility(state));

    const [levelItem, setLevelItem] = useState<OverdropLevel>(OVERDROP_LEVELS[0]);
    const [currentPulsingCount, setCurrentPulsingCount] = useState<number>(0);
    const [navMenuVisibility, setNavMenuVisibility] = useState<boolean | null>(null);
    const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
    const [showThalesToOverMigrationModal, setShowThalesToOverMigrationModal] = useState<boolean>(false);

    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const whitelistedForUnblockQuery = useWhitelistedForUnblock(
        walletAddress,
        { networkId, client },
        { enabled: isConnected }
    );
    const isWitelistedForUnblock = useMemo(
        () => whitelistedForUnblockQuery.isSuccess && whitelistedForUnblockQuery.data,
        [whitelistedForUnblockQuery.data, whitelistedForUnblockQuery.isSuccess]
    );

    const blockedGamesQuery = useBlockedGamesQuery(false, { networkId, client }, { enabled: isWitelistedForUnblock });
    const blockedGamesCount = useMemo(
        () =>
            blockedGamesQuery.isSuccess && blockedGamesQuery.data && isWitelistedForUnblock
                ? blockedGamesQuery.data.length
                : 0,
        [blockedGamesQuery.data, blockedGamesQuery.isSuccess, isWitelistedForUnblock]
    );

    useInterval(async () => {
        if (!stopPulsing) {
            setCurrentPulsingCount(currentPulsingCount + 1);
            if (currentPulsingCount >= PULSING_COUNT) {
                dispatch(setStopPulsing(true));
            }
        }
    }, 1000);

    useEffect(() => {
        if (address) {
            const overdropStateItem = overdropUIState.find(
                (item) => item.walletAddress?.toLowerCase() == address.toLowerCase()
            );

            const currentLevelItem = overdropStateItem
                ? OVERDROP_LEVELS.find((item) => item.level == overdropStateItem?.currentLevel)
                : OVERDROP_LEVELS[0];
            if (currentLevelItem) setLevelItem(currentLevelItem);
        } else {
            setLevelItem(OVERDROP_LEVELS[0]);
        }
    }, [dispatch, address, overdropUIState]);

    const menuImageRef = useRef<HTMLImageElement>(null);

    return (
        <>
            {!isMobile && (
                <Container>
                    <LeftContainer>
                        <Logo />
                    </LeftContainer>

                    <MiddleContainer>
                        <MiddleContainerSectionLeft>
                            <OverdropWrapper>
                                <SPAAnchor style={{ display: 'flex' }} href={buildHref(ROUTES.Overdrop)}>
                                    {levelItem.level > 0 ? (
                                        <OverdropButtonContainer>
                                            <SmallBadgeImage src={levelItem.smallBadge} />
                                            {`LVL ${levelItem.level} ${levelItem.levelName}`}
                                        </OverdropButtonContainer>
                                    ) : (
                                        <OverdropIconWrapper>
                                            <OverdropIcon />
                                        </OverdropIconWrapper>
                                    )}
                                </SPAAnchor>
                            </OverdropWrapper>
                            {isConnected && (
                                <Button
                                    onClick={() => setShowThalesToOverMigrationModal(true)}
                                    backgroundColor={theme.button.textColor.quaternary}
                                    borderColor={theme.button.textColor.quaternary}
                                    fontSize="14px"
                                    height="30px"
                                    padding="2px 10px"
                                >
                                    <Trans
                                        i18nKey="profile.migration-modal.title"
                                        components={{
                                            thalesIcon: (
                                                <CurrencyIcon className="currency-icon currency-icon--thales" />
                                            ),
                                            overtimeIcon: (
                                                <CurrencyIcon className="currency-icon currency-icon--over" />
                                            ),
                                        }}
                                    />
                                </Button>
                            )}
                        </MiddleContainerSectionLeft>
                        {isConnected && (
                            <MiddleContainerSectionRight>
                                <SPAAnchor href={`${ROUTES.Profile}?selected-tab=${ProfileTab.OPEN_CLAIMABLE}`}>
                                    <FlexDivCentered>
                                        <ProfileIconWidget /> <ProfileLabel>{t('common.profile')}</ProfileLabel>
                                    </FlexDivCentered>
                                </SPAAnchor>
                                {isConnected && isBiconomy && <ActivateAccount />}
                            </MiddleContainerSectionRight>
                        )}
                    </MiddleContainer>

                    <RightContainer>
                        {!isConnected && (
                            <Button
                                backgroundColor={theme.button.background.quinary}
                                textColor={theme.button.textColor.primary}
                                borderColor={theme.button.borderColor.quinary}
                                additionalStyles={{
                                    borderRadius: '8px',
                                    fontWeight: '800',
                                    fontSize: '12px',
                                    padding: '9px 20px',
                                    width: '120px',
                                    height: '30px',
                                    marginLeft: 'auto',
                                    whiteSpace: 'pre',
                                }}
                                onClick={() => dispatch(setWalletConnectModalVisibility({ visibility: true }))}
                            >
                                {t('get-started.sign-up')}
                            </Button>
                        )}
                        <WalletInfo />
                        <MenuIconContainer>
                            <MenuIcon ref={menuImageRef} onClick={() => setNavMenuVisibility(true)} />
                            {blockedGamesCount > 0 && (
                                <BlockedGamesNotificationCount>
                                    <Count>{blockedGamesCount}</Count>
                                </BlockedGamesNotificationCount>
                            )}
                        </MenuIconContainer>
                        <NavMenu
                            visibility={navMenuVisibility}
                            setNavMenuVisibility={(value: boolean | null) => setNavMenuVisibility(value)}
                            skipOutsideClickOnElement={menuImageRef}
                        />
                    </RightContainer>
                </Container>
            )}
            {isMobile && (
                <>
                    <WrapperMobile>
                        <MenuIconContainer>
                            <MenuIcon onClick={() => setNavMenuVisibility(true)} />
                            {blockedGamesCount > 0 && (
                                <BlockedGamesNotificationCount>
                                    <Count>{blockedGamesCount}</Count>
                                </BlockedGamesNotificationCount>
                            )}
                            <NavMenuMobile
                                visibility={navMenuVisibility}
                                setNavMenuVisibility={(value: boolean | null) => setNavMenuVisibility(value)}
                                overdropLevelItem={levelItem}
                            />
                        </MenuIconContainer>

                        <LogoContainer>
                            <Logo />
                            <SPAAnchor style={{ display: 'flex' }} href={buildHref(ROUTES.Overdrop)}>
                                {levelItem.level > 0 ? (
                                    <OverdropButtonContainer>
                                        <SmallBadgeImage src={levelItem.smallBadge} />
                                        {`LVL ${levelItem.level} ${levelItem.levelName}`}
                                    </OverdropButtonContainer>
                                ) : (
                                    <OverdropIconWrapper>
                                        <OverdropIcon />
                                    </OverdropIconWrapper>
                                )}
                            </SPAAnchor>
                        </LogoContainer>

                        <SearchIconContainer>
                            <IconWrapper>
                                <SearchIcon onClick={() => setShowSearchModal(true)} />
                            </IconWrapper>
                            <ReactModal
                                isOpen={showSearchModal}
                                onRequestClose={() => {
                                    setShowSearchModal(false);
                                }}
                                shouldCloseOnOverlayClick={true}
                                style={customModalStyles}
                            >
                                <SearchContainer>
                                    <Search
                                        text={marketSearch}
                                        handleChange={(value) => {
                                            dispatch(setMarketSearch(value));
                                        }}
                                    />
                                </SearchContainer>
                            </ReactModal>
                        </SearchIconContainer>
                    </WrapperMobile>
                    <MobileButtonWrapper isFullWidth={isConnected}>
                        {!isConnected && (
                            <Button
                                backgroundColor={theme.button.background.quinary}
                                textColor={theme.button.textColor.primary}
                                borderColor={theme.button.borderColor.quinary}
                                additionalStyles={{
                                    borderRadius: '8px',
                                    fontWeight: '800',
                                    fontSize: '12px',
                                    padding: '9px 20px',
                                    width: '120px',
                                    height: '30px',
                                    whiteSpace: 'pre',
                                }}
                                onClick={() => dispatch(setWalletConnectModalVisibility({ visibility: true }))}
                            >
                                {t('get-started.sign-up')}
                            </Button>
                        )}
                        <WalletInfo />
                    </MobileButtonWrapper>
                    {isBiconomy && <ActivateAccount />}
                </>
            )}
            {showThalesToOverMigrationModal && (
                <ThalesToOverMigrationModal onClose={() => setShowThalesToOverMigrationModal(false)} />
            )}
            {connectWalletModalVisibility && (
                <ConnectWalletModal
                    isOpen={connectWalletModalVisibility}
                    onClose={() => {
                        dispatch(setWalletConnectModalVisibility({ visibility: false }));
                    }}
                />
            )}
        </>
    );
};

export default DappHeader;
