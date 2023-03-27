import React, { useState } from 'react';
import NavigationBar from './components/NavigationBar';
import { Container, NavigationWrapper } from './styled-components';
import Positions from './components/Positions';
import { navItems } from './components/NavigationBar/NavigationBar';
import TransactionsHistory from './components/TransactionsHistory';
import UserStats from './components/UserStats';
import { getQueryStringVal } from 'utils/useQueryParams';
import SearchField from './components/SearchField';
import { Info } from 'pages/Markets/Home/Home';
import { Trans, useTranslation } from 'react-i18next';
import SPAAnchor from 'components/SPAAnchor';
import { buildHref } from 'utils/routes';
import ROUTES from 'constants/routes';
import { NetworkIdByName } from 'utils/network';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import UserVaults from './components/UserVaults';
import Voucher from './components/Voucher';

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const navItemFromQuery = getQueryStringVal('nav-item');
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const [navItem, setNavItem] = useState<number>(navItemFromQuery ? Number(navItemFromQuery) : 1);
    const [searchText, setSearchText] = useState<string>('');

    return (
        <Container>
            {networkId !== NetworkIdByName.ArbitrumOne && (
                <Info>
                    <Trans
                        i18nKey="rewards.op-rewards-banner-message"
                        components={{
                            bold: <SPAAnchor href={buildHref(ROUTES.Rewards)} />,
                        }}
                    />
                </Info>
            )}
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
        </Container>
    );
};

export default Profile;
