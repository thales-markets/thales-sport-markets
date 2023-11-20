import React, { useEffect, useState } from 'react';
import Positions from '../../components/Positions';
import { navItems } from '../../components/NavigationBar/NavigationBar';
import TransactionsHistory from '../../components/TransactionsHistory';
import UserStats from '../../components/UserStats';
import { getQueryStringVal } from 'utils/useQueryParams';
import SearchField from '../../components/SearchField';
import { useTranslation } from 'react-i18next';
import { navigateTo } from 'utils/routes';
import ROUTES from 'constants/routes';
import { useDispatch, useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import UserVaults from '../../components/UserVaults';
import Voucher from '../../components/Voucher';
import useSGPFeesQuery from 'queries/markets/useSGPFeesQuery';
import { setSGPFees } from 'redux/modules/parlay';
import { NavigationWrapper } from 'pages/Profile/styled-components';
import NavigationBar from '../NavigationBar';

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
            {navItems[0].id == navItem && <Positions searchText={searchText} />}
            {navItems[1].id == navItem && <TransactionsHistory searchText={searchText} />}
            {navItems[2].id == navItem && <UserVaults />}
            {navItems[3].id == navItem && <Voucher searchText={searchText} />}
        </>
    );
};

export default MyTickets;
