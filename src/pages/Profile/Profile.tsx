import React, { useState } from 'react';
import NavigationBar from './components/NavigationBar';
import { Container, NavigationWrapper } from './styled-components';
import Positions from './components/Positions';
import { navItems } from './components/NavigationBar/NavigationBar';
import TransactionsHistory from './components/TransactionsHistory';
import UserStats from './components/UserStats';
import { getQueryStringVal } from 'utils/useQueryParams';
import SearchField from './components/SearchField';

const Profile: React.FC = () => {
    const navItemFromQuery = getQueryStringVal('nav-item');
    const [navItem, setNavItem] = useState<number>(navItemFromQuery ? Number(navItemFromQuery) : 1);
    const [searchText, setSearchText] = useState<string>('');
    return (
        <Container>
            <UserStats />
            <NavigationWrapper>
                <NavigationBar itemSelected={navItem} onSelectItem={(index) => setNavItem(index)} />
                <SearchField text={searchText} handleChange={(value) => setSearchText(value)} />
            </NavigationWrapper>
            {navItems[0].id == navItem && <Positions searchText={searchText} />}
            {navItems[1].id == navItem && <TransactionsHistory searchText={searchText} />}
        </Container>
    );
};

export default Profile;
