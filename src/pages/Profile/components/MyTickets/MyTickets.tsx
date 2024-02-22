import ROUTES from 'constants/routes';
import { NavigationWrapper } from 'pages/Profile/styled-components';
import useSGPFeesQuery from 'queries/markets/useSGPFeesQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setSGPFees } from 'redux/modules/parlay';
import { getIsWalletConnected, getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { navigateTo } from 'utils/routes';
import { getQueryStringVal } from 'utils/useQueryParams';
import { navItems } from '../../components/NavigationBar/NavigationBar';
import SearchField from '../../components/SearchField';
import UserStats from '../../components/UserStats';
import UserVaults from '../../components/UserVaults';
import Voucher from '../../components/Voucher';
import NavigationBar from '../NavigationBar';
import PositionsV2 from '../PositionsV2';
import TicketTransactions from '../TicketTransactions';

const MyTickets: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navItemFromQuery = getQueryStringVal('nav-item');
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const [navItem, setNavItem] = useState<number>(navItemFromQuery ? Number(navItemFromQuery) : 1);
    const [searchText, setSearchText] = useState<string>('');

    useEffect(() => {
        !isWalletConnected && navigateTo(ROUTES.Markets.Home);
    }, [isWalletConnected]);

    const sgpFees = useSGPFeesQuery(networkId, {
        enabled: isWalletConnected,
    });

    useEffect(() => {
        if (sgpFees.isSuccess && sgpFees.data) {
            dispatch(setSGPFees(sgpFees.data));
        }
    }, [dispatch, sgpFees.data, sgpFees.isSuccess]);

    return (
        <>
            <UserStats />
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
