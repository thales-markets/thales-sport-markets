import queryString from 'query-string';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
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

    const tabClickHandler = (tab: MarchMadTabs) => {
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
            <TabHome active={selectedTab === MarchMadTabs.HOME} onClick={() => tabClickHandler(MarchMadTabs.HOME)}>
                {t('march-madness.tabs.home')}
            </TabHome>
            <TabBrackets
                active={selectedTab === MarchMadTabs.BRACKETS}
                onClick={() => tabClickHandler(MarchMadTabs.BRACKETS)}
            >
                {t('march-madness.tabs.brackets')}
            </TabBrackets>
            <TabLeaderboard
                active={selectedTab === MarchMadTabs.LEADERBOARD}
                onClick={() => tabClickHandler(MarchMadTabs.LEADERBOARD)}
            >
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

const Tab = styled.div<{ active: boolean }>`
    ${(props) => (props.active ? 'box-shadow: 0px 5px #c12b34;' : '')}
    text-transform: uppercase;
    padding-bottom: 6px;
    padding-left: 40px;
    cursor: pointer;
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
    color: ${(props) => (props.active ? '#c12b34' : '#ffffff')};
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
