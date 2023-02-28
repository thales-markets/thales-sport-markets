import ROUTES from 'constants/routes';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { Theme } from 'constants/ui';
import BackToLink from 'pages/Markets/components/BackToLink';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { setTheme } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import localStore from 'utils/localStore';
import { buildHref } from 'utils/routes';
import Brackets from './components/Brackets';
import Home from './components/Home';
import Leaderboard from './components/Leaderboard';
import Tabs from './components/Tabs';
import { MarchMadTabs } from './components/Tabs/Tabs';

const MarchMadness: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const queryParamTab: MarchMadTabs = queryString.parse(location.search).tab as MarchMadTabs;
    const isTabAvailable = Object.values(MarchMadTabs).includes(queryParamTab);
    const lsBrackets = localStore.get(LOCAL_STORAGE_KEYS.BRACKETS + networkId + walletAddress);

    const [selectedTab, setSelectedTab] = useState(
        isTabAvailable ? queryParamTab : lsBrackets !== undefined ? MarchMadTabs.BRACKETS : MarchMadTabs.HOME
    );

    useEffect(() => {
        dispatch(setTheme(Theme.MARCH_MADNESS));
    }, [dispatch]);

    useEffect(() => {
        if (!isWalletConnected) {
            setSelectedTab(MarchMadTabs.HOME);
        }
    }, [isWalletConnected]);

    return (
        <Container>
            {isMobile ? (
                <Home />
            ) : (
                <>
                    <BackToLink
                        link={buildHref(ROUTES.Markets.Home)}
                        text={t('march-madness.back-to-markets')}
                        customStylingContainer={{
                            position: 'absolute',
                            marginTop: '20px',
                            textTransform: 'uppercase',
                            fontFamily: 'Oswald',
                            lineHeight: '24px',
                        }}
                        hideIcon={true}
                    />
                    <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                    {selectedTab === MarchMadTabs.HOME && <Home />}
                    {selectedTab === MarchMadTabs.BRACKETS && <Brackets />}
                    {selectedTab === MarchMadTabs.LEADERBOARD && <Leaderboard />}
                </>
            )}
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
`;

export default MarchMadness;
