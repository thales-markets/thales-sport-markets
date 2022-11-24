import { useLocation } from 'react-router-dom';
import Logo from 'components/Logo';
import WalletInfo from 'components/WalletInfo';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FlexDiv, FlexDivCentered, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { buildHref } from 'utils/routes';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { getStopPulsing, setStopPulsing } from 'redux/modules/ui';
import useInterval from 'hooks/useInterval';
import burger from 'assets/images/burger.svg';
import NavMenu from 'components/NavMenu';
import ProfileItem from './components/ProfileItem';
import { getIsMobile } from 'redux/modules/app';
import MintVoucher from 'components/MintVoucher';

const PULSING_COUNT = 10;

const DappHeader: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const location = useLocation();

    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const stopPulsing = useSelector((state: RootState) => getStopPulsing(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [currentPulsingCount, setCurrentPulsingCount] = useState<number>(0);
    const [navMenuVisibility, setNavMenuVisibility] = useState<boolean | null>(null);

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
                        {location.pathname !== ROUTES.MintWorldCupNFT && (
                            <SPAAnchor href={buildHref(ROUTES.MintWorldCupNFT)}>
                                <StyledButton style={{ marginRight: '10px' }} disabled={!isWalletConnected}>
                                    <FlexDiv>
                                        <FifaIcon className="icon icon--fifa-world-cup" />
                                        {t('mint-world-cup-nft.zebro-campaign')}
                                    </FlexDiv>
                                </StyledButton>
                            </SPAAnchor>
                        )}
                        {location.pathname !== ROUTES.MintWorldCupNFT && <MintVoucher />}
                        <WalletInfo />
                        <ProfileItem />
                        <MenuIcon
                            onClick={() => setNavMenuVisibility(true)}
                            data-matomo-category="dapp-header"
                            data-matomo-action="menu-icon"
                        />
                        <NavMenu
                            visibility={navMenuVisibility}
                            hideVisibilityFunction={(value: boolean | null) => setNavMenuVisibility(value)}
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
                        <MenuIconContainer>
                            <MenuIcon onClick={() => setNavMenuVisibility(true)} />
                            <NavMenu
                                visibility={navMenuVisibility}
                                hideVisibilityFunction={(value: boolean | null) => setNavMenuVisibility(value)}
                            />
                        </MenuIconContainer>
                        <MobileProfileContainer>
                            <ProfileItem avatarSize={30} labelHidden={true} />
                        </MobileProfileContainer>
                    </WrapperMobile>
                    {location.pathname !== ROUTES.MintWorldCupNFT && (
                        <div style={{ width: '100%' }}>
                            <SPAAnchor href={buildHref(ROUTES.MintWorldCupNFT)}>
                                <StyledButton style={{ width: '100%', padding: '5px' }} disabled={!isWalletConnected}>
                                    <FlexDivCentered>
                                        <FifaIcon className="icon icon--fifa-world-cup" />
                                        {t('mint-world-cup-nft.zebro-campaign')}
                                    </FlexDivCentered>
                                </StyledButton>
                            </SPAAnchor>
                        </div>
                    )}
                    {location.pathname !== ROUTES.MintWorldCupNFT && (
                        <MintVoucher
                            buttonStyle={{ padding: '7px', background: '#303656' }}
                            style={{ marginTop: '10px' }}
                        />
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
    width: 50%;
    display: flex;
    justify-content: end;
    position: absolute;
    right: 12px;
    margin-top: 10px;
`;

const MobileProfileContainer = styled.div`
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

const StyledButton = styled.button<{ disabled?: boolean }>`
    background: #891538;
    border: 2px solid #891538;
    color: white;
    border-radius: 5px;
    padding: 0 60px 0 75px;
    font-weight: 800;
    font-size: 15px;
    line-height: 18px;
    text-transform: uppercase;
    text-align: center;
    outline: none;
    cursor: pointer;
    min-height: 28px;
    width: fit-content;
    white-space: nowrap;
    position: relative;
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
    &:hover {
        cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
        opacity: ${(props) => (props.disabled ? '0.4' : '0.8')};
    }
`;

const FifaIcon = styled.i`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 35px;
    margin-right: 10px;
    font-weight: 400;
    text-transform: none;
`;

export default DappHeader;
