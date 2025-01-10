import React, { useEffect, useState } from 'react';
import { Container } from './styled-components';
import { ProfileTab } from 'enums/ui';
import useQueryParam from 'utils/useQueryParams';
import MyTickets from './components/MyTickets';

const Profile: React.FC = () => {
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
            <MyTickets selectedTab={selectedTab} setSelectedTab={handleTabChange} />
        </Container>
    );
};

export default Profile;
