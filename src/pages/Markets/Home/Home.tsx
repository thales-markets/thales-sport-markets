import { useMatomo } from '@datapunt/matomo-tracker-react';
import Button from 'components/Button';
import GetUsd from 'components/GetUsd';
import Loader from 'components/Loader';
import Logo from 'components/Logo';
import Search from 'components/Search';
import SimpleLoader from 'components/SimpleLoader';
import SPAAnchor from 'components/SPAAnchor';

import { GlobalFiltersEnum, SortDirection, SportFilterEnum } from 'constants/markets';
import ROUTES, { RESET_STATE } from 'constants/routes';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { SPORTS_TAGS_MAP, TAGS_LIST } from 'constants/tags';
import useLocalStorage from 'hooks/useLocalStorage';
import i18n from 'i18n';
import useSportMarketsQueryNew from 'queries/markets/useSportsMarketsQueryNew';
import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getMarketSearch, setMarketSearch } from 'redux/modules/market';
import { getFavouriteLeagues } from 'redux/modules/ui';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { SportMarketInfo, SportMarkets, TagInfo, Tags } from 'types/markets';
import { addHoursToCurrentDate } from 'utils/formatters/date';
import { NetworkIdByName } from 'utils/network';

import { buildHref, history } from 'utils/routes';
import useQueryParam from 'utils/useQueryParams';
import FilterTagsMobile from '../components/FilterTagsMobile';
import GlobalFilters from '../components/GlobalFilters';
import SportFilter from '../components/SportFilter';
import SportFilterMobile from '../components/SportFilter/SportFilterMobile';
import TagsDropdown from '../components/TagsDropdown';

const SidebarLeaderboard = lazy(
    () => import(/* webpackChunkName: "SidebarLeaderboard" */ 'pages/ParlayLeaderboard/components/SidebarLeaderboard')
);

const Parlay = lazy(() => import(/* webpackChunkName: "Parlay" */ './Parlay'));

const ParlayMobileModal = lazy(
    () => import(/* webpackChunkName: "ParlayMobileModal" */ './Parlay/components/ParlayMobileModal')
);

const FooterSidebarMobile = lazy(
    () => import(/* webpackChunkName: "FooterSidebarMobile" */ 'components/FooterSidebarMobile')
);

const MarketsGrid = lazy(() => import(/* webpackChunkName: "MarketsGrid" */ './MarketsGrid'));

type AllMarkets = {
    OpenMarkets: SportMarkets;
    Canceled: SportMarkets;
    ResolvedMarkets: SportMarkets;
    PendingMarkets: SportMarkets;
};

