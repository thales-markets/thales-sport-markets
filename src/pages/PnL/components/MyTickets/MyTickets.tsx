import { PnlTab } from 'enums/ui';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { LiquidityPoolCollateral } from '../../../../enums/liquidityPool';
import NavigationBar from '../NavigationBar';
import TicketTransactions from '../TicketTransactions';
import UserPnl from '../UserPnl';
import UserStatsV2 from '../UserStatsV2';

type MyTicketsProps = {
    selectedTab: PnlTab;
    setSelectedTab: (tab: PnlTab) => void;
};

const MyTickets: React.FC<MyTicketsProps> = ({ selectedTab, setSelectedTab }) => {
    const isMobile = useSelector(getIsMobile);

    return (
        <RowContainer>
            <MainContainer>
                <NavigationWrapper>
                    <Header>
                        {!isMobile && <NavigationBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />}
                    </Header>
                    {isMobile && <NavigationBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />}
                </NavigationWrapper>
                {selectedTab == PnlTab.LP_STATS && <UserStatsV2 />}
                {selectedTab == PnlTab.USDC_USER_PNL && <UserPnl lpCollateral={LiquidityPoolCollateral.USDC} />}
                {selectedTab == PnlTab.WETH_USER_PNL && <UserPnl lpCollateral={LiquidityPoolCollateral.WETH} />}
                {selectedTab == PnlTab.THALES_USER_PNL && <UserPnl lpCollateral={LiquidityPoolCollateral.THALES} />}
                {selectedTab == PnlTab.USDC_TICKETS && (
                    <TicketTransactions lpCollateral={LiquidityPoolCollateral.USDC} />
                )}
                {selectedTab == PnlTab.WETH_TICKETS && (
                    <TicketTransactions lpCollateral={LiquidityPoolCollateral.WETH} />
                )}
                {selectedTab == PnlTab.THALES_TICKETS && (
                    <TicketTransactions lpCollateral={LiquidityPoolCollateral.THALES} />
                )}
            </MainContainer>
        </RowContainer>
    );
};

const RowContainer = styled(FlexDivRow)`
    width: 100%;
    flex: 1 1 0%;
    flex-direction: row;
    justify-content: center;
`;

const MainContainer = styled(FlexDivColumn)`
    width: 100%;
    max-width: 806px;
    flex-grow: 1;
    margin: 0 25px;
    @media (max-width: 1499px) {
        margin: 0 12px;
    }
    @media (max-width: 1199px) {
        margin: 0 10px;
    }
    @media (max-width: 950px) {
        margin: 0;
        width: 100%;
    }
`;

const NavigationWrapper = styled(FlexDivRow)`
    width: 100%;
    margin-bottom: 15px;
    @media (max-width: 950px) {
        flex-direction: column;
    }
`;

const Header = styled(FlexDivRow)`
    width: 100%;
    @media (max-width: 950px) {
        margin-bottom: 15px;
    }
`;

export default MyTickets;
