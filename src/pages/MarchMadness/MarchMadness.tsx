import Loader from 'components/Loader';
import ROUTES from 'constants/routes';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { Theme } from 'constants/ui';
import BackToLink from 'pages/Markets/components/BackToLink';
import useMarchMadnessDataQuery from 'queries/marchMadness/useMarchMadnessDataQuery';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
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

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const queryParamTab: MarchMadTabs = queryString.parse(location.search).tab as MarchMadTabs;
    const isTabAvailable = Object.values(MarchMadTabs).includes(queryParamTab);
    const lsBrackets = localStore.get(LOCAL_STORAGE_KEYS.BRACKETS + networkId + walletAddress);

    const defaultTab = isTabAvailable
        ? queryParamTab === MarchMadTabs.BRACKETS
            ? lsBrackets !== undefined
                ? MarchMadTabs.BRACKETS
                : MarchMadTabs.HOME
            : queryParamTab
        : MarchMadTabs.HOME;

    const [selectedTab, setSelectedTab] = useState(defaultTab);

    const marchMadnessDataQuery = useMarchMadnessDataQuery(walletAddress, networkId, {
        enabled: isAppReady,
        refetchInterval: 60 * 1000,
    });
    const marchMadnessData =
        marchMadnessDataQuery.isSuccess && marchMadnessDataQuery.data ? marchMadnessDataQuery.data : null;

    useEffect(() => {
        if (marchMadnessData) {
            if (
                queryParamTab === undefined ||
                (queryParamTab === MarchMadTabs.BRACKETS && marchMadnessData.isAddressAlreadyMinted)
            ) {
                setSelectedTab(MarchMadTabs.BRACKETS);
            }
        }
    }, [networkId, marchMadnessData, queryParamTab]);

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
            ) : marchMadnessDataQuery.isSuccess ? (
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
                    {selectedTab === MarchMadTabs.HOME && <Home setSelectedTab={setSelectedTab} />}
                    {selectedTab === MarchMadTabs.BRACKETS && <Brackets />}
                    {selectedTab === MarchMadTabs.LEADERBOARD && <Leaderboard />}
                </>
            ) : (
                <Loader />
            )}
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
`;

export default MarchMadness;
