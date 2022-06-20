import GetUsd from 'components/GetUsd';
import Logo from 'components/Logo';
import Search from 'components/Search';
import WalletInfo from 'components/WalletInfo';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMarketSearch, setMarketSearch } from 'redux/modules/market';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';

type DappHeaderProps = {
    showSearch?: boolean;
};

const DappHeader: React.FC<DappHeaderProps> = ({ showSearch }) => {
    const dispatch = useDispatch();
    const marketSearch = useSelector((state: RootState) => getMarketSearch(state));

    return (
        <Container>
            <Logo />
            <RightContainer>
                {showSearch && (
                    <Search text={marketSearch} handleChange={(value) => dispatch(setMarketSearch(value))} />
                )}
                <GetUsd />
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
