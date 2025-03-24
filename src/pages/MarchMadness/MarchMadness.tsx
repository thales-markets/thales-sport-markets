import backgrounBall from 'assets/images/march-madness/background-marchmadness-ball.png';
import Loader from 'components/Loader';
import ROUTES from 'constants/routes';
import { secondsToMilliseconds } from 'date-fns';
import { ScreenSizeBreakpoint, Theme } from 'enums/ui';
import BackToLink from 'pages/Markets/components/BackToLink';
import useMarchMadnessDataQuery from 'queries/marchMadness/useMarchMadnessDataQuery';
import queryString from 'query-string';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsMobile } from 'redux/modules/app';
import { setTheme } from 'redux/modules/ui';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import biconomyConnector from 'utils/biconomyWallet';
import { getIsMintingStarted, isMarchMadnessAvailableForNetworkId } from 'utils/marchMadness';
import { buildHref, history } from 'utils/routes';
import { useAccount, useChainId, useClient } from 'wagmi';
import Brackets from './components/Brackets';
import Home from './components/Home';
import Leaderboard from './components/Leaderboard';
import Tabs from './components/Tabs';
import { MarchMadTabs } from './components/Tabs/Tabs';

const MarchMadness: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const location = useLocation();

    const isMobile = useSelector(getIsMobile);
    const isBiconomy = useSelector(getIsBiconomy);

    const networkId = useChainId();
    const client = useClient();
    const { isConnected, address } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const [isMintingStarted, setIsMintingStarted] = useState(getIsMintingStarted());

    const queryParamTab: MarchMadTabs = queryString.parse(location.search).tab as MarchMadTabs;
    const isTabAvailable =
        isMarchMadnessAvailableForNetworkId(networkId) &&
        isMintingStarted &&
        Object.values(MarchMadTabs).includes(queryParamTab);

    const marchMadnessDataQuery = useMarchMadnessDataQuery(
        walletAddress,
        { networkId, client },
        { enabled: isMarchMadnessAvailableForNetworkId(networkId) }
    );
    const marchMadnessData =
        marchMadnessDataQuery.isSuccess && marchMadnessDataQuery.data ? marchMadnessDataQuery.data : null;

    const defaultTab = isTabAvailable ? queryParamTab : MarchMadTabs.HOME;

    const [selectedTab, setSelectedTab] = useState(defaultTab);

    const isMintingFinished = useMemo(
        () => !!marchMadnessData?.mintEndingDate && secondsToMilliseconds(marchMadnessData.mintEndingDate) < Date.now(),
        [marchMadnessData?.mintEndingDate]
    );

    useEffect(() => {
        if ((!isConnected || !isTabAvailable) && !isMintingFinished && queryParamTab === MarchMadTabs.BRACKETS) {
            const queryParams = queryString.parse(location.search);
            if (queryParams.tab) {
                delete queryParams.tab;
                history.push({ search: queryString.stringify({ ...queryParams }) });
            }
            setSelectedTab(MarchMadTabs.HOME);
        }
    }, [
        walletAddress,
        marchMadnessData?.bracketsIds.length,
        networkId,
        queryParamTab,
        isConnected,
        location.search,
        isTabAvailable,
        isMintingFinished,
    ]);

    useEffect(() => {
        dispatch(setTheme(Theme.MARCH_MADNESS));
    }, [dispatch]);

    return (
        <Container showBackground={selectedTab !== MarchMadTabs.BRACKETS}>
            {marchMadnessDataQuery.isLoading ? (
                <Loader />
            ) : (
                <>
                    <BackToLink
                        link={buildHref(ROUTES.Markets.Home)}
                        text={t('march-madness.back-to-markets')}
                        customStylingContainer={{
                            position: 'absolute',
                            marginTop: '20px',
                            marginLeft: isMobile ? '0px' : '-36px',
                            textTransform: 'uppercase',
                            fontFamily: 'Oswald',
                            lineHeight: '24px',
                        }}
                        useArrow
                    />
                    <Tabs
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                        isMintingStarted={isMintingStarted}
                        isMintingFinished={isMintingFinished}
                    />
                    {selectedTab === MarchMadTabs.HOME && (
                        <Home
                            setSelectedTab={setSelectedTab}
                            isMintingStarted={isMintingStarted}
                            setIsMintingStarted={setIsMintingStarted}
                        />
                    )}
                    {selectedTab === MarchMadTabs.BRACKETS && <Brackets />}
                    {selectedTab === MarchMadTabs.LEADERBOARD && <Leaderboard />}
                </>
            )}
        </Container>
    );
};

const Container = styled.div<{ showBackground: boolean }>`
    width: 1350px;
    ${(props) => (props.showBackground ? `background-image: url('${backgrounBall}');` : '')}
    ${(props) => (props.showBackground ? 'background-size: 1900px;' : '')}
    ${(props) => (props.showBackground ? 'background-position: -270px -58px;' : '')}
    ${(props) => (props.showBackground ? 'background-repeat: no-repeat;' : '')}
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 100%;
    }
`;

export default MarchMadness;
