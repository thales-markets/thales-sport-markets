import queryString from 'query-string';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { history } from 'utils/routes';

export enum MarchMadTabs {
    HOME = 'home',
    BRACKETS = 'brackets',
    LEADERBOARD = 'leaderboard',
}

type TabsProps = {
    selectedTab: MarchMadTabs;
    setSelectedTab: (tab: MarchMadTabs) => void;
};

const Tabs: React.FC<TabsProps> = ({ selectedTab, setSelectedTab }) => {
    const { t } = useTranslation();
    const location = useLocation();

    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const tabClickHandler = (tab: MarchMadTabs) => {
        if (tab === MarchMadTabs.BRACKETS && !isWalletConnected) {
            return;
        }
        history.push({
            pathname: location.pathname,
            search: queryString.stringify({
                tab,
            }),
        });
        setSelectedTab(tab);
    };

    return (
        <Container>
            <TabHome
                active={selectedTab === MarchMadTabs.HOME}
                isClickable={true}
                onClick={() => tabClickHandler(MarchMadTabs.HOME)}
            >
                {selectedTab === MarchMadTabs.HOME && <TabSelected />}
                {t('march-madness.tabs.home')}
            </TabHome>
            <TabBrackets
                active={selectedTab === MarchMadTabs.BRACKETS}
                isClickable={isWalletConnected}
                onClick={() => tabClickHandler(MarchMadTabs.BRACKETS)}
            >
                {selectedTab === MarchMadTabs.BRACKETS && <TabSelected />}
                {t('march-madness.tabs.brackets')}
            </TabBrackets>
            <TabLeaderboard
                active={selectedTab === MarchMadTabs.LEADERBOARD}
                isClickable={true}
                onClick={() => tabClickHandler(MarchMadTabs.LEADERBOARD)}
            >
                {selectedTab === MarchMadTabs.LEADERBOARD && <TabSelected />}
                {t('march-madness.tabs.leaderboard')}
            </TabLeaderboard>
        </Container>
    );
};

const Container = styled.div`
    width: 70%;
    display: flex;
    flex-direction: row;
    margin: 20px 0 20px auto;
    justify-content: end;
    border-bottom: 2px solid #005eb8;
`;

const Tab = styled.div<{ active: boolean; isClickable: boolean }>`
    position: relative;
    text-transform: uppercase;
    padding-bottom: 6px;
    padding-left: 40px;
    cursor: ${(props) => (props.isClickable ? 'pointer' : 'default')};
    opacity: ${(props) => (props.isClickable ? '1' : '0.4')};
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
    color: ${(props) => (props.active ? '#c12b34' : '#ffffff')};
`;

const TabSelected = styled.div`
    position: absolute;
    bottom: -3.25px;
    right: 0;
    width: 100%;
    height: 5px;
    background: #c12b34;
    border-radius: 5px;
`;

const TabHome = styled(Tab)`
    width: 30%;
`;

const TabBrackets = styled(Tab)`
    width: 30%;
`;

const TabLeaderboard = styled(Tab)`
    width: 40%;
`;

export default Tabs;
