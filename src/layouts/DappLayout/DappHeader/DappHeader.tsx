import GetUsd from 'components/GetUsd';
import Logo from 'components/Logo';
import WalletInfo from 'components/WalletInfo';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';
import { NetworkIdByName } from 'utils/network';
import { getNetworkId } from 'redux/modules/wallet';
import Referral from 'components/Referral';
import { buildHref } from 'utils/routes';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import sportTriviaIcon from 'assets/images/sport-trivia.svg';
import LanguageSelector from 'components/LanguageSelector';
import { getStopPulsing, setStopPulsing } from 'redux/modules/ui';
import useInterval from 'hooks/useInterval';
import MintVoucher from 'components/MintVoucher';

const PULSING_COUNT = 10;

const DappHeader: React.FC = () => {
    const dispatch = useDispatch();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const stopPulsing = useSelector((state: RootState) => getStopPulsing(state));
    const [currentPulsingCount, setCurrentPulsingCount] = useState<number>(0);

    useInterval(async () => {
        if (!stopPulsing) {
            setCurrentPulsingCount(currentPulsingCount + 1);
            if (currentPulsingCount >= PULSING_COUNT) {
                dispatch(setStopPulsing(true));
            }
        }
    }, 1000);

    return (
        <Container>
            <Logo />
            <RightContainer>
                <SPAAnchor href={buildHref(ROUTES.Quiz)}>
                    <StyledSportTriviaIcon stopPulsing={stopPulsing} src={sportTriviaIcon} />
                </SPAAnchor>
                <Referral />
                {networkId === NetworkIdByName.OptimismMainnet && <GetUsd />}
                <MintVoucher />
                <LanguageSelector />
                <WalletInfo />
            </RightContainer>
        </Container>
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

const StyledSportTriviaIcon = styled.img<{ stopPulsing: boolean }>`
    margin-right: 20px;
    cursor: pointer;
    height: 36px;
    margin-bottom: -4px;
    @media (max-width: 767px) {
        margin-bottom: 5px;
        margin-right: 0px;
    }
    animation: ${(props) => (props.stopPulsing ? 'none' : 'pulsing 1s ease-in')};
    animation-iteration-count: 10;
`;

export default DappHeader;
