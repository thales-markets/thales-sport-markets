import React, { useState } from 'react';
import { Container } from './styled-components';

import WrapperNavigation from './components/WrapperNavigation';
import MyTickets from './components/MyTickets';

const Profile: React.FC = () => {
    const [tabIndex, setTabIndex] = useState<number>(0);

    return (
        <Container>
            <WrapperNavigation tabIndex={tabIndex} onChangeTab={(index) => setTabIndex(index)} />
            {tabIndex == 0 && <MyTickets />}
        </Container>
    );
};

export default Profile;
