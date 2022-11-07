import React, { useState } from 'react';
import NavigationBar from './components/NavigationBar';
import { Container } from './styled-components';
import Positions from './components/Positions';
import { navItems } from './components/NavigationBar/NavigationBar';
import TransactionsHistory from './components/TransactionsHistory';
import UserStats from './components/UserStats';
import { getQueryStringVal } from 'utils/useQueryParams';

const Profile: React.FC = () => {
    const navItemFromQuery = getQueryStringVal('nav-item');
    const [navItem, setNavItem] = useState<number>(navItemFromQuery ? Number(navItemFromQuery) : 1);

    return (
        <Container>
            <UserStats />
            <NavigationBar itemSelected={navItem} onSelectItem={(index) => setNavItem(index)} />
            {navItems[0].id == navItem && <Positions />}
            {navItems[1].id == navItem && <TransactionsHistory />}
        </Container>
    );
};

export default Profile;
