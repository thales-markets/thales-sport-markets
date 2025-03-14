import queryString from 'query-string';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { getIsMintingStarted, isMarchMadnessAvailableForNetworkId } from 'utils/marchMadness';
import { history } from 'utils/routes';
import { useAccount, useChainId } from 'wagmi';

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

    const networkId = useChainId();
    const { isConnected } = useAccount();

    const tabClickHandler = (tab: MarchMadTabs) => {
        if (tab === MarchMadTabs.BRACKETS && !isConnected) {
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

    const isMintingStarted = getIsMintingStarted();
    const isTabAvailable = isMarchMadnessAvailableForNetworkId(networkId) && isMintingStarted;

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
                isClickable={isConnected && isTabAvailable}
                onClick={() => isTabAvailable && tabClickHandler(MarchMadTabs.BRACKETS)}
            >
                {t('march-madness.tabs.brackets')}
                {!isMintingStarted && <ComingSoon>{t('march-madness.tabs.soon')}</ComingSoon>}
            </Tab>
            <Tab
                active={selectedTab === MarchMadTabs.LEADERBOARD}
                isClickable={isTabAvailable}
                onClick={() => isTabAvailable && tabClickHandler(MarchMadTabs.LEADERBOARD)}
            >
                {t('march-madness.tabs.leaderboard')}
                {!isMintingStarted && <ComingSoon>{t('march-madness.tabs.soon')}</ComingSoon>}
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
    @media (max-width: 800px) {
        padding-top: 30px;
    }
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

const ComingSoon = styled.div`
    position: absolute;
    top: -14px;
    right: -20px;

    font-size: 10px;
    color: ${(props) => props.theme.marchMadness.textColor.primary};
    white-space: nowrap;
`;

export default Tabs;
