import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import useUsersStatsQuery from 'queries/wallet/useUsersStatsQuery';
import NavigationBar from './components/NavigationBar';
import { Container } from './styled-components';
import Positions from './components/Positions';

const Profile: React.FC = () => {
    const [navItem, setNavItem] = useState<number>(1);

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state))
        ? '0xf12c220b631125425f4c69823d6187FE3C8d0999'
        : '0xf12c220b631125425f4c69823d6187FE3C8d0999';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const userStat = useUsersStatsQuery(walletAddress.toLowerCase(), networkId, { enabled: isWalletConnected });
    console.log('userStat ', userStat);

    return (
        <Container>
            <NavigationBar itemSelected={navItem} onSelectItem={(index) => setNavItem(index)} />
            <Positions />
        </Container>
    );
};

export default Profile;
