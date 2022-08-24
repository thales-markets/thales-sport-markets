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
import LanguageSelector from 'components/LanguageSelector';

const DappHeader: React.FC = () => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    return (
        <Container>
            <Logo />
            <RightContainer>
                <Referral />
                {networkId === NetworkIdByName.OptimismMainnet && <GetUsd />}
                <LanguageSelector />
                <WalletInfo />
            </RightContainer>
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)`
    width: 100%;
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

export default DappHeader;
