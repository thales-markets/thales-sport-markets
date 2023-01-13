import burger from 'assets/images/burger.svg';
import Button from 'components/Button';
import Logo from 'components/Logo';
import NavMenu from 'components/NavMenu';
import NavMenuMobile from 'components/NavMenuMobile';
import Search from 'components/Search';
import SPAAnchor from 'components/SPAAnchor';
import WalletInfo from 'components/WalletInfo';
import ROUTES from 'constants/routes';
import { MAIN_COLORS } from 'constants/ui';
import useInterval from 'hooks/useInterval';
import useClaimablePositionCountQuery from 'queries/markets/useClaimablePositionCountQuery';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsMobile } from 'redux/modules/app';
import { getMarketSearch, setMarketSearch } from 'redux/modules/market';
import { getStopPulsing, setStopPulsing } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { buildHref } from 'utils/routes';
import ProfileItem from './components/ProfileItem';

const PULSING_COUNT = 10;

const customModalStyles = {
    content: {
        top: '85px',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        width: '100%',
        height: '40px',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: '5',
    },
};

const DappHeader: React.FC = () => {
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const location = useLocation();

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const stopPulsing = useSelector((state: RootState) => getStopPulsing(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [currentPulsingCount, setCurrentPulsingCount] = useState<number>(0);
    const [navMenuVisibility, setNavMenuVisibility] = useState<boolean | null>(null);
    const [showSearcHModal, setShowSearchModal] = useState<boolean>(false);
    const marketSearch = useSelector((state: RootState) => getMarketSearch(state));

    const claimablePositionsCountQuery = useClaimablePositionCountQuery(walletAddress, networkId, {
        enabled: isWalletConnected,
    });

    const claimablePositionCount =
        claimablePositionsCountQuery.isSuccess && claimablePositionsCountQuery.data
            ? claimablePositionsCountQuery.data
            : null;

    useInterval(async () => {
        if (!stopPulsing) {
            setCurrentPulsingCount(currentPulsingCount + 1);
            if (currentPulsingCount >= PULSING_COUNT) {
                dispatch(setStopPulsing(true));
            }
        }
    }, 1000);

    return (
        <>
            {!isMobile && (
                <Container>
                    <Logo />
                    <RightContainer>
                        <SPAAnchor style={{ marginRight: 20 }} href={buildHref(ROUTES.Wizard)}>
                            <Button type="primary" fontSize={12.5}>
                                {t('markets.nav-menu.labels.get-started')}
                            </Button>
                        </SPAAnchor>
                        <WalletInfo />
                        {isWalletConnected && <ProfileItem />}
                        <MenuIcon
                            onClick={() => setNavMenuVisibility(true)}
                            data-matomo-category="dapp-header"
                            data-matomo-action="menu-icon"
                        />
                        <NavMenu
                            visibility={navMenuVisibility}
                            setNavMenuVisibility={(value: boolean | null) => setNavMenuVisibility(value)}
                        />
                    </RightContainer>
                </Container>
            )}
            {isMobile && (
                <>
                    <WrapperMobile>
                        <LogoContainer>
                            <Logo />
                        </LogoContainer>
                        <SearchIconContainer>
                            <IconWrapper>
                                <SearchIcon onClick={() => setShowSearchModal(true)} />
                            </IconWrapper>
                            <ReactModal
                                isOpen={showSearcHModal}
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
                                        isModal
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
                            <NavMenuMobile
                                visibility={navMenuVisibility}
                                setNavMenuVisibility={(value: boolean | null) => setNavMenuVisibility(value)}
                            />
                        </MenuIconContainer>
                    </WrapperMobile>
                    {location.pathname !== ROUTES.Wizard && (
                        <SPAAnchor style={{ width: '100%' }} href={buildHref(ROUTES.Wizard)}>
                            <Button
                                type="primary"
                                style={{ width: '100%', marginTop: '10px', padding: '7px', background: '#303656' }}
                                fontSize={14}
                            >
                                {t('markets.nav-menu.labels.get-started')}
                            </Button>
                        </SPAAnchor>
                    )}
                </>
            )}
        </>
    );
};

const Container = styled(FlexDivRowCentered)`
    width: 100%;
    margin-top: 10px;
    @media (max-width: 767px) {
        flex-direction: column;
    }
    @keyframes pulsing {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.2);
            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;

const RightContainer = styled(FlexDivRowCentered)`
    @media (max-width: 767px) {
        flex-direction: column;
    }
    > div {
        :not(:last-child) {
            margin-right: 20px;
            @media (max-width: 767px) {
                margin-right: 0px;
                margin-bottom: 10px;
            }
        }
    }
`;

const MenuIcon = styled.img.attrs({ src: burger })`
    cursor: pointer;
    height: 25px;
    width: 35px;
    filter: invert(39%) sepia(9%) saturate(1318%) hue-rotate(199deg) brightness(71%) contrast(88%);
`;

const WrapperMobile = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: center;
`;

const SearchIconContainer = styled.div`
    width: 50%;
    display: flex;
    justify-content: end;
    position: absolute;
    right: 12px;
`;

const MenuIconContainer = styled.div`
    width: 50%;
    display: flex;
    justify-content: start;
    position: absolute;
    left: 12px;
    margin-top: 10px;
`;

const LogoContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;

const IconWrapper = styled.div`
    border-radius: 30px;
    background: ${(props) => props.theme.background.tertiary};
    width: 32px;
    height: 32px;
    position: absolute;
    top: -10px;
`;

const SearchIcon = styled.i`
    font-size: 40px;
    cursor: pointer;
    margin-bottom: 3px;
    position: absolute;
    top: -7px;
    left: -6px;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\0042';
        color: ${(props) => props.theme.background.primary};
    }
`;

const SearchContainer = styled.div`
    background: ${(props) => props.theme.background.secondary};
    height: 100%;
    text-align: center;
    margin-right: 2px;
`;

const NotificationCount = styled.div`
    position: absolute;
    border-radius: 50%;
    bottom: -8px;
    left: 24px;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    height: 16px;
    width: 16px;
    background-color: ${MAIN_COLORS.BACKGROUNDS.BLUE};
    box-shadow: ${MAIN_COLORS.SHADOWS.NOTIFICATION};
`;

const Count = styled.span`
    color: ${MAIN_COLORS.DARK_GRAY};
    font-weight: 800;
    font-size: 12px;
`;

export default DappHeader;
