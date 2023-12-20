import React, { useEffect, useState } from 'react';
import { Container } from './styled-components';

import { useSelector } from 'react-redux';
import { getIsConnectedViaParticle } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import useQueryParam, { getQueryStringVal } from 'utils/useQueryParams';
import MyPortfolio from './components/MyPortfolio';
import MyTickets from './components/MyTickets';
import WrapperNavigation from './components/WrapperNavigation';

const Profile: React.FC = () => {
    const selectedTabFromQuery = getQueryStringVal('selected-tab');
    const isConnectedViaParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));

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
            {isConnectedViaParticle ? (
                <>
                    <WrapperNavigation tabIndex={tabIndex} onChangeTab={(index) => handleTabChange(index)} />
                    {tabIndex == 0 && <MyTickets />}
                    {tabIndex == 1 && <MyPortfolio />}
                </>
            ) : (
                <MyTickets />
            )}
        </Container>
    );
};

export default Profile;
