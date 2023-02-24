import ROUTES from 'constants/routes';
import BackToLink from 'pages/Markets/components/BackToLink';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { buildHref } from 'utils/routes';
import Brackets from './components/Brackets';
import Home from './components/Home';
import Leaderboard from './components/Leaderboard';
import Tabs from './components/Tabs';
import { MarchMadTabs } from './components/Tabs/Tabs';

const MarchMadness: React.FC = () => {
    const { t } = useTranslation();

    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const queryParamTab: MarchMadTabs = queryString.parse(location.search).tab as MarchMadTabs;
    const isTabAvailable = Object.values(MarchMadTabs).includes(queryParamTab);
    const [selectedTab, setSelectedTab] = useState(isTabAvailable ? queryParamTab : MarchMadTabs.HOME); // TODO: some logic when to go to Home

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
