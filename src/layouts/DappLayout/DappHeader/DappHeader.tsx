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

const DappHeader: React.FC = () => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    return (
        <Container>
            <Logo />
            <RightContainer>
                <SPAAnchor href={buildHref(ROUTES.Quiz)}>
                    <StartQuizIcon />
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

const StartQuizIcon = styled.i`
    font-size: 120px;
    margin-right: 20px;
    cursor: pointer;
    max-height: 25px;
    top: -48px;
    display: flex;
    position: relative;
    &:before {
        font-family: OvertimeIcons !important;
        content: '\\0051';
        color: #50ce99;
    }
    @media (max-width: 767px) {
        flex-direction: column;
        margin-bottom: 20px;
        margin-right: 0px;
    }
`;

export default DappHeader;
