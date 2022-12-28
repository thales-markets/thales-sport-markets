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
import { Trans } from 'react-i18next';
import SPAAnchor from 'components/SPAAnchor';
import { buildHref } from 'utils/routes';
import ROUTES from 'constants/routes';

const Profile: React.FC = () => {
    const navItemFromQuery = getQueryStringVal('nav-item');
    const [navItem, setNavItem] = useState<number>(navItemFromQuery ? Number(navItemFromQuery) : 1);
    const [searchText, setSearchText] = useState<string>('');
    const [openPositionsValue, setOpenPositionsValue] = useState<number>(0);

    return (
        <Container>
            <Info>
                <Trans
                    i18nKey="rewards.op-rewards-banner-message"
                    components={{
                        bold: <SPAAnchor href={buildHref(ROUTES.Rewards)} />,
                    }}
                />
            </Info>
            <UserStats openPositionsValue={openPositionsValue} />
            <NavigationWrapper>
                <NavigationBar itemSelected={navItem} onSelectItem={(index) => setNavItem(index)} />
                <SearchField text={searchText} handleChange={(value) => setSearchText(value)} />
            </NavigationWrapper>
            {navItems[0].id == navItem && (
                <Positions setOpenPositionsValue={setOpenPositionsValue} searchText={searchText} />
            )}
            {navItems[1].id == navItem && <TransactionsHistory searchText={searchText} />}
        </Container>
    );
};

export default Profile;
