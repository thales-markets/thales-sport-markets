import { ReactComponent as Logo } from 'assets/images/overtime-logo.svg';
import BannerCarousel from 'components/BannerCarousel';
import Button from 'components/Button';
import Loader from 'components/Loader';
import OddsSelectorModal from 'components/OddsSelectorModal';
import Scroll from 'components/Scroll';
import Search from 'components/Search';
import SimpleLoader from 'components/SimpleLoader';
import Checkbox from 'components/fields/Checkbox/Checkbox';
import { RESET_STATE } from 'constants/routes';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { SportFilter, StatusFilter } from 'enums/markets';
import { Network } from 'enums/network';
import useLocalStorage from 'hooks/useLocalStorage';
import i18n from 'i18n';
import { groupBy, orderBy } from 'lodash';
import useLiveSportsMarketsQuery from 'queries/markets/useLiveSportsMarketsQuery';
import useSportsMarketsV2Query from 'queries/markets/useSportsMarketsV2Query';
import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import {
    getDatePeriodFilter,
    getIsMarketSelected,
    getMarketSearch,
    getMarketTypeFilter,
    getSportFilter,
    getStatusFilter,
    getTagFilter,
    setDatePeriodFilter,
    setMarketSearch,
    setSportFilter,
    setStatusFilter,
    setTagFilter,
} from 'redux/modules/market';
import { getFavouriteLeagues } from 'redux/modules/ui';
import { getNetworkId } from 'redux/modules/wallet';
import styled, { CSSProperties, useTheme } from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { addHoursToCurrentDate, localStore } from 'thales-utils';
import { SportMarket, SportMarkets, TagInfo, Tags } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { history } from 'utils/routes';
import useQueryParam from 'utils/useQueryParams';
import { BOXING_LEAGUES, LeagueMap } from '../../../constants/sports';
import { MarketType } from '../../../enums/marketTypes';
import { Sport } from '../../../enums/sports';
import TimeFilters from '../../../layouts/DappLayout/DappHeader/components/TimeFilters';
import { getLiveSupportedLeagues, getSportLeagueIds, isBoxingLeague } from '../../../utils/sports';
import FilterTagsMobile from '../components/FilterTagsMobile';
import SportFilterMobile from '../components/SportFilter/SportFilterMobile';
import SportTags from '../components/SportTags';
import GlobalFilters from '../components/StatusFilters';
import Breadcrumbs from './Breadcrumbs';
import Header from './Header';
import SelectedMarket from './SelectedMarket';

const SidebarLeaderboard = lazy(
    () => import(/* webpackChunkName: "SidebarLeaderboard" */ 'pages/ParlayLeaderboard/components/SidebarLeaderboard')
);

const Parlay = lazy(() => import(/* webpackChunkName: "Parlay" */ './Parlay'));

const TicketMobileModal = lazy(
    () => import(/* webpackChunkName: "TicketMobileModal" */ './Parlay/components/TicketMobileModal')
);

const FooterSidebarMobile = lazy(
    () => import(/* webpackChunkName: "FooterSidebarMobile" */ 'components/FooterSidebarMobile')
);

const MarketsGridV2 = lazy(() => import(/* webpackChunkName: "MarketsGrid" */ './MarketsGridV2'));

