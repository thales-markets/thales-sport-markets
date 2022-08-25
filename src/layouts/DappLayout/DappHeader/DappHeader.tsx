import GetUsd from 'components/GetUsd';
import Logo from 'components/Logo';
import WalletInfo from 'components/WalletInfo';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';
import { NetworkIdByName } from 'utils/network';
import { getNetworkId } from 'redux/modules/wallet';
import Referral from 'components/Referral';
import { buildHref } from 'utils/routes';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { ReactComponent as SportTriviaIcon } from 'assets/images/sport-trivia.svg';

const DappHeader: React.FC = () => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    return (
        <Container>
            <Logo />
            <RightContainer>
                <SPAAnchor href={buildHref(ROUTES.Quiz)}>
                    <StyledSportTriviaIcon />
                </SPAAnchor>
                <Referral />
                {networkId === NetworkIdByName.OptimismMainnet && <GetUsd />}
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

const StyledSportTriviaIcon = styled(SportTriviaIcon)`
    margin-right: 20px;
    cursor: pointer;
    height: 38px;
    margin-bottom: -4px;
    @media (max-width: 767px) {
        margin-bottom: 5px;
        margin-right: 0px;
    }
`;

export default DappHeader;
