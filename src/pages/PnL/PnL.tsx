import { PnlTab } from 'enums/ui';
import React, { useEffect, useState } from 'react';
import useQueryParam from 'utils/useQueryParams';
import MyTickets from './components/MyTickets';
import { Container } from './styled-components';

const Profile: React.FC = () => {
    const [selectedTabParam, setSelectedTabParam] = useQueryParam('selected-tab', PnlTab.LP_STATS);
    const [selectedTab, setSelectedTab] = useState<PnlTab>(PnlTab.LP_STATS);

    useEffect(() => {
        if (Object.values(PnlTab).includes(selectedTabParam.toLowerCase() as PnlTab)) {
            setSelectedTab(selectedTabParam.toLowerCase() as PnlTab);
        } else {
            setSelectedTab(PnlTab.LP_STATS);
        }
    }, [selectedTabParam]);

    const handleTabChange = (tab: PnlTab) => {
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