const Home: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();
    const isAppReady = useSelector(getIsAppReady);
    const networkId = useSelector(getNetworkId);
    const marketSearch = useSelector(getMarketSearch);
    const datePeriodFilter = useSelector(getDatePeriodFilter);
    const statusFilter = useSelector(getStatusFilter);
    const sportFilter = useSelector(getSportFilter);
    const tagFilter = useSelector(getTagFilter);
    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const location = useLocation();
    const isMobile = useSelector(getIsMobile);
    const isMarketSelected = useSelector(getIsMarketSelected);

    const [showBurger, setShowBurger] = useState<boolean>(false);
    const [showActive, setShowActive] = useLocalStorage(LOCAL_STORAGE_KEYS.FILTER_ACTIVE, true);
    const [showTicketMobileModal, setShowTicketMobileModal] = useState<boolean>(false);
    const [showOddsSelectorModal, setShowOddsSelectorModal] = useState<boolean>(false);
    const [availableMarketTypes, setAvailableMarketTypes] = useState<MarketType[]>([]);
    const getSelectedOddsType = localStore.get(LOCAL_STORAGE_KEYS.ODDS_TYPE);

    const tagsList = useMemo(
        () =>
            orderBy(
                Object.values(LeagueMap).filter((tag) => !tag.hidden),
                ['priority', 'label'],
                ['asc', 'asc']
            ).map((tag) => {
                return {
                    id: tag.id,
                    label: tag.label,
                    logo: tag.logo,
                    favourite: tag.favourite,
                    priority: tag.priority,
                    live: tag.live,
                };
            }),
        []
    );
    const filteredLiveTags = useMemo(() => getLiveSupportedLeagues(), []);

    useEffect(() => {
        if (getSelectedOddsType == undefined) {
            setShowOddsSelectorModal(true);
        }
    }, [getSelectedOddsType]);

    const favouriteLeagues = useSelector(getFavouriteLeagues);

    const [availableTags, setAvailableTags] = useState<Tags>(tagsList);

    const [sportParam, setSportParam] = useQueryParam('sport', '');
    const [statusParam, setStatusParam] = useQueryParam('status', '');
    const [searchParam, setSearchParam] = useQueryParam('search', '');
    const [dateParam, setDateParam] = useQueryParam('date', '');
    const [tagParam, setTagParam] = useQueryParam('tag', '');
    const [selectedLanguage, setSelectedLanguage] = useQueryParam('lang', '');
    const [activeParam, setActiveParam] = useQueryParam('showActive', '');

    const calculateDate = (hours: number, endOfDay?: boolean) => {
        return addHoursToCurrentDate(hours, endOfDay).getTime();
    };

    useEffect(
        () => {
            if (
                statusFilter !== StatusFilter.OPEN_MARKETS &&
                statusFilter !== StatusFilter.ONGOING_MARKETS &&
                statusFilter !== StatusFilter.RESOLVED_MARKETS &&
                statusFilter !== StatusFilter.CANCELLED_MARKETS &&
                statusFilter !== StatusFilter.PAUSED_MARKETS
            ) {
                resetFilters();
            }

            sportParam != '' ? dispatch(setSportFilter(sportParam as SportFilter)) : setSportParam(sportFilter);

            statusParam != '' ? dispatch(setStatusFilter(statusParam as StatusFilter)) : setStatusParam(statusFilter);

            if (dateParam != '' && dateParam.includes('hour')) {
                const timeFilter = dateParam.split('h')[0];
                switch (timeFilter) {
                    case '12':
                        dispatch(setDatePeriodFilter(12));
                        break;
                    case '24':
                        dispatch(setDatePeriodFilter(24));
                        break;
                    case '72':
                        dispatch(setDatePeriodFilter(72));
                        break;
                }
            } else if (datePeriodFilter !== 0) {
                setDateParam(`${datePeriodFilter}hours`);
            }

            if (tagParam != '') {
                const tagParamsSplitted = tagParam.split(',');
                const filteredTags = availableTags.filter((tag) => tagParamsSplitted.includes(tag.label));
                filteredTags.length > 0 ? dispatch(setTagFilter(filteredTags)) : dispatch(setTagFilter([]));
            } else {
                setTagParam(tagFilter.map((tag) => tag.label).toString());
            }

            searchParam != '' ? dispatch(setMarketSearch(searchParam)) : '';

            selectedLanguage == '' ? setSelectedLanguage(i18n.language) : '';

            if (sportFilter == SportFilter.Favourites) {
                const filteredTags = tagsList.filter((tag: TagInfo) => tag.favourite);
                setAvailableTags(filteredTags);
            } else if (sportFilter == SportFilter.Live) {
                const filteredTags = tagsList.filter((tag: TagInfo) => tag.live);
                setAvailableTags(filteredTags);
            } else {
                const tagsPerSport = getSportLeagueIds((sportFilter as unknown) as Sport);
                if (tagsPerSport) {
                    const filteredTags = tagsList.filter((tag: TagInfo) => tagsPerSport.includes(tag.id));
                    setAvailableTags(filteredTags);
                }
            }

            activeParam != '' ? setShowActive(activeParam === 'true') : setActiveParam(showActive.toString());
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const sportMarketsQueryNew = useSportsMarketsV2Query(statusFilter, networkId, {
        enabled: isAppReady,
    });

    const liveSportMarketsQuery = useLiveSportsMarketsQuery(networkId, sportFilter === SportFilter.Live, {
        enabled: isAppReady,
    });

    const finalMarkets = useMemo(() => {
        const allMarkets: SportMarkets =
            sportMarketsQueryNew.isSuccess && sportMarketsQueryNew.data ? sportMarketsQueryNew.data : [];
        const marketTypes = new Set<MarketType>();
        const allLiveMarkets =
            liveSportMarketsQuery.isSuccess && liveSportMarketsQuery.data ? liveSportMarketsQuery.data : [];

        const filteredMarkets = (sportFilter === SportFilter.Live ? allLiveMarkets : allMarkets).filter(
            (market: SportMarket) => {
                if (marketSearch) {
                    if (
                        !market.homeTeam.toLowerCase().includes(marketSearch.toLowerCase()) &&
                        !market.awayTeam.toLowerCase().includes(marketSearch.toLowerCase())
                    ) {
                        return false;
                    }
                }

                if (tagFilter.length > 0) {
                    if (isBoxingLeague(market.leagueId)) {
                        if (
                            !tagFilter.map((tag) => tag.id).includes(BOXING_LEAGUES[0]) &&
                            !tagFilter.map((tag) => tag.id).includes(BOXING_LEAGUES[1])
                        ) {
                            return false;
                        }
                    } else if (!tagFilter.map((tag) => tag.id).includes(market.leagueId)) {
                        return false;
                    }
                }

                if (datePeriodFilter !== 0) {
                    if (market.maturityDate.getTime() > calculateDate(datePeriodFilter)) {
                        return false;
                    }
                }

                if (sportFilter !== SportFilter.All) {
                    if (sportFilter != SportFilter.Favourites && sportFilter != SportFilter.Live) {
                        if (((market.sport as unknown) as SportFilter) !== sportFilter) {
                            return false;
                        }
                    } else {
                        if (sportFilter == SportFilter.Favourites) {
                            if (
                                !favouriteLeagues
                                    .filter((league) => league.favourite)
                                    .map((league) => league.id)
                                    .includes(market.leagueId)
                            )
                                return false;
                        }
                    }
                }

                marketTypes.add(market.typeId);
                market.childMarkets?.forEach((childMarket) => {
                    marketTypes.add(childMarket.typeId);
                });

                if (marketTypeFilter !== undefined) {
                    const marketMarketTypes = [
                        market.typeId,
                        ...(market.childMarkets || []).map((childMarket) => childMarket.typeId),
                    ];

                    if (!marketMarketTypes.some((marketType) => marketTypeFilter === marketType)) {
                        return false;
                    }
                }

                return true;
            }
        );

        const sortedFilteredMarkets = orderBy(
            filteredMarkets,
            ['maturityDate'],
            [
                statusFilter === StatusFilter.RESOLVED_MARKETS ||
                statusFilter === StatusFilter.CANCELLED_MARKETS ||
                statusFilter === StatusFilter.PAUSED_MARKETS
                    ? 'desc'
                    : 'asc',
            ]
        );

        setAvailableMarketTypes(Array.from(marketTypes));

        return sortedFilteredMarkets;
    }, [
        sportMarketsQueryNew.isSuccess,
        sportMarketsQueryNew.data,
        liveSportMarketsQuery.isSuccess,
        liveSportMarketsQuery.data,
        statusFilter,
        marketSearch,
        tagFilter,
        datePeriodFilter,
        sportFilter,
        marketTypeFilter,
        favouriteLeagues,
    ]);

    const marketsLoading =
        sportFilter === SportFilter.Live ? liveSportMarketsQuery.isLoading : sportMarketsQueryNew.isLoading;

    useEffect(() => {
        if (sportFilter == SportFilter.Favourites) {
            const filteredTags = favouriteLeagues.filter((tag: any) => tag.favourite);
            setAvailableTags(filteredTags);
        }
    }, [favouriteLeagues, sportFilter]);

    const openSportMarketsQuery = useSportsMarketsV2Query(StatusFilter.OPEN_MARKETS, networkId, {
        enabled: isAppReady,
    });

    const openMarketsCountPerTag = useMemo(() => {
        const openSportMarkets: SportMarkets =
            openSportMarketsQuery.isSuccess && openSportMarketsQuery.data ? openSportMarketsQuery.data : [];

        const groupedMarkets = groupBy(openSportMarkets, (market) => market.leagueId);

        const openMarketsCountPerTag: any = {};
        Object.keys(groupedMarkets).forEach((key: string) => {
            if (isBoxingLeague(Number(key))) {
                openMarketsCountPerTag[BOXING_LEAGUES[0].toString()] = groupedMarkets[key].length;
            } else {
                openMarketsCountPerTag[key] = groupedMarkets[key].length;
            }
        });
        return openMarketsCountPerTag;
    }, [openSportMarketsQuery]);

    const openMarketsCountPerSport = useMemo(() => {
        const openMarketsCount: any = {};
        let totalCount = 0;
        Object.values(SportFilter).forEach((filterItem: string) => {
            const tagsPerSport = getSportLeagueIds(filterItem as Sport);
            let count = 0;
            if (tagsPerSport) {
                tagsPerSport.forEach((tag) => {
                    count += openMarketsCountPerTag[tag] || 0;
                    totalCount += openMarketsCountPerTag[tag] || 0;
                });
            }

            openMarketsCount[filterItem] = count;
        });
        openMarketsCount[SportFilter.All] = totalCount;

        let favouriteCount = 0;
        const favouriteTags = favouriteLeagues.filter((tag: any) => tag.favourite);
        favouriteTags.forEach((tag: TagInfo) => {
            favouriteCount += openMarketsCountPerTag[tag.id] || 0;
        });
        openMarketsCount[SportFilter.Favourites] = favouriteCount;

        return openMarketsCount;
    }, [openMarketsCountPerTag, favouriteLeagues]);

    const liveMarketsCountPerTag = useMemo(() => {
        const liveSportMarkets: SportMarkets =
            liveSportMarketsQuery.isSuccess && liveSportMarketsQuery.data ? liveSportMarketsQuery.data : [];

        const groupedMarkets = groupBy(liveSportMarkets, (market) => market.leagueId);

        const liveMarketsCountPerTag: any = {};
        Object.keys(groupedMarkets).forEach((key: string) => {
            if (isBoxingLeague(Number(key))) {
                liveMarketsCountPerTag[BOXING_LEAGUES[0].toString()] = groupedMarkets[key].length;
            } else {
                liveMarketsCountPerTag[key] = groupedMarkets[key].length;
            }
        });
        Object.values(SportFilter);
        return liveMarketsCountPerTag;
    }, [liveSportMarketsQuery]);

    const liveMarketsCountPerSport = useMemo(() => {
        const liveMarketsCount: any = {};
        let totalCount = 0;
        Object.keys(liveMarketsCountPerTag).forEach((key) => {
            totalCount += liveMarketsCountPerTag[Number(key)];
        });

        liveMarketsCount[SportFilter.Live] = totalCount;

        let favouriteCount = 0;
        const favouriteTags = favouriteLeagues.filter((tag: any) => tag.favourite);
        favouriteTags.forEach((tag: TagInfo) => {
            favouriteCount += liveMarketsCountPerTag[tag.id] || 0;
        });
        liveMarketsCount[SportFilter.Favourites] = favouriteCount;

        return liveMarketsCount;
    }, [liveMarketsCountPerTag, favouriteLeagues]);

    const resetFilters = useCallback(() => {
        dispatch(setStatusFilter(StatusFilter.OPEN_MARKETS));
        setStatusParam(StatusFilter.OPEN_MARKETS);
        dispatch(setSportFilter(SportFilter.All));
        setSportParam(SportFilter.All);
        setDateParam('');
        dispatch(setDatePeriodFilter(0));
        dispatch(setTagFilter([]));
        setTagParam('');
        setSearchParam('');
        dispatch(setMarketSearch(''));
    }, [dispatch, setDateParam, setStatusParam, setSearchParam, setSportParam, setTagParam]);

    useEffect(() => {
        if (location.state === RESET_STATE) {
            history.replace(location.pathname, '');
            resetFilters();
        }
    }, [location, resetFilters]);

    const getShowActiveCheckbox = () => (
        <CheckboxContainer isMobile={isMobile}>
            <Checkbox
                checked={showActive}
                value={showActive.toString()}
                onChange={(e: any) => {
                    setShowActive(e.target.checked || false);
                    setActiveParam((e.target.checked || false).toString());
                    if (sportFilter === SportFilter.All) {
                        setAvailableTags(tagsList);
                    } else if (sportFilter === SportFilter.Live) {
                        const filteredTags = tagsList.filter(
                            (tag: TagInfo) =>
                                filteredLiveTags.includes(tag.id) &&
                                ((e.target.checked && !!liveMarketsCountPerTag[tag.id]) || !e.target.checked)
                        );
                        setAvailableTags(filteredTags);
                    } else {
                        const tagsPerSport = getSportLeagueIds((sportFilter as unknown) as Sport);
                        if (tagsPerSport) {
                            const filteredTags = tagsList.filter(
                                (tag: TagInfo) =>
                                    tagsPerSport.includes(tag.id) &&
                                    ((e.target.checked && !!openMarketsCountPerTag[tag.id]) || !e.target.checked)
                            );
                            setAvailableTags(filteredTags);
                        } else {
                            setAvailableTags([]);
                        }
                    }
                }}
                label={t(`market.filter-label.show-active`)}
            />
        </CheckboxContainer>
    );

    const getSportFilters = () => (
        <>
            {Object.values(SportFilter)
                .filter(
                    (filterItem: any) =>
                        (showActive && filterItem !== SportFilter.Live && openMarketsCountPerSport[filterItem] > 0) ||
                        (showActive && filterItem === SportFilter.Live && liveMarketsCountPerSport[filterItem] > 0) ||
                        !showActive ||
                        openSportMarketsQuery.isLoading ||
                        filterItem === SportFilter.Favourites
                )
                .map((filterItem: any, index) => {
                    return (
                        <SportTags
                            key={index}
                            onSportClick={() => {
                                if (filterItem !== sportFilter) {
                                    dispatch(setSportFilter(filterItem));
                                    setSportParam(filterItem);
                                    dispatch(setTagFilter([]));
                                    setTagParam('');
                                    if (filterItem === SportFilter.All) {
                                        dispatch(setDatePeriodFilter(0));
                                        setDateParam('');
                                        setAvailableTags(tagsList);
                                    } else if (filterItem === SportFilter.Live) {
                                        setDateParam('');
                                        dispatch(setDatePeriodFilter(0));
                                        const filteredTags = tagsList.filter(
                                            (tag: TagInfo) =>
                                                filteredLiveTags.includes(tag.id) &&
                                                ((showActive && !!liveMarketsCountPerTag[tag.id]) ||
                                                    !showActive ||
                                                    liveSportMarketsQuery.isLoading)
                                        );
                                        setAvailableTags(filteredTags);
                                    } else {
                                        const tagsPerSport = getSportLeagueIds(filterItem as Sport);
                                        if (tagsPerSport) {
                                            const filteredTags = tagsList.filter(
                                                (tag: TagInfo) =>
                                                    tagsPerSport.includes(tag.id) &&
                                                    ((showActive && !!openMarketsCountPerTag[tag.id]) ||
                                                        !showActive ||
                                                        openSportMarketsQuery.isLoading)
                                            );
                                            setAvailableTags(filteredTags);
                                        } else {
                                            setAvailableTags([]);
                                        }
                                    }
                                } else {
                                    dispatch(setTagFilter([]));
                                    setTagParam('');
                                }
                            }}
                            sport={filterItem}
                            sportCount={
                                filterItem == SportFilter.Live
                                    ? liveMarketsCountPerSport[filterItem]
                                    : openMarketsCountPerSport[filterItem]
                            }
                            showActive={showActive}
                            tags={availableTags}
                            setTagParam={setTagParam}
                            openMarketsCountPerTag={openMarketsCountPerTag}
                            liveMarketsCountPerTag={liveMarketsCountPerTag}
                        />
                    );
                })}
        </>
    );

    const getStatusFilters = () => <GlobalFilters />;

    return (
        <Container>
            {showOddsSelectorModal && <OddsSelectorModal onClose={() => setShowOddsSelectorModal(false)} />}
            <ReactModal
                isOpen={showBurger && isMobile}
                onRequestClose={() => {
                    setShowBurger(false);
                }}
                shouldCloseOnOverlayClick={false}
                style={getCustomModalStyles(theme)}
            >
                <BurgerFiltersContainer>
                    <LogoContainer>
                        <Logo />
                    </LogoContainer>
                    {getShowActiveCheckbox()}
                    <SportFiltersContainer>
                        {getSportFilters()}
                        {getStatusFilters()}
                        <TimeFilters />
                    </SportFiltersContainer>
                    <Button
                        onClick={() => setShowBurger(false)}
                        width="180px"
                        height="36px"
                        fontSize="14px"
                        padding="5px 10px"
                        backgroundColor={theme.background.septenary}
                        borderColor={theme.background.septenary}
                        additionalStyles={additionalApplyFiltersButtonStyle}
                    >
                        <FiltersIcon className={`icon icon--filters2`} />
                        {t('market.apply-filters')}
                        <ArrowIcon className={`icon icon--caret-right`} />
                    </Button>
                </BurgerFiltersContainer>
            </ReactModal>

            <RowContainer>
                {/* LEFT FILTERS */}
                <LeftSidebarContainer>
                    <BannerCarousel />
                    <Search
                        text={marketSearch}
                        handleChange={(value) => {
                            dispatch(setMarketSearch(value));
                            setSearchParam(value);
                        }}
                        width={263}
                    />
                    {getShowActiveCheckbox()}
                    <Scroll height="calc(100vh - 430px)">
                        <SportFiltersContainer>
                            {getStatusFilters()}
                            {getSportFilters()}
                        </SportFiltersContainer>
                    </Scroll>
                    <Suspense fallback={<Loader />}>
                        {networkId !== Network.Base && networkId !== Network.OptimismSepolia && <SidebarLeaderboard />}
                    </Suspense>
                </LeftSidebarContainer>

                {/* MAIN PART */}
                <MainContainer>
                    {isMobile && (
                        <>
                            <SportFilterMobile setAvailableTags={setAvailableTags} tagsList={tagsList} />
                            {!marketsLoading &&
                                finalMarkets.length > 0 &&
                                statusFilter === StatusFilter.OPEN_MARKETS &&
                                sportFilter !== SportFilter.Live && (
                                    <Header availableMarketTypes={availableMarketTypes} />
                                )}
                            <FilterTagsMobile />
                        </>
                    )}
                    {marketsLoading ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : (
                        <>
                            {!isMobile && <Breadcrumbs />}
                            {finalMarkets.length === 0 ? (
                                <NoMarketsContainer>
                                    <NoMarketsLabel>
                                        {t('market.no-markets-found')}{' '}
                                        {t(`market.filter-label.sport.${sportFilter.toLowerCase()}`)}
                                    </NoMarketsLabel>
                                    <Button
                                        onClick={resetFilters}
                                        backgroundColor={theme.button.background.secondary}
                                        textColor={theme.button.textColor.quaternary}
                                        borderColor={theme.button.borderColor.secondary}
                                        height="24px"
                                        fontSize="12px"
                                    >
                                        {t('market.view-all-markets')}
                                    </Button>
                                </NoMarketsContainer>
                            ) : (
                                <>
                                    {!isMobile &&
                                        statusFilter === StatusFilter.OPEN_MARKETS &&
                                        sportFilter !== SportFilter.Live && (
                                            <Header availableMarketTypes={availableMarketTypes} />
                                        )}
                                    <FlexDivRow>
                                        {((isMobile && !isMarketSelected && !showTicketMobileModal) || !isMobile) && (
                                            <Suspense
                                                fallback={
                                                    <LoaderContainer>
                                                        <Loader />
                                                    </LoaderContainer>
                                                }
                                            >
                                                <MarketsGridV2 markets={finalMarkets} />
                                            </Suspense>
                                        )}
                                        {isMarketSelected && statusFilter === StatusFilter.OPEN_MARKETS && (
                                            <SelectedMarket availableMarketTypes={availableMarketTypes} />
                                        )}
                                    </FlexDivRow>
                                </>
                            )}
                        </>
                    )}
                </MainContainer>
                {/* RIGHT PART */}
                <RightSidebarContainer>
                    <Suspense fallback={<Loader />}>
                        <Parlay />
                    </Suspense>
                </RightSidebarContainer>
            </RowContainer>
            {isMobile && showTicketMobileModal && (
                <Suspense fallback={<Loader />}>
                    <TicketMobileModal onClose={() => setShowTicketMobileModal(false)} />
                </Suspense>
            )}
            {isMobile && (
                <Suspense fallback={<Loader />}>
                    <FooterSidebarMobile
                        setParlayMobileVisibility={setShowTicketMobileModal}
                        setShowBurger={setShowBurger}
                    />
                </Suspense>
            )}
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 100%;
    margin-top: 15px;
    @media (max-width: 767px) {
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
    max-width: 821px;
    flex-grow: 1;
    margin-right: 10px;
    @media (max-width: 1199px) {
        margin-right: 5px;
    }
    @media (max-width: 950px) {
        max-width: 100%;
    }
`;

const SidebarContainer = styled(FlexDivColumn)`
    flex-grow: 1;
    min-width: 250px;
    @media (max-width: 950px) {
        display: none;
    }
`;

const LeftSidebarContainer = styled(SidebarContainer)`
    max-width: 278px;
    margin-right: 10px;
    @media (max-width: 1199px) {
        margin-right: 5px;
        max-width: 268px;
    }
`;

const RightSidebarContainer = styled(SidebarContainer)`
    max-width: 360px;
    @media (max-width: 1199px) {
        max-width: 320px;
    }
`;

const SportFiltersContainer = styled(FlexDivColumn)`
    padding-bottom: 5px;
    padding-top: 5px;
    padding-right: 15px;
    @media (max-width: 1199px) {
        padding-right: 10px;
    }
    @media (max-width: 1199px) {
        padding-left: 30px;
        padding-right: 30px;
    }
    flex: initial;
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
`;

const NoMarketsLabel = styled.span`
    margin-bottom: 15px;
    text-align: center;
    font-size: 16px;
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
    background: ${(props) => props.theme.background.secondary};
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
    margin-top: 30px;
    margin-bottom: 20px;
    text-align: center;
`;

const FiltersIcon = styled.i`
    font-size: 15px;
    font-weight: 400;
    text-transform: none;
    margin-right: 8px;
    margin-top: -2px;
`;

const ArrowIcon = styled.i`
    font-size: 15px;
    font-weight: 400;
    margin-left: 8px;
    text-transform: none;
`;

const getCustomModalStyles = (theme: ThemeInterface) => ({
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
        backgroundColor: theme.background.secondary,
        zIndex: '1000',
    },
});

const additionalApplyFiltersButtonStyle: CSSProperties = {
    alignSelf: 'center',
    borderRadius: '40px',
    bottom: '3%',
    position: 'fixed',
};

const CheckboxContainer = styled.div<{ isMobile: boolean }>`
    margin-left: ${(props) => (props.isMobile ? '34px' : '5px')};
    margin-top: 15px;
    margin-bottom: 10px;
    label {
        color: ${(props) => (props.isMobile ? props.theme.textColor.primary : props.theme.textColor.quinary)};
        font-size: ${(props) => (props.isMobile ? '14px' : '12px')};
        line-height: ${(props) => (props.isMobile ? '19px' : '13px')};
        font-weight: 600;
        letter-spacing: 0.035em;
        text-transform: uppercase;
        padding-top: ${(props) => (props.isMobile ? '0px' : '2px')};
        padding-left: ${(props) => (props.isMobile ? '38px' : '28px')};
        input:checked ~ .checkmark {
            border: 2px solid
                ${(props) => (props.isMobile ? props.theme.background.septenary : props.theme.borderColor.quaternary)};
        }
    }
    .checkmark {
        height: ${(props) => (props.isMobile ? '18px' : '15px')};
        width: ${(props) => (props.isMobile ? '18px' : '15px')};
        border: 2px solid
            ${(props) => (props.isMobile ? props.theme.background.septenary : props.theme.borderColor.primary)};
        :after {
            left: ${(props) => (props.isMobile ? '4px' : '3px')};
            width: ${(props) => (props.isMobile ? '4px' : '3px')};
            height: ${(props) => (props.isMobile ? '9px' : '8px')};
            top: ${(props) => (props.isMobile ? '0px' : '-1px')};
            border: 2px solid
                ${(props) => (props.isMobile ? props.theme.background.septenary : props.theme.borderColor.quaternary)};
            border-width: 0 2px 2px 0;
        }
    }
`;

export default Home;
