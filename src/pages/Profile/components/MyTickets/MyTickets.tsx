import ROUTES from 'constants/routes';
import { NavigationWrapper } from 'pages/Profile/styled-components';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { navigateTo } from 'utils/routes';
import { getQueryStringVal } from 'utils/useQueryParams';
import { navItems } from '../../components/NavigationBar/NavigationBar';
import SearchField from '../../components/SearchField';
import UserVaults from '../../components/UserVaults';
import Voucher from '../../components/Voucher';
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
        <>
            <UserStatsV2 />
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
            {navItems[3].id == navItem && <Voucher searchText={searchText} />}
        </>
    );
};

export default MyTickets;
