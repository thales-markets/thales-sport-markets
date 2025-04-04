import { ProfileTab } from 'enums/ui';
import React, { useEffect, useState } from 'react';
import useQueryParam from 'utils/useQueryParams';
import MyTickets from './components/MyTickets';
import { Container } from './styled-components';

const Profile: React.FC = () => {
    const [selectedTabParam, setSelectedTabParam] = useQueryParam('selected-tab', ProfileTab.ACCOUNT);
    const [selectedTab, setSelectedTab] = useState<ProfileTab>(ProfileTab.ACCOUNT);

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
