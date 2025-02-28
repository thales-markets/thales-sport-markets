import BannerCarousel from 'components/BannerCarousel';
import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { ProfileTab } from 'enums/ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { buildHref, navigateTo } from 'utils/routes';
import { useAccount } from 'wagmi';
import SearchField from '../../components/SearchField';
import UserVaults from '../../components/UserVaults';
import Account from '../Account';
import OpenClaimableTickets from '../OpenClaimableTickets';
import TicketTransactions from '../TicketTransactions';
import UserStatsV2 from '../UserStatsV2';
import NavigationBar from './components/NavigationBar';
import NavigationBarMobile from './components/NavigationBarMobile';

type MyTicketsProps = {
    selectedTab: ProfileTab;
    setSelectedTab: (tab: ProfileTab) => void;
};

const MyTickets: React.FC<MyTicketsProps> = ({ selectedTab, setSelectedTab }) => {
    const { t } = useTranslation();
    const isMobile = useSelector(getIsMobile);
    const { isConnected } = useAccount();
    const [searchText, setSearchText] = useState<string>('');

    useEffect(() => {
        !isConnected && navigateTo(ROUTES.Markets.Home);
    }, [isConnected]);

    return (
        <RowContainer>
            <LeftSidebarContainer>
                <BannerCarousel />
            </LeftSidebarContainer>
            <MainContainer>
                <NavigationWrapper>
                    <Header>
                        <SPAAnchor href={buildHref(ROUTES.Markets.Home)}>
                            <ButtonContainer>
                                <BackIcon className="icon-homepage icon--arrow-left" />
                                {t('profile.back')}
                            </ButtonContainer>
                        </SPAAnchor>
                        {!isMobile && <NavigationBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />}
                        <SearchField
                            disabled={selectedTab == ProfileTab.LP}
                            customPlaceholder={t('profile.search-field')}
                            text={searchText}
                            handleChange={(value) => setSearchText(value)}
                        />
                    </Header>
                    {isMobile && <NavigationBarMobile selectedTab={selectedTab} setSelectedTab={setSelectedTab} />}
                </NavigationWrapper>
                {selectedTab == ProfileTab.OPEN_CLAIMABLE && <OpenClaimableTickets searchText={searchText} />}
                {selectedTab == ProfileTab.TRANSACTION_HISTORY && <TicketTransactions searchText={searchText} />}
                {selectedTab == ProfileTab.LP && <UserVaults />}
                {selectedTab == ProfileTab.ACCOUNT && <Account />}
                {selectedTab == ProfileTab.STATS && <UserStatsV2 />}
            </MainContainer>
            <RightSidebarContainer>
                <UserStatsV2 />
            </RightSidebarContainer>
        </RowContainer>
    );
};

const RowContainer = styled(FlexDivRow)`
    width: 100%;
    flex: 1 1 0%;
    flex-direction: row;
    justify-content: center;
`;

const SidebarContainer = styled(FlexDivColumn)`
    flex-grow: 1;
    @media (max-width: 950px) {
        display: none;
    }
`;

const LeftSidebarContainer = styled(SidebarContainer)`
    width: 100%;
    max-width: 263px;
    @media (max-width: 1399px) {
        display: none;
    }
`;

const RightSidebarContainer = styled(SidebarContainer)`
    max-width: 360px;
    @media (max-width: 1399px) {
        max-width: 320px;
    }
`;

const MainContainer = styled(FlexDivColumn)`
    width: 100%;

    flex-grow: 1;
    margin: 0 25px;
    @media (max-width: 1499px) {
        margin: 0 12px;
    }
    @media (max-width: 1199px) {
        margin: 0 10px;
    }
    @media (max-width: 950px) {
        margin: 0;
        width: 100%;
    }
`;

const NavigationWrapper = styled(FlexDivRow)`
    width: 100%;
    margin-bottom: 15px;
    @media (max-width: 950px) {
        flex-direction: column;
    }
    @media (max-width: 512px) {
        margin-bottom: 14px;
    }
`;

const Header = styled(FlexDivRow)`
    width: 100%;
    @media (max-width: 950px) {
        margin-bottom: 15px;
    }
    @media (max-width: 512px) {
        margin-bottom: 0;
    }
`;

const ButtonContainer = styled(FlexDivRow)`
    font-size: 12px;
    font-weight: 600;
    height: 30px;
    background: ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.textColor.secondary};
    border-radius: 7px;
    padding: 0px 14px 0px 6px;
    align-items: center;
    cursor: pointer;
`;

const BackIcon = styled.i`
    font-size: 24px;
    margin-right: 4px;
`;

export default MyTickets;
