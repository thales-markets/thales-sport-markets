// import { useLocation } from 'react-router-dom';
import Logo from 'components/Logo';
import WalletInfo from 'components/WalletInfo';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { NetworkIdByName } from 'utils/network';
import { getIsWalletConnected, getNetworkId } from 'redux/modules/wallet';
// import Referral from 'components/Referral';
import { buildHref } from 'utils/routes';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import LanguageSelector from 'components/LanguageSelector';
import { getStopPulsing, setStopPulsing } from 'redux/modules/ui';
import useInterval from 'hooks/useInterval';
// import MintVoucher from 'components/MintVoucher';
import burger from 'assets/images/burger.svg';
import NavMenu from 'components/NavMenu';
import GetUsd from 'components/GetUsd';
import { isMobile } from 'utils/device';
import ProfileItem from './components/ProfileItem';

const PULSING_COUNT = 10;

const DappHeader: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    // const location = useLocation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const stopPulsing = useSelector((state: RootState) => getStopPulsing(state));
    const [currentPulsingCount, setCurrentPulsingCount] = useState<number>(0);
    const [navMenuVisibility, setNavMenuVisibility] = useState<boolean | null>(null);
    const [isMobileState, setIsMobileState] = useState(false);

    useInterval(async () => {
        if (!stopPulsing) {
            setCurrentPulsingCount(currentPulsingCount + 1);
            if (currentPulsingCount >= PULSING_COUNT) {
                dispatch(setStopPulsing(true));
            }
        }
    }, 1000);

    const handleResize = () => {
        isMobile() ? setIsMobileState(true) : setIsMobileState(false);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>
            {!isMobileState && (
                <Container>
                    <Logo />
                    <RightContainer>
                        {/* <Referral /> */}
                        {isMobileState && networkId === NetworkIdByName.OptimismMainnet && <GetUsd />}
                        {/* {location.pathname !== ROUTES.MintWorldCupNFT && <MintVoucher />} */}
                        <SPAAnchor href={buildHref(ROUTES.MintWorldCupNFT)}>
                            <StyledButton disabled={!isWalletConnected}>
                                {t('mint-world-cup-nft.mint-nft-button')}
                            </StyledButton>
                        </SPAAnchor>
                        {/* <SPAAnchor href={buildHref(ROUTES.Quiz)}>
                            <StyledSportTriviaIcon stopPulsing={stopPulsing} src={sportTriviaIcon} />
                        </SPAAnchor> */}
                        <LanguageSelector />
                        <WalletInfo />
                        <ProfileItem />
                        <MenuIcon onClick={() => setNavMenuVisibility(true)} />
                        {/* {navMenuVisibility && ( */}
                        <NavMenu
                            visibility={navMenuVisibility}
                            hideVisibilityFunction={(value: boolean | null) => setNavMenuVisibility(value)}
                        />
                        {/* )} */}
                    </RightContainer>
                </Container>
            )}
            {isMobileState && (
                <WrapperMobile>
                    <LogoContainer>
                        <Logo />
                    </LogoContainer>
                    <MenuIconContainer>
                        <MenuIcon onClick={() => setNavMenuVisibility(true)} />
                        <NavMenu
                            visibility={navMenuVisibility}
                            hideVisibilityFunction={() => setNavMenuVisibility(false)}
                        />
                    </MenuIconContainer>
                </WrapperMobile>
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

// const StyledSportTriviaIcon = styled.img<{ stopPulsing: boolean }>`
//     margin: 0 20px;
//     cursor: pointer;
//     height: 36px;
//     margin-bottom: -4px;
//     @media (max-width: 767px) {
//         margin-bottom: 5px;
//         margin-right: 0px;
//     }
//     animation: ${(props) => (props.stopPulsing ? 'none' : 'pulsing 1s ease-in')};
//     animation-iteration-count: 10;
// `;

const MenuIcon = styled.img.attrs({ src: burger })`
    cursor: pointer;
`;

const WrapperMobile = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
    justify-content: center;
`;

const MenuIconContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: end;
    position: absolute;
    right: 12px;
`;

const LogoContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;

const StyledButton = styled.button<{ disabled?: boolean }>`
    background: ${(props) => props.theme.button.background.secondary};
    border: 2px solid ${(props) => props.theme.button.borderColor.secondary};
    color: ${(props) => props.theme.button.textColor.quaternary};
    border-radius: 5px;
    padding: 1px 20px 0px 20px;
    font-style: normal;
    font-weight: 400;
    font-size: 12.5px;
    text-align: center;
    outline: none;
    text-transform: none;
    cursor: pointer;
    min-height: 28px;
    width: fit-content;
    white-space: nowrap;
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
    &:hover {
        cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
        opacity: ${(props) => (props.disabled ? '0.4' : '0.8')};
    }
`;

export default DappHeader;
