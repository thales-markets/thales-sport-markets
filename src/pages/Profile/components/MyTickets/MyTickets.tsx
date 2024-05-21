import ROUTES from 'constants/routes';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected } from 'redux/modules/wallet';
import styled from 'styled-components';
import { buildHref, navigateTo } from 'utils/routes';
import { getQueryStringVal } from 'utils/useQueryParams';
import BannerCarousel from '../../../../components/BannerCarousel';
import SPAAnchor from '../../../../components/SPAAnchor';
import { getIsMobile } from '../../../../redux/modules/app';
import { FlexDivColumn, FlexDivRow } from '../../../../styles/common';
import { navItems } from '../../components/NavigationBar/NavigationBar';
import SearchField from '../../components/SearchField';
import UserVaults from '../../components/UserVaults';
import NavigationBar from '../NavigationBar';
import OpenClaimableTickets from '../OpenClaimableTickets';
import TicketTransactions from '../TicketTransactions';
import UserStatsV2 from '../UserStatsV2';

const MyTickets: React.FC = () => {
    const { t } = useTranslation();
    const navItemFromQuery = getQueryStringVal('nav-item');
    const isMobile = useSelector(getIsMobile);
    const isWalletConnected = useSelector(getIsWalletConnected);

    const [navItem, setNavItem] = useState<number>(navItemFromQuery ? Number(navItemFromQuery) : 1);
    const [searchText, setSearchText] = useState<string>('');

    useEffect(() => {
        !isWalletConnected && navigateTo(ROUTES.Markets.Home);
    }, [isWalletConnected]);

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
                                Back
                            </ButtonContainer>
                        </SPAAnchor>
                        {!isMobile && (
                            <NavigationBar itemSelected={navItem} onSelectItem={(index) => setNavItem(index)} />
                        )}
                        <SearchField
                            disabled={navItems[2].id == navItem}
                            customPlaceholder={t('profile.search-field')}
                            text={searchText}
                            handleChange={(value) => setSearchText(value)}
                        />
                    </Header>
                    {isMobile && <NavigationBar itemSelected={navItem} onSelectItem={(index) => setNavItem(index)} />}
                </NavigationWrapper>
                {navItems[0].id == navItem && <OpenClaimableTickets searchText={searchText} />}
                {navItems[1].id == navItem && <TicketTransactions searchText={searchText} />}
                {navItems[2].id == navItem && <UserVaults />}
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
    max-width: 806px;
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
`;

const Header = styled(FlexDivRow)`
    width: 100%;
    @media (max-width: 950px) {
        margin-bottom: 15px;
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

export const BackIcon = styled.i`
    font-size: 24px;
    margin-right: 4px;
`;

export default MyTickets;
