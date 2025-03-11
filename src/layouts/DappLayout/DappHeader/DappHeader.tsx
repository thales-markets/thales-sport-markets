import marchMadnessLeftIcon from 'assets/images/march-madness/mm-button-icon-1.svg';
import marchMadnessRightIcon from 'assets/images/march-madness/mm-button-icon-2.svg';
import Button from 'components/Button';
import Logo from 'components/Logo';
import NavMenu from 'components/NavMenu';
import NavMenuMobile from 'components/NavMenuMobile';
import NetworkSwitcher from 'components/NetworkSwitcher';
import OutsideClickHandler from 'components/OutsideClick';
import SPAAnchor from 'components/SPAAnchor';
import Search from 'components/Search';
import Tooltip from 'components/Tooltip';
import WalletInfo from 'components/WalletInfo';
import { OVERDROP_LEVELS } from 'constants/overdrop';
import ROUTES from 'constants/routes';
import useInterval from 'hooks/useInterval';
import useClaimablePositionCountV2Query from 'queries/markets/useClaimablePositionCountV2Query';
import useBlockedGamesQuery from 'queries/resolveBlocker/useBlockedGamesQuery';
import useWhitelistedForUnblock from 'queries/resolveBlocker/useWhitelistedForUnblock';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsMobile } from 'redux/modules/app';
import { getMarketSearch, setMarketSearch } from 'redux/modules/market';
import { getOddsType, getOverdropUIState, getStopPulsing, setOddsType, setStopPulsing } from 'redux/modules/ui';
import { getIsBiconomy, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivEnd } from 'styles/common';
import { RootState } from 'types/redux';
import { OverdropLevel, ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { isMarchMadnessAvailableForNetworkId } from 'utils/marchMadness';
import { buildHref } from 'utils/routes';
import { useAccount, useChainId, useClient } from 'wagmi';
import { ODDS_TYPES } from '../../../constants/markets';
import { OddsType } from '../../../enums/markets';
import ProfileItem from './components/ProfileItem';
import TimeFilters from './components/TimeFilters';
import TopUp from './components/TopUp';
import {
    BlockedGamesNotificationCount,
    Container,
    Count,
    DropDown,
    DropDownItem,
    DropdownContainer,
    HeaderIcon,
    HeaderLabel,
    IconWrapper,
    Label,
    LeftContainer,
    LogoContainer,
    MenuIcon,
    MenuIconContainer,
    MiddleContainer,
    MobileButtonWrapper,
    NotificationCount,
    OverdropButtonContainer,
    OverdropIcon,
    RightContainer,
    SearchContainer,
    SearchIcon,
    SearchIconContainer,
    SettingsContainer,
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
    const location = useLocation();
    const theme: ThemeInterface = useTheme();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const marketSearch = useSelector(getMarketSearch);
    const stopPulsing = useSelector(getStopPulsing);
    const isMobile = useSelector(getIsMobile);
    const overdropUIState = useSelector(getOverdropUIState);
    const selectedOddsType = useSelector(getOddsType);

    const [levelItem, setLevelItem] = useState<OverdropLevel>(OVERDROP_LEVELS[0]);
    const [currentPulsingCount, setCurrentPulsingCount] = useState<number>(0);
    const [navMenuVisibility, setNavMenuVisibility] = useState<boolean | null>(null);
    const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
    const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false);

    const isMarketsPage = location.pathname === ROUTES.Home || location.pathname === ROUTES.Markets.Home;

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

    const setSelectedOddsType = useCallback(
        (oddsType: OddsType) => {
            return dispatch(setOddsType(oddsType));
        },
        [dispatch]
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
        const overdropStateItem = overdropUIState.find(
            (item) => item.walletAddress?.toLowerCase() == walletAddress.toLowerCase()
        );

        const currentLevelItem = overdropStateItem
            ? OVERDROP_LEVELS.find((item) => item.level == overdropStateItem?.currentLevel)
            : OVERDROP_LEVELS[0];
        if (currentLevelItem) setLevelItem(currentLevelItem);
    }, [dispatch, walletAddress, overdropUIState]);

    const menuImageRef = useRef<HTMLImageElement>(null);

    const getMarchMadnessButton = () => (
        <MarchMadnessWrapper>
            <SPAAnchor href={buildHref(ROUTES.MarchMadness)}>
                <Button
                    fontSize="18px"
                    width={isMobile ? '100%' : '240px'}
                    additionalStyles={{
                        background: `url(${marchMadnessLeftIcon}) left ${
                            isMobile ? 70 : 20
                        }px center no-repeat, url(${marchMadnessRightIcon}) right ${
                            isMobile ? 70 : 20
                        }px center no-repeat`,
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

    const showGetStartedButton = false; // TODO: show Get Started after March Madness
    const getGetStartedButton = () => (
        <SPAAnchor style={{ width: isMobile ? '100%' : 'fit-content' }} href={buildHref(ROUTES.Wizard)}>
            <Button
                backgroundColor={theme.background.primary}
                textColor={theme.button.textColor.quaternary}
                borderColor={theme.button.borderColor.secondary}
                width="100%"
                fontWeight="400"
                additionalStyles={{
                    borderRadius: '20px',
                    fontWeight: '600',
                    fontSize: isMobile ? '12px' : '14px',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap',
                }}
                height="28px"
            >
                {t('get-started.get-started')}
            </Button>
        </SPAAnchor>
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
                        {showGetStartedButton && (
                            <div>{!isConnected ? getGetStartedButton() : isBiconomy ? <TopUp /> : <></>}</div>
                        )}
                        {isMarketsPage && <TimeFilters />}
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
                            {isConnected && <ProfileItem />}
                            <OutsideClickHandler onOutsideClick={() => setDropdownIsOpen(false)}>
                                <SettingsContainer
                                    onClick={() => {
                                        setDropdownIsOpen(!dropdownIsOpen);
                                    }}
                                >
                                    <HeaderIcon className="icon icon--settings" />
                                    <HeaderLabel>{t('common.settings')}</HeaderLabel>
                                    {dropdownIsOpen && (
                                        <DropdownContainer>
                                            <DropDown>
                                                {ODDS_TYPES.map((item: OddsType, index: number) => (
                                                    <DropDownItem
                                                        key={index}
                                                        isSelected={selectedOddsType === item}
                                                        onClick={() => {
                                                            setSelectedOddsType(item);
                                                            setDropdownIsOpen(false);
                                                        }}
                                                    >
                                                        <FlexDivCentered>
                                                            <Label> {t(`common.odds.${item}`)}</Label>
                                                        </FlexDivCentered>
                                                    </DropDownItem>
                                                ))}
                                            </DropDown>
                                        </DropdownContainer>
                                    )}
                                </SettingsContainer>
                            </OutsideClickHandler>
                        </FlexDivCentered>
                    </MiddleContainer>

                    <RightContainer>
                        {!isConnected && (
                            <Button
                                backgroundColor={'transparent'}
                                textColor={theme.button.borderColor.quaternary}
                                borderColor={theme.button.borderColor.quaternary}
                                width="150px"
                                fontWeight="400"
                                additionalStyles={{
                                    borderRadius: '15.5px',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    marginRight: '10px',
                                }}
                                height="28px"
                                onClick={() =>
                                    dispatch(
                                        setWalletConnectModalVisibility({
                                            visibility: true,
                                        })
                                    )
                                }
                            >
                                {t('get-started.log-in')}
                            </Button>
                        )}
                        {!isConnected && (
                            <Button
                                backgroundColor={theme.button.background.tertiary}
                                textColor={theme.button.textColor.primary}
                                borderColor={theme.button.borderColor.quinary}
                                fontWeight="400"
                                additionalStyles={{
                                    borderRadius: '15.5px',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    marginRight: '5px',
                                    padding: '3px 20px',
                                }}
                                width="150px"
                                height="28px"
                                onClick={() =>
                                    dispatch(
                                        setWalletConnectModalVisibility({
                                            visibility: true,
                                            origin: 'sign-up',
                                        })
                                    )
                                }
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
                        <LogoContainer>
                            <Logo width={150} />
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
                    </WrapperMobile>

                    {isConnected && (
                        <FlexDivCentered>
                            <WalletInfo />
                        </FlexDivCentered>
                    )}

                    {!isConnected ? (
                        <MobileButtonWrapper>
                            <Button
                                backgroundColor={'transparent'}
                                textColor={theme.button.textColor.quaternary}
                                borderColor={theme.button.borderColor.secondary}
                                width="100%"
                                fontWeight="400"
                                additionalStyles={{
                                    maxWidth: 400,
                                    borderRadius: '15.5px',
                                    fontWeight: '600',
                                    fontSize: '12px',
                                    textTransform: 'capitalize',
                                    whiteSpace: 'nowrap',
                                }}
                                height="28px"
                                onClick={() =>
                                    dispatch(
                                        setWalletConnectModalVisibility({
                                            visibility: true,
                                        })
                                    )
                                }
                            >
                                {t('get-started.log-in')}
                            </Button>

                            <Button
                                backgroundColor={theme.button.background.quaternary}
                                textColor={theme.button.textColor.primary}
                                borderColor={theme.button.borderColor.secondary}
                                fontWeight="400"
                                additionalStyles={{
                                    maxWidth: 400,
                                    borderRadius: '15.5px',
                                    fontWeight: '600',
                                    fontSize: '12px',
                                    textTransform: 'capitalize',
                                    whiteSpace: 'nowrap',
                                }}
                                width="100%"
                                height="28px"
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
                            {showGetStartedButton && location.pathname !== ROUTES.Wizard && getGetStartedButton()}
                            <FlexDivEnd>
                                <NetworkSwitcher />
                            </FlexDivEnd>
                        </MobileButtonWrapper>
                    ) : (
                        (isBiconomy || showGetStartedButton) && (
                            <MobileButtonWrapper>
                                {location.pathname !== ROUTES.Wizard && getGetStartedButton()}
                                <TopUp />
                            </MobileButtonWrapper>
                        )
                    )}

                    {location.pathname !== ROUTES.MarchMadness && getMarchMadnessButton()}
                </>
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
