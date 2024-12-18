import React, { useEffect, useState } from 'react';
import { Container } from './styled-components';

import { ProfileTab } from 'enums/ui';
import { useSelector } from 'react-redux';
import { getIsConnectedViaParticle } from 'redux/modules/wallet';
import { RootState } from 'types/redux';
import useQueryParam from 'utils/useQueryParams';
import MyPortfolio from './components/MyPortfolio';
import MyTickets from './components/MyTickets';
import WrapperNavigation from './components/WrapperNavigation';

const Profile: React.FC = () => {
    const isConnectedViaParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));
    const [selectedTabParam, setSelectedTabParam] = useQueryParam('selected-tab', ProfileTab.OPEN_CLAIMABLE);
    const [selectedTab, setSelectedTab] = useState<ProfileTab>(ProfileTab.OPEN_CLAIMABLE);

    useEffect(() => {
        if (Object.values(ProfileTab).includes(selectedTabParam.toLowerCase() as ProfileTab)) {
            setSelectedTab(selectedTabParam.toLowerCase() as ProfileTab);
        } else {
            setSelectedTab(ProfileTab.OPEN_CLAIMABLE);
        }
    }, [selectedTabParam]);

    const handleTabChange = (tab: ProfileTab) => {
        setSelectedTab(tab);
        setSelectedTabParam(tab);
    };

    return (
        <Container>
            {isConnectedViaParticle ? (
                <>
                    <WrapperNavigation selectedTab={selectedTab} setSelectedTab={handleTabChange} />
                    {selectedTab !== ProfileTab.MY_PORTFOLIO && (
                        <MyTickets selectedTab={selectedTab} setSelectedTab={handleTabChange} />
                    )}
                    {selectedTab === ProfileTab.MY_PORTFOLIO && <MyPortfolio />}
                </>
            ) : (
                <MyTickets selectedTab={selectedTab} setSelectedTab={handleTabChange} />
            )}
        </Container>
    );
};

export default Profile;
