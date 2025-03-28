import marchMadnessLeftIcon from 'assets/images/march-madness/mm-button-icon-1.svg';
import marchMadnessRightIcon from 'assets/images/march-madness/mm-button-icon-2.svg';
import ActivateAccount from 'components/ActivateAccount';
import Button from 'components/Button';
import Logo from 'components/Logo';
import NavMenu from 'components/NavMenu';
import NavMenuMobile from 'components/NavMenuMobile';
import SPAAnchor from 'components/SPAAnchor';
import Search from 'components/Search';
import ThalesToOverMigrationModal from 'components/ThalesToOverMigrationModal';
import Tooltip from 'components/Tooltip';
import WalletInfo from 'components/WalletInfo';
import { OVERDROP_LEVELS } from 'constants/overdrop';
import ROUTES from 'constants/routes';
import useInterval from 'hooks/useInterval';
import useClaimablePositionCountV2Query from 'queries/markets/useClaimablePositionCountV2Query';
import useBlockedGamesQuery from 'queries/resolveBlocker/useBlockedGamesQuery';
import useWhitelistedForUnblock from 'queries/resolveBlocker/useWhitelistedForUnblock';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getMarketSearch, setMarketSearch } from 'redux/modules/market';
import { getOverdropUIState, getStopPulsing, setStopPulsing } from 'redux/modules/ui';
import { getIsBiconomy, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { RootState } from 'types/redux';
import { OverdropLevel, ThemeInterface } from 'types/ui';
import { isMarchMadnessAvailableForNetworkId } from 'utils/marchMadness';
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
    NotificationCount,
    OverdropButtonContainer,
    OverdropIcon,
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
        zIndex: '5',
    },
};

