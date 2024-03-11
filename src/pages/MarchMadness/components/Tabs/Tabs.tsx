import { START_MINTING_DATE } from 'pages/MarchMadness/MarchMadness';
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
            <Tab
                active={selectedTab === MarchMadTabs.HOME}
                isClickable={true}
                onClick={() => tabClickHandler(MarchMadTabs.HOME)}
            >
                {selectedTab === MarchMadTabs.HOME}
                {t('march-madness.tabs.home')}
            </Tab>
            <Tab
                active={selectedTab === MarchMadTabs.BRACKETS}
                isClickable={isWalletConnected && Date.now() > START_MINTING_DATE}
                onClick={() => Date.now() > START_MINTING_DATE && tabClickHandler(MarchMadTabs.BRACKETS)}
            >
                {t('march-madness.tabs.brackets')}
            </Tab>
            <Tab
                active={selectedTab === MarchMadTabs.LEADERBOARD}
                isClickable={Date.now() > START_MINTING_DATE}
                onClick={() => Date.now() > START_MINTING_DATE && tabClickHandler(MarchMadTabs.LEADERBOARD)}
            >
                {t('march-madness.tabs.leaderboard')}
            </Tab>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    max-width: 494px;
    display: flex;
    flex-direction: row;
    margin: 20px auto;
    justify-content: space-around;
    border-bottom: 2px solid ${(props) => props.theme.marchMadness.borderColor.senary};
`;

const Tab = styled.div<{ active: boolean; isClickable: boolean }>`
    position: relative;
    text-transform: uppercase;
    cursor: ${(props) => (props.isClickable ? 'pointer' : 'default')};
    opacity: ${(props) => (props.isClickable ? '1' : '0.4')};
    font-family: 'Oswald' !important;
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 32px;
    color: ${(props) =>
        props.active ? props.theme.marchMadness.textColor.senary : props.theme.marchMadness.textColor.primary};
`;

export default Tabs;
