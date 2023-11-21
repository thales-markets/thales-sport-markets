import React, { useEffect, useState } from 'react';
import { Container } from './styled-components';

import WrapperNavigation from './components/WrapperNavigation';
import MyTickets from './components/MyTickets';
import MyPortfolio from './components/MyPortfolio';
import useQueryParam, { getQueryStringVal } from 'utils/useQueryParams';

const Profile: React.FC = () => {
    const selectedTabFromQuery = getQueryStringVal('selected-tab');

    const [tabIndex, setTabIndex] = useState<number>(0);
    const [, setSelectedTab] = useQueryParam('selected-tab', '0');

    const handleTabChange = (index: number) => {
        setTabIndex(index);
        setSelectedTab(index.toString());
    };

    useEffect(() => {
        if (selectedTabFromQuery !== tabIndex.toString()) {
            setTabIndex(Number(selectedTabFromQuery));
        }
    }, [selectedTabFromQuery, tabIndex]);

    return (
        <Container>
            <WrapperNavigation tabIndex={tabIndex} onChangeTab={(index) => handleTabChange(index)} />
            {tabIndex == 0 && <MyTickets />}
            {tabIndex == 1 && <MyPortfolio />}
        </Container>
    );
};

export default Profile;