const DappHeader: React.FC = () => {
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const marketSearch = useSelector(getMarketSearch);
    const stopPulsing = useSelector(getStopPulsing);
    const isMobile = useSelector(getIsMobile);
    const overdropUIState = useSelector(getOverdropUIState);

    const [levelItem, setLevelItem] = useState<OverdropLevel>(OVERDROP_LEVELS[0]);
    const [currentPulsingCount, setCurrentPulsingCount] = useState<number>(0);
    const [navMenuVisibility, setNavMenuVisibility] = useState<boolean | null>(null);
    const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
    const [showThalesToOverMigrationModal, setShowThalesToOverMigrationModal] = useState<boolean>(false);

    const claimablePositionsCountQuery = useClaimablePositionCountV2Query(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const claimablePositionCount =
        claimablePositionsCountQuery.isSuccess && claimablePositionsCountQuery.data
            ? claimablePositionsCountQuery.data
            : null;

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
        }
    }, [dispatch, address, overdropUIState]);

    const menuImageRef = useRef<HTMLImageElement>(null);

    const getMarchMadnessButton = () => (
        <MarchMadnessWrapper>
            <SPAAnchor href={buildHref(ROUTES.MarchMadness)}>
                <Button
                    fontSize="18px"
                    width={isMobile ? '100%' : '240px'}
                    margin="0 10px 0 0"
                    additionalStyles={{
                        backgroundImage: `url("${marchMadnessLeftIcon}"), url("${marchMadnessRightIcon}")`,
                        backgroundPosition: `left ${isMobile ? 70 : 20}px center, right ${isMobile ? 70 : 20}px center`,
                        backgroundRepeat: 'no-repeat, no-repeat',
                        backgroundColor: theme.marchMadness.button.background.primary,
                        backgroundSize: '28px, 28px',
                        border: 'none',
                        borderRadius: isMobile ? '20px' : undefined,
                        fontFamily: "'NCAA' !important",
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        color: theme.marchMadness.button.textColor.secondary,
                    }}
                >
                    {t('markets.nav-menu.labels.march-madness')}
                </Button>
            </SPAAnchor>
        </MarchMadnessWrapper>
    );

    return (
        <>
            {!isMobile && (
                <Container>
                    <LeftContainer>
                        <Logo />
                    </LeftContainer>

                    <MiddleContainer>
                        {location.pathname !== ROUTES.MarchMadness &&
                            (isMarchMadnessAvailableForNetworkId(networkId) ? (
                                getMarchMadnessButton()
                            ) : (
                                <Tooltip
                                    overlay={t('march-madness.header-button-tooltip')}
                                    open={isMarchMadnessAvailableForNetworkId(networkId)}
                                >
                                    {getMarchMadnessButton()}
                                </Tooltip>
                            ))}
                        <FlexDivCentered>
                            <SPAAnchor style={{ display: 'flex' }} href={buildHref(ROUTES.Overdrop)}>
                                {levelItem.level > 0 ? (
                                    <OverdropButtonContainer>
                                        <SmallBadgeImage src={levelItem.smallBadge} />
                                        {`LVL ${levelItem.level} ${levelItem.levelName}`}
                                    </OverdropButtonContainer>
                                ) : (
                                    <OverdropIcon />
                                )}
                            </SPAAnchor>
                        </FlexDivCentered>
                        {isConnected && (
                            <Button
                                onClick={() => setShowThalesToOverMigrationModal(true)}
                                backgroundColor={theme.button.textColor.quaternary}
                                borderColor={theme.button.textColor.quaternary}
                                fontSize="14px"
                                height="30px"
                                padding="2px 10px"
                            >
                                Migrate <CurrencyIcon className="currency-icon currency-icon--thales" /> to{' '}
                                <CurrencyIcon className="currency-icon currency-icon--over" />
                            </Button>
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
                                    whiteSpace: 'pre',
                                }}
                                onClick={() =>
                                    dispatch(
                                        setWalletConnectModalVisibility({
                                            visibility: true,
                                        })
                                    )
                                }
                            >
                                {t('get-started.sign-up')}
                            </Button>
                        )}
                        {isConnected && isBiconomy && <ActivateAccount />}
                        {isConnected && (
                            <SPAAnchor href={ROUTES.Profile + '?selected-tab=open-claimable'}>
                                <FlexDivCentered>
                                    <ProfileIconWidget /> <ProfileLabel>{t('common.profile')}</ProfileLabel>
                                </FlexDivCentered>
                            </SPAAnchor>
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
                            {claimablePositionCount && (
                                <NotificationCount>
                                    <Count>{claimablePositionCount}</Count>
                                </NotificationCount>
                            )}
                            {blockedGamesCount > 0 && (
                                <BlockedGamesNotificationCount>
                                    <Count>{blockedGamesCount}</Count>
                                </BlockedGamesNotificationCount>
                            )}
                            <NavMenuMobile
                                visibility={navMenuVisibility}
                                setNavMenuVisibility={(value: boolean | null) => setNavMenuVisibility(value)}
                            />
                        </MenuIconContainer>

                        <LogoContainer>
                            <Logo />
                            {!isConnected ? (
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
                                    }}
                                    onClick={() =>
                                        dispatch(
                                            setWalletConnectModalVisibility({
                                                visibility: true,
                                            })
                                        )
                                    }
                                >
                                    {t('get-started.sign-up')}
                                </Button>
                            ) : (
                                <SPAAnchor style={{ display: 'flex' }} href={buildHref(ROUTES.Overdrop)}>
                                    {levelItem.level > 0 ? (
                                        <OverdropButtonContainer>
                                            <SmallBadgeImage src={levelItem.smallBadge} />
                                            {`LVL ${levelItem.level} ${levelItem.levelName}`}
                                        </OverdropButtonContainer>
                                    ) : (
                                        <OverdropIcon />
                                    )}
                                </SPAAnchor>
                            )}
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
                    {isBiconomy && <ActivateAccount />}

                    {location.pathname !== ROUTES.MarchMadness && getMarchMadnessButton()}
                </>
            )}
            {showThalesToOverMigrationModal && (
                <ThalesToOverMigrationModal onClose={() => setShowThalesToOverMigrationModal(false)} />
            )}
        </>
    );
};

const MarchMadnessWrapper = styled.div`
    @media (max-width: 767px) {
        width: 100%;
        margin: 10px 0 0 0;
    }
`;

export default DappHeader;