const Home: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const marketSearch = useSelector((state: RootState) => getMarketSearch(state));
    const { trackPageView } = useMatomo();
    const location = useLocation();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [globalFilter, setGlobalFilter] = useLocalStorage<GlobalFiltersEnum>(
        LOCAL_STORAGE_KEYS.FILTER_GLOBAL,
        GlobalFiltersEnum.OpenMarkets
    );
    const [sportFilter, setSportFilter] = useLocalStorage(LOCAL_STORAGE_KEYS.FILTER_SPORT, SportFilterEnum.All);
    const [showBurger, setShowBurger] = useState<boolean>(false);
    const [showParlayMobileModal, setshowParlayMobileModal] = useState<boolean>(false);

    const tagsList = TAGS_LIST.map((tag) => {
        return { id: tag.id, label: tag.label, logo: tag.logo, favourite: tag.favourite };
    });

    const favouriteLeagues = useSelector(getFavouriteLeagues);

    const [tagFilter, setTagFilter] = useLocalStorage<Tags>(LOCAL_STORAGE_KEYS.FILTER_TAGS, []);
    const [availableTags, setAvailableTags] = useState<Tags>(tagsList.sort((a, b) => a.label.localeCompare(b.label)));

    const [dateFilter, setDateFilter] = useLocalStorage<Date | number>(
        LOCAL_STORAGE_KEYS.FILTER_DATE,
        !isMobile ? addHoursToCurrentDate(72, true).getTime() : 0
    );

    const [sportParam, setSportParam] = useQueryParam('sport', '');
    const [globalFilterParam, setGlobalFilterParam] = useQueryParam('globalFilter', '');
    const [searchParam, setSearchParam] = useQueryParam('searchParam', '');
    const [dateParam, setDateParam] = useQueryParam('date', '');
    const [tagParam, setTagParam] = useQueryParam('tag', '');
    const [selectedLanguage, setSelectedLanguage] = useQueryParam('lang', '');

    const calculateDate = (hours: number, endOfDay?: boolean) => {
        const calculatedDate = addHoursToCurrentDate(hours, endOfDay);
        setDateFilter(calculatedDate.getTime());
    };

    useEffect(
        () => {
            sportParam != '' ? setSportFilter(sportParam as SportFilterEnum) : setSportParam(sportFilter);
            globalFilterParam != ''
                ? setGlobalFilter(globalFilterParam as GlobalFiltersEnum)
                : setGlobalFilterParam(globalFilter);
            if (dateParam != '') {
                if (dateParam.includes('hour')) {
                    const timeFilter = dateParam.split('h')[0];
                    switch (timeFilter) {
                        case '12':
                            calculateDate(12);
                            break;
                        case '24':
                            calculateDate(24);
                            break;
                        case '72':
                            calculateDate(72, true);
                            break;
                    }
                } else {
                    const formattedDate = new Date(dateParam);
                    formattedDate.setHours(23, 59, 59, 999);
                    setDateFilter(formattedDate);
                }
            } else {
                if (dateFilter == addHoursToCurrentDate(72, true).getTime()) {
                    setDateParam('72hours');
                }
            }

            if (tagParam != '') {
                const tagParamsSplitted = tagParam.split(',');
                const filteredTags = availableTags.filter((tag) => tagParamsSplitted.includes(tag.label));
                filteredTags.length > 0 ? setTagFilter(filteredTags) : setTagFilter([]);
            } else {
                setTagParam(tagFilter.map((tag) => tag.label).toString());
            }
            searchParam != '' ? dispatch(setMarketSearch(searchParam)) : '';
            selectedLanguage == '' ? setSelectedLanguage(i18n.language) : '';
            if (sportFilter == SportFilterEnum.Favourites) {
                const filteredTags = tagsList.filter((tag: TagInfo) => tag.favourite);
                setAvailableTags(filteredTags);
            } else {
                const tagsPerSport = SPORTS_TAGS_MAP[sportFilter];
                if (tagsPerSport) {
                    const filteredTags = tagsList.filter((tag: TagInfo) => tagsPerSport.includes(tag.id));
                    setAvailableTags(filteredTags);
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const sportMarketsQueryNew = useSportMarketsQueryNew(networkId, { enabled: isAppReady });

    const finalMarkets = useMemo(() => {
        const allMarkets: AllMarkets =
            sportMarketsQueryNew.isSuccess && sportMarketsQueryNew.data
                ? sportMarketsQueryNew.data
                : {
                      OpenMarkets: [],
                      Canceled: [],
                      ResolvedMarkets: [],
                      PendingMarkets: [],
                  };

        const filteredMarkets = allMarkets[globalFilter].filter((market: SportMarketInfo) => {
            if (marketSearch) {
                if (
                    !market.homeTeam.toLowerCase().includes(marketSearch.toLowerCase()) &&
                    !market.awayTeam.toLowerCase().includes(marketSearch.toLowerCase())
                ) {
                    return false;
                }
            }

            if (tagFilter.length > 0) {
                if (!tagFilter.map((tag) => tag.id).includes(market.tags.map((tag) => Number(tag))[0])) {
                    return false;
                }
            }

            if (dateFilter !== 0) {
                if (typeof dateFilter === 'number') {
                    if (market.maturityDate.getTime() > dateFilter) {
                        return false;
                    }
                } else {
                    const dateToCompare = new Date(dateFilter);
                    if (market.maturityDate.toDateString() != dateToCompare.toDateString()) {
                        return false;
                    }
                }
            }

            if (sportFilter !== SportFilterEnum.All) {
                if (sportFilter != SportFilterEnum.Favourites) {
                    if (market.sport !== sportFilter) {
                        return false;
                    }
                } else {
                    if (
                        !favouriteLeagues
                            .filter((league) => league.favourite)
                            .map((league) => league.id)
                            .includes(market.tags.map((tag) => Number(tag))[0])
                    )
                        return false;
                }
            }

            return true;
        });

        const sortedFilteredMarkets = filteredMarkets.sort((a, b) => {
            switch (globalFilter) {
                case GlobalFiltersEnum.ResolvedMarkets:
                case GlobalFiltersEnum.Canceled:
                    return sortByField(a, b, SortDirection.DESC, 'maturityDate');
                default:
                    return sortByField(a, b, SortDirection.ASC, 'maturityDate');
            }
        });

        return globalFilter === GlobalFiltersEnum.OpenMarkets
            ? groupBySortedMarkets(sortedFilteredMarkets)
            : sortedFilteredMarkets;
    }, [marketSearch, tagFilter, dateFilter, sportFilter, globalFilter, favouriteLeagues, sportMarketsQueryNew]);

    useEffect(() => {
        if (sportFilter == SportFilterEnum.Favourites) {
            const filteredTags = favouriteLeagues.filter((tag: any) => tag.favourite);
            setAvailableTags(filteredTags);
        }
    }, [favouriteLeagues, sportFilter]);

    const resetFilters = useCallback(() => {
        setGlobalFilter(GlobalFiltersEnum.OpenMarkets);
        setGlobalFilterParam(GlobalFiltersEnum.OpenMarkets);
        setSportFilter(SportFilterEnum.All);
        setSportParam(SportFilterEnum.All);
        setDateFilter(0);
        setDateParam('');
        setTagFilter([]);
        setTagParam('');
        setSearchParam('');
        dispatch(setMarketSearch(''));
    }, [
        dispatch,
        setDateFilter,
        setGlobalFilter,
        setSportFilter,
        setTagFilter,
        setDateParam,
        setGlobalFilterParam,
        setSearchParam,
        setSportParam,
        setTagParam,
    ]);

    useEffect(() => {
        if (location.state === RESET_STATE) {
            history.replace(location.pathname, '');
            resetFilters();
        }
    }, [location, resetFilters]);

    useEffect(() => {
        trackPageView({});
    }, [trackPageView]);

    return (
        <Container>
            <Info>
                <Trans
                    i18nKey="rewards.op-rewards-banner-message"
                    components={{
                        bold: <SPAAnchor href={buildHref(ROUTES.Rewards)} />,
                    }}
                />
            </Info>
            <ReactModal
                isOpen={showBurger && isMobile}
                onRequestClose={() => {
                    setShowBurger(false);
                }}
                shouldCloseOnOverlayClick={false}
                style={customModalStyles}
            >
                <BurgerFiltersContainer>
                    <LogoContainer>
                        <Logo />
                    </LogoContainer>
                    <SportFiltersContainer>
                        {Object.values(SportFilterEnum).map((filterItem: any, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <SportFilter
                                        selected={sportFilter === filterItem}
                                        sport={filterItem}
                                        onClick={() => {
                                            if (filterItem !== sportFilter) {
                                                setSportFilter(filterItem);
                                                setSportParam(filterItem);
                                                setTagFilter([]);
                                                setTagParam('');
                                                setGlobalFilter(GlobalFiltersEnum.OpenMarkets);
                                                setGlobalFilterParam(GlobalFiltersEnum.OpenMarkets);
                                                if (filterItem === SportFilterEnum.All) {
                                                    setDateFilter(0);
                                                    setDateParam('');
                                                    setAvailableTags(
                                                        tagsList.sort((a, b) => a.label.localeCompare(b.label))
                                                    );
                                                } else {
                                                    const tagsPerSport = SPORTS_TAGS_MAP[filterItem];
                                                    if (tagsPerSport) {
                                                        const filteredTags = tagsList.filter((tag: TagInfo) =>
                                                            tagsPerSport.includes(tag.id)
                                                        );
                                                        setAvailableTags(filteredTags);
                                                    } else {
                                                        setAvailableTags([]);
                                                    }
                                                }
                                            } else {
                                                setSportFilter(SportFilterEnum.All);
                                                setSportParam(SportFilterEnum.All);
                                                setTagFilter([]);
                                                setTagParam('');
                                                setAvailableTags(
                                                    tagsList.sort((a, b) => a.label.localeCompare(b.label))
                                                );
                                            }
                                        }}
                                        key={filterItem}
                                        isMobile={isMobile}
                                    >
                                        {t(`market.filter-label.sport.${filterItem.toLowerCase()}`)}
                                    </SportFilter>
                                    <TagsDropdown
                                        open={filterItem == sportFilter && filterItem !== SportFilterEnum.All}
                                        key={filterItem + '1'}
                                        tags={availableTags}
                                        tagFilter={tagFilter}
                                        setTagFilter={setTagFilter}
                                        setTagParam={setTagParam}
                                    ></TagsDropdown>
                                </React.Fragment>
                            );
                        })}
                    </SportFiltersContainer>
                    <GlobalFiltersContainer>
                        <GlobalFilters
                            setDateFilter={setDateFilter}
                            setDateParam={setDateParam}
                            setGlobalFilter={setGlobalFilter}
                            setGlobalFilterParam={setGlobalFilterParam}
                            setTagFilter={setTagFilter}
                            setTagParam={setTagParam}
                            setSportFilter={setSportFilter}
                            setSportParam={setSportParam}
                            globalFilter={globalFilter}
                            dateFilter={dateFilter}
                            sportFilter={sportFilter}
                            isMobile={isMobile}
                        />
                    </GlobalFiltersContainer>
                    <ApplyFiltersButton onClick={() => setShowBurger(false)}>
                        {t('market.apply-filters')}
                        <ArrowIcon className={`icon icon--arrow-up`} />
                    </ApplyFiltersButton>
                </BurgerFiltersContainer>
            </ReactModal>

            <RowContainer>
                {/* LEFT FILTERS */}
                <SidebarContainer maxWidth={280}>
                    <Search
                        text={marketSearch}
                        handleChange={(value) => {
                            dispatch(setMarketSearch(value));
                            setSearchParam(value);
                        }}
                        width={280}
                    />
                    <SportFiltersContainer>
                        {Object.values(SportFilterEnum).map((filterItem: any, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <SportFilter
                                        selected={sportFilter === filterItem}
                                        sport={filterItem}
                                        onClick={() => {
                                            if (filterItem !== sportFilter) {
                                                setSportFilter(filterItem);
                                                setSportParam(filterItem);
                                                setTagFilter([]);
                                                setTagParam('');
                                                setGlobalFilter(GlobalFiltersEnum.OpenMarkets);
                                                setGlobalFilterParam(GlobalFiltersEnum.OpenMarkets);
                                                if (filterItem === SportFilterEnum.All) {
                                                    setDateFilter(0);
                                                    setDateParam('');
                                                    setAvailableTags(
                                                        tagsList.sort((a, b) => a.label.localeCompare(b.label))
                                                    );
                                                } else {
                                                    const tagsPerSport = SPORTS_TAGS_MAP[filterItem];
                                                    if (tagsPerSport) {
                                                        const filteredTags = tagsList.filter((tag: TagInfo) =>
                                                            tagsPerSport.includes(tag.id)
                                                        );
                                                        setAvailableTags(filteredTags);
                                                    } else {
                                                        setAvailableTags([]);
                                                    }
                                                }
                                            } else {
                                                setSportFilter(SportFilterEnum.All);
                                                setSportParam(SportFilterEnum.All);
                                                setTagFilter([]);
                                                setTagParam('');
                                                setAvailableTags(
                                                    tagsList.sort((a, b) => a.label.localeCompare(b.label))
                                                );
                                            }
                                        }}
                                        key={filterItem}
                                    >
                                        {t(`market.filter-label.sport.${filterItem.toLowerCase()}`)}
                                    </SportFilter>
                                    <TagsDropdown
                                        open={filterItem == sportFilter && filterItem !== SportFilterEnum.All}
                                        key={filterItem + '1'}
                                        tags={availableTags}
                                        tagFilter={tagFilter}
                                        setTagFilter={setTagFilter}
                                        setTagParam={setTagParam}
                                    ></TagsDropdown>
                                </React.Fragment>
                            );
                        })}
                    </SportFiltersContainer>
                    <Suspense fallback={<Loader />}>
                        <SidebarLeaderboard />
                    </Suspense>
                </SidebarContainer>
                {/* MAIN PART */}
                {sportMarketsQueryNew.isLoading ? (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                ) : (
                    <MainContainer>
                        {isMobile && (
                            <>
                                <SportFilterMobile
                                    sportFilter={sportFilter}
                                    setDateFilter={setDateFilter}
                                    setDateParam={setDateParam}
                                    setGlobalFilter={setGlobalFilter}
                                    setGlobalFilterParam={setGlobalFilterParam}
                                    setTagFilter={setTagFilter}
                                    setTagParam={setTagParam}
                                    setSportFilter={setSportFilter}
                                    setSportParam={setSportParam}
                                    setAvailableTags={setAvailableTags}
                                    tagsList={tagsList}
                                />
                                <FilterTagsMobile
                                    sportFilter={sportFilter}
                                    marketSearch={marketSearch}
                                    globalFilter={globalFilter}
                                    tagFilter={tagFilter}
                                    setDateFilter={setDateFilter}
                                    setDateParam={setDateParam}
                                    setGlobalFilter={setGlobalFilter}
                                    setGlobalFilterParam={setGlobalFilterParam}
                                    setTagFilter={setTagFilter}
                                    setTagParam={setTagParam}
                                    setSportFilter={setSportFilter}
                                    setSportParam={setSportParam}
                                    setSearchParam={setSearchParam}
                                />
                            </>
                        )}
                        {!isMobile && (
                            <GlobalFilters
                                setDateFilter={setDateFilter}
                                setDateParam={setDateParam}
                                setGlobalFilter={setGlobalFilter}
                                setGlobalFilterParam={setGlobalFilterParam}
                                setTagFilter={setTagFilter}
                                setTagParam={setTagParam}
                                setSportFilter={setSportFilter}
                                setSportParam={setSportParam}
                                globalFilter={globalFilter}
                                dateFilter={dateFilter}
                                sportFilter={sportFilter}
                                isMobile={isMobile}
                            />
                        )}
                        {finalMarkets.length === 0 ? (
                            <NoMarketsContainer>
                                <NoMarketsLabel>{t('market.no-markets-found')}</NoMarketsLabel>
                                <Button onClick={resetFilters}>{t('market.view-all-markets')}</Button>
                            </NoMarketsContainer>
                        ) : (
                            <Suspense fallback={<Loader />}>
                                <MarketsGrid markets={finalMarkets} />
                            </Suspense>
                        )}
                    </MainContainer>
                )}
                {/* RIGHT PART */}
                <SidebarContainer maxWidth={320}>
                    {networkId === NetworkIdByName.OptimismMainnet && <GetUsd />}
                    <Suspense fallback={<Loader />}>
                        <Parlay />
                    </Suspense>
                </SidebarContainer>
            </RowContainer>
            {isMobile && showParlayMobileModal && (
                <Suspense fallback={<Loader />}>
                    <ParlayMobileModal onClose={() => setshowParlayMobileModal(false)} />
                </Suspense>
            )}
            {isMobile && (
                <Suspense fallback={<Loader />}>
                    <FooterSidebarMobile
                        setParlayMobileVisibility={setshowParlayMobileModal}
                        setShowBurger={setShowBurger}
                    />
                </Suspense>
            )}
        </Container>
    );
};

const sortByField = (
    a: SportMarketInfo,
    b: SportMarketInfo,
    direction: SortDirection,
    field: keyof SportMarketInfo
) => {
    if (direction === SortDirection.ASC) {
        return (a[field] as any) > (b[field] as any) ? 1 : -1;
    }
    if (direction === SortDirection.DESC) {
        return (a[field] as any) > (b[field] as any) ? -1 : 1;
    }

    return 0;
};

const groupBySortedMarkets = (markets: SportMarkets) => {
    const openMarkets: SportMarkets = [];
    const comingSoonMarkets: SportMarkets = [];
    markets.forEach((market: SportMarketInfo) => {
        if (
            market.isOpen &&
            !market.isCanceled &&
            !market.isPaused &&
            market.maturityDate > new Date() &&
            (market.homeOdds !== 0 || market.awayOdds !== 0 || market.drawOdds !== 0)
        )
            openMarkets.push(market);
        if (
            market.isOpen &&
            market.maturityDate > new Date() &&
            market.homeOdds === 0 &&
            market.awayOdds === 0 &&
            market.drawOdds === 0
        )
            comingSoonMarkets.push(market);
    });

    return [...openMarkets, ...comingSoonMarkets];
};

const Container = styled(FlexDivColumnCentered)`
    width: 100%;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
`;

const RowContainer = styled(FlexDivRow)`
    width: 100%;
    flex: 1 1 0%;
    flex-direction: row;
    justify-content: center;
`;

const MainContainer = styled(FlexDivColumn)`
    width: 100%;
    max-width: 800px;
    flex-grow: 1;
`;

const SidebarContainer = styled(FlexDivColumn)<{ maxWidth: number }>`
    max-width: ${(props) => props.maxWidth}px;
    flex-grow: 1;
    @media (max-width: 950px) {
        display: none;
    }
`;

const GlobalFiltersContainer = styled(FlexDivColumn)`
    height: fit-content;
    flex: 0;
    &:before {
        content: '';
        height: 3px;
        background: ${(props) => props.theme.borderColor.primary};
        border-radius: 10px 10px 10px 10px;
        margin-bottom: 20px;
        margin-left: 50px;
        margin-right: 50px;
    }
`;

const SportFiltersContainer = styled(FlexDivColumn)`
    height: fit-content;
    flex: 0;
    margin-bottom: 10px;
    padding-top: 15px;
`;

const NoMarketsContainer = styled(FlexDivColumnCentered)`
    min-height: 200px;
    align-items: center;
    justify-content: start;
    margin-top: 100px;
    font-style: normal;
    font-weight: bold;
    font-size: 28px;
    line-height: 100%;
    button {
        padding-top: 1px;
    }
`;

const NoMarketsLabel = styled.span`
    margin-bottom: 30px;
`;

export const LoaderContainer = styled(FlexDivColumn)`
    position: relative;
    min-height: 300px;
`;

const BurgerFiltersContainer = styled(FlexDivColumn)`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background: #303656;
    display: flex;
    z-index: 1000;
    @media (max-width: 1300px) {
        margin: 0;
        scrollbar-width: 0px; /* Firefox */
        ::-webkit-scrollbar {
            /* WebKit */
            width: 0px;
            height: 0px;
        }
    }
`;

const LogoContainer = styled.div`
    width: 100%;
    margin-top: 20px;
    margin-bottom: 10px;
    text-align: center;
`;

export const Info = styled.div`
    width: 100%;
    color: #ffffff;
    text-align: center;
    padding: 10px;
    font-size: 16px;
    margin-bottom: 20px;
    background-color: #303656;
    box-shadow: 0px 0px 20px rgb(0 0 0 / 40%);
    z-index: 2;
    position: absolute;
    top: 0px;
    left: 0px;
    strong {
        font-weight: bold;
        cursor: pointer;
        margin-left: 0.2em;
        color: #91bced;
    }
    a {
        display: contents;
        font-weight: bold;
        cursor: pointer;
        color: #91bced;
    }
`;

const ApplyFiltersButton = styled(Button)`
    align-self: center;
    height: 43px;
    width: 180px;
    margin-right: 5px;
    position: fixed;
    background: ${(props) => props.theme.background.quaternary};
    color: ${(props) => props.theme.background.primary};
    border: none;
    border-radius: 40px;
    font-weight: 800;
    font-size: 16px;
    line-height: 210%;
    letter-spacing: 0.035em;
    text-transform: uppercase;
    bottom: 3%;
`;

const ArrowIcon = styled.i`
    font-size: 30px;
    margin-right: -10px;
    text-transform: none;
    writing-mode: vertical-lr;
`;

const customModalStyles = {
    content: {
        top: '0',
        overflow: 'auto',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        width: '100%',
        height: '100vh',
    },
    overlay: {
        backgroundColor: '#303656',
        zIndex: '1000',
    },
};

export default Home;
