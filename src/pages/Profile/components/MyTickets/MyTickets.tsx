import ROUTES from 'constants/routes';
import { NavigationWrapper } from 'pages/Profile/styled-components';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { navigateTo } from 'utils/routes';
import { getQueryStringVal } from 'utils/useQueryParams';
import BannerCarousel from '../../../../components/BannerCarousel';
import { FlexDivColumn, FlexDivRow } from '../../../../styles/common';
import { navItems } from '../../components/NavigationBar/NavigationBar';
import SearchField from '../../components/SearchField';
import UserVaults from '../../components/UserVaults';
import NavigationBar from '../NavigationBar';
import PositionsV2 from '../PositionsV2';
import TicketTransactions from '../TicketTransactions';
import UserStatsV2 from '../UserStatsV2';

const MyTickets: React.FC = () => {
    const { t } = useTranslation();
    const navItemFromQuery = getQueryStringVal('nav-item');
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const [navItem, setNavItem] = useState<number>(navItemFromQuery ? Number(navItemFromQuery) : 1);
    const [searchText, setSearchText] = useState<string>('');

    useEffect(() => {
        !isWalletConnected && navigateTo(ROUTES.Markets.Home);
    }, [isWalletConnected]);

    return (
        <RowContainer>
            <SidebarContainer maxWidth={263}>
                <BannerCarousel />
            </SidebarContainer>
            <MainContainer>
                <NavigationWrapper>
                    <NavigationBar itemSelected={navItem} onSelectItem={(index) => setNavItem(index)} />

                    <SearchField
                        disabled={navItems[2].id == navItem}
                        customPlaceholder={t('profile.search-field')}
                        text={searchText}
                        handleChange={(value) => setSearchText(value)}
                    />
                </NavigationWrapper>
                {navItems[0].id == navItem && <PositionsV2 searchText={searchText} />}
                {navItems[1].id == navItem && <TicketTransactions searchText={searchText} />}
                {navItems[2].id == navItem && <UserVaults />}
            </MainContainer>
            <SidebarContainer maxWidth={320}>
                <UserStatsV2 />
            </SidebarContainer>
        </RowContainer>
    );
};

const RowContainer = styled(FlexDivRow)`
    width: 100%;
    flex: 1 1 0%;
    flex-direction: row;
    justify-content: center;
`;

const SidebarContainer = styled(FlexDivColumn)<{ maxWidth: number }>`
    max-width: ${(props) => props.maxWidth}px;
    flex-grow: 1;
    @media (max-width: 950px) {
        display: none;
    }
`;

const MainContainer = styled(FlexDivColumn)`
    width: 100%;
    max-width: 806px;
    flex-grow: 1;
    margin: 0 25px;
`;

export default MyTickets;
