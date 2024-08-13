import Button from 'components/Button';
import GetUsd from 'components/GetUsd';
import Loader from 'components/Loader';
import Logo from 'components/Logo';
import OddsSelectorModal from 'components/OddsSelectorModal';
import Search from 'components/Search';
import SimpleLoader from 'components/SimpleLoader';
import { RESET_STATE } from 'constants/routes';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { BOXING_TAGS, EUROPA_LEAGUE_TAGS, SPORTS_TAGS_MAP, TAGS_LIST } from 'constants/tags';
import { GlobalFiltersEnum, SportFilterEnum } from 'enums/markets';
import { Network } from 'enums/network';
import useLocalStorage from 'hooks/useLocalStorage';
import i18n from 'i18n';
import { groupBy, orderBy } from 'lodash';
import useSGPFeesQuery from 'queries/markets/useSGPFeesQuery';
import useSportMarketsQuery from 'queries/markets/useSportsMarketsQuery';
import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getMarketSearch, setMarketSearch } from 'redux/modules/market';
import { setSGPFees } from 'redux/modules/parlay';
import { getFavouriteLeagues } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { CSSProperties, useTheme } from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { addHoursToCurrentDate, localStore } from 'thales-utils';
import { SportMarketInfo, SportMarkets, TagInfo, Tags } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { history } from 'utils/routes';
import useQueryParam from 'utils/useQueryParams';
import Checkbox from '../../../components/fields/Checkbox/Checkbox';
import FilterTagsMobile from '../components/FilterTagsMobile';
import GlobalFilters from '../components/GlobalFilters';
import SportFilter from '../components/SportFilter';
import SportFilterMobile from '../components/SportFilter/SportFilterMobile';
import TagsDropdown from '../components/TagsDropdown';

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
    const theme: ThemeInterface = useTheme();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const marketSearch = useSelector((state: RootState) => getMarketSearch(state));
    const location = useLocation();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [globalFilter, setGlobalFilter] = useLocalStorage<GlobalFiltersEnum>(
        LOCAL_STORAGE_KEYS.FILTER_GLOBAL,
        GlobalFiltersEnum.OpenMarkets
    );
    const [sportFilter, setSportFilter] = useLocalStorage(LOCAL_STORAGE_KEYS.FILTER_SPORT, SportFilterEnum.All);
    const [showBurger, setShowBurger] = useState<boolean>(false);
    const [showActive, setShowActive] = useLocalStorage(LOCAL_STORAGE_KEYS.FILTER_ACTIVE, true);
    const [showParlayMobileModal, setshowParlayMobileModal] = useState<boolean>(false);
    const [showOddsSelectorModal, setShowOddsSelectorModal] = useState<boolean>(false);
    const getSelectedOddsType = localStore.get(LOCAL_STORAGE_KEYS.ODDS_TYPE);

    const tagsList = orderBy(
        TAGS_LIST.filter((tag) => !tag.hidden),
        ['priority', 'label'],
        ['asc', 'asc']
    ).map((tag) => {
        return { id: tag.id, label: tag.label, logo: tag.logo, favourite: tag.favourite };
    });

    const sgpFees = useSGPFeesQuery(networkId, {
        enabled: isWalletConnected,
    });

    useEffect(() => {
        if (sgpFees.isSuccess && sgpFees.data) {
            dispatch(setSGPFees(sgpFees.data));
        }
    }, [dispatch, sgpFees.data, sgpFees.isSuccess]);

    useEffect(() => {
        if (getSelectedOddsType == undefined) {
            setShowOddsSelectorModal(true);
        }
    }, [getSelectedOddsType]);

    const favouriteLeagues = useSelector(getFavouriteLeagues);

    const [tagFilter, setTagFilter] = useLocalStorage<Tags>(LOCAL_STORAGE_KEYS.FILTER_TAGS, []);
    const [availableTags, setAvailableTags] = useState<Tags>(tagsList);

    const [dateFilter, setDateFilter] = useLocalStorage<Date | number>(LOCAL_STORAGE_KEYS.FILTER_DATE, 0);

    const [sportParam, setSportParam] = useQueryParam('sport', '');
    const [globalFilterParam, setGlobalFilterParam] = useQueryParam('globalFilter', '');
    const [searchParam, setSearchParam] = useQueryParam('searchParam', '');
    const [dateParam, setDateParam] = useQueryParam('date', '');
    const [tagParam, setTagParam] = useQueryParam('tag', '');
    const [selectedLanguage, setSelectedLanguage] = useQueryParam('lang', '');
    const [activeParam, setActiveParam] = useQueryParam('showActive', '');

    const calculateDate = (hours: number, endOfDay?: boolean) => {
        const calculatedDate = addHoursToCurrentDate(hours, endOfDay);
        setDateFilter(calculatedDate.getTime());
    };

    useEffect(
        () => {
            if (
                globalFilter !== GlobalFiltersEnum.OpenMarkets &&
                globalFilter !== GlobalFiltersEnum.PendingMarkets &&
                globalFilter !== GlobalFiltersEnum.ResolvedMarkets &&
                globalFilter !== GlobalFiltersEnum.Canceled
            ) {
                resetFilters();
            }

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
            activeParam != '' ? setShowActive(activeParam === 'true') : setActiveParam(showActive.toString());
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const sportMarketsQueryNew = useSportMarketsQuery(globalFilter, networkId, { enabled: isAppReady });

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

        const filteredMarkets = (allMarkets[globalFilter] || allMarkets[GlobalFiltersEnum.OpenMarkets]).filter(
            (market: SportMarketInfo) => {
                if (marketSearch) {
                    if (
                        !market.homeTeam.toLowerCase().includes(marketSearch.toLowerCase()) &&
                        !market.awayTeam.toLowerCase().includes(marketSearch.toLowerCase())
                    ) {
                        return false;
                    }
                }

                if (tagFilter.length > 0) {
                    if (EUROPA_LEAGUE_TAGS.includes(market.tags.map((tag) => Number(tag))[0])) {
                        if (
                            !tagFilter.map((tag) => tag.id).includes(EUROPA_LEAGUE_TAGS[0]) &&
                            !tagFilter.map((tag) => tag.id).includes(EUROPA_LEAGUE_TAGS[1])
                        ) {
                            return false;
                        }
                    } else if (BOXING_TAGS.includes(market.tags.map((tag) => Number(tag))[0])) {
                        if (
                            !tagFilter.map((tag) => tag.id).includes(BOXING_TAGS[0]) &&
                            !tagFilter.map((tag) => tag.id).includes(BOXING_TAGS[1])
                        ) {
                            return false;
                        }
                    } else if (!tagFilter.map((tag) => tag.id).includes(market.tags.map((tag) => Number(tag))[0])) {
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
            }
        );

        const sortedFilteredMarkets = orderBy(
            filteredMarkets,
            ['maturityDate'],
            [
                globalFilter === GlobalFiltersEnum.ResolvedMarkets || globalFilter === GlobalFiltersEnum.Canceled
                    ? 'desc'
                    : 'asc',
            ]
        );

        return sortedFilteredMarkets;
    }, [marketSearch, tagFilter, dateFilter, sportFilter, globalFilter, favouriteLeagues, sportMarketsQueryNew]);

    useEffect(() => {
        if (sportFilter == SportFilterEnum.Favourites) {
            const filteredTags = favouriteLeagues.filter((tag: any) => tag.favourite);
            setAvailableTags(filteredTags);
        }
    }, [favouriteLeagues, sportFilter]);

    const openSportMarketsQuery = useSportMarketsQuery(GlobalFiltersEnum.OpenMarkets, networkId, {
        enabled: isAppReady,
    });

    const openMarketsCountPerTag = useMemo(() => {
        const openSportMarkets: SportMarkets =
            openSportMarketsQuery.isSuccess && openSportMarketsQuery.data
                ? openSportMarketsQuery.data[GlobalFiltersEnum.OpenMarkets]
                : [];

        const groupedMarkets = groupBy(openSportMarkets, (market) => market.tags[0]);

        const openMarketsCountPerTag: any = {};
        Object.keys(groupedMarkets).forEach((key: string) => {
            if (EUROPA_LEAGUE_TAGS.includes(Number(key))) {
                openMarketsCountPerTag[EUROPA_LEAGUE_TAGS[0].toString()] = groupedMarkets[key].length;
            } else if (BOXING_TAGS.includes(Number(key))) {
                openMarketsCountPerTag[BOXING_TAGS[0].toString()] = groupedMarkets[key].length;
            } else {
                openMarketsCountPerTag[key] = groupedMarkets[key].length;
            }
        });
        Object.values(SportFilterEnum);
        return openMarketsCountPerTag;
    }, [openSportMarketsQuery]);

    const openMarketsCountPerSport = useMemo(() => {
        const openMarketsCount: any = {};
        let totalCount = 0;
        Object.values(SportFilterEnum).forEach((filterItem: string) => {
            const tagsPerSport = SPORTS_TAGS_MAP[filterItem];
            let count = 0;
            if (tagsPerSport) {
                tagsPerSport.forEach((tag) => {
                    count += openMarketsCountPerTag[tag] || 0;
                    totalCount += openMarketsCountPerTag[tag] || 0;
                });
            }

            openMarketsCount[filterItem] = count;
        });
        openMarketsCount[SportFilterEnum.All] = totalCount;

        let favouriteCount = 0;
        const favouriteTags = favouriteLeagues.filter((tag: any) => tag.favourite);
        favouriteTags.forEach((tag: TagInfo) => {
            favouriteCount += openMarketsCountPerTag[tag.id] || 0;
        });
        openMarketsCount[SportFilterEnum.Favourites] = favouriteCount;

        return openMarketsCount;
    }, [openMarketsCountPerTag, favouriteLeagues]);

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
                    <CheckboxContainer isMobile={isMobile}>
                        <Checkbox
                            checked={showActive}
                            value={showActive.toString()}
                            onChange={(e: any) => {
                                setShowActive(e.target.checked || false);
                                setActiveParam((e.target.checked || false).toString());
                                if (sportFilter === SportFilterEnum.All) {
                                    setAvailableTags(tagsList);
                                } else {
                                    const tagsPerSport = SPORTS_TAGS_MAP[sportFilter];
                                    if (tagsPerSport) {
                                        const filteredTags = tagsList.filter(
                                            (tag: TagInfo) =>
                                                tagsPerSport.includes(tag.id) &&
                                                ((e.target.checked && !!openMarketsCountPerTag[tag.id]) ||
                                                    !e.target.checked)
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
                    <SportFiltersContainer>
                        {Object.values(SportFilterEnum)
                            .filter(
                                (filterItem: any) =>
                                    (showActive && openMarketsCountPerSport[filterItem] > 0) ||
                                    !showActive ||
                                    openSportMarketsQuery.isLoading ||
                                    filterItem === SportFilterEnum.Favourites
                            )
                            .map((filterItem: any, index) => {
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
                                                    if (filterItem === SportFilterEnum.All) {
                                                        setDateFilter(0);
                                                        setDateParam('');
                                                        setAvailableTags(tagsList);
                                                    } else {
                                                        const tagsPerSport = SPORTS_TAGS_MAP[filterItem];
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
                                                    setSportFilter(SportFilterEnum.All);
                                                    setSportParam(SportFilterEnum.All);
                                                    setTagFilter([]);
                                                    setTagParam('');
                                                    setAvailableTags(tagsList);
                                                }
                                            }}
                                            key={filterItem}
                                            isMobile={isMobile}
                                            count={openMarketsCountPerSport[filterItem]}
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
                                            openMarketsCountPerTag={openMarketsCountPerTag}
                                            showActive={showActive}
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
                            globalFilter={globalFilter}
                            dateFilter={dateFilter}
                            sportFilter={sportFilter}
                            isMobile={isMobile}
                        />
                    </GlobalFiltersContainer>
                    <Button
                        onClick={() => setShowBurger(false)}
                        width="180px"
                        height="43px"
                        fontSize="16px"
                        padding="5px 10px"
                        backgroundColor={theme.button.background.quaternary}
                        borderColor={theme.button.borderColor.secondary}
                        additionalStyles={additionalApplyFiltersButtonStyle}
                    >
                        {t('market.apply-filters')}
                        <ArrowIcon className={`icon icon--arrow-up`} />
                    </Button>
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
                    <CheckboxContainer isMobile={isMobile}>
                        <Checkbox
                            checked={showActive}
                            value={showActive.toString()}
                            onChange={(e: any) => {
                                setShowActive(e.target.checked || false);
                                setActiveParam((e.target.checked || false).toString());
                                if (sportFilter === SportFilterEnum.All) {
                                    setAvailableTags(tagsList);
                                } else {
                                    const tagsPerSport = SPORTS_TAGS_MAP[sportFilter];
                                    if (tagsPerSport) {
                                        const filteredTags = tagsList.filter(
                                            (tag: TagInfo) =>
                                                tagsPerSport.includes(tag.id) &&
                                                ((e.target.checked && !!openMarketsCountPerTag[tag.id]) ||
                                                    !e.target.checked)
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
                    <SportFiltersContainer>
                        {Object.values(SportFilterEnum)
                            .filter(
                                (filterItem: any) =>
                                    (showActive && openMarketsCountPerSport[filterItem] > 0) ||
                                    !showActive ||
                                    openSportMarketsQuery.isLoading ||
                                    filterItem === SportFilterEnum.Favourites
                            )
                            .map((filterItem: any, index) => {
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
                                                    if (filterItem === SportFilterEnum.All) {
                                                        setDateFilter(0);
                                                        setDateParam('');
                                                        setAvailableTags(tagsList);
                                                    } else {
                                                        const tagsPerSport = SPORTS_TAGS_MAP[filterItem];
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
                                                    setSportFilter(SportFilterEnum.All);
                                                    setSportParam(SportFilterEnum.All);
                                                    setTagFilter([]);
                                                    setTagParam('');
                                                    setAvailableTags(tagsList);
                                                }
                                            }}
                                            key={filterItem}
                                            count={openMarketsCountPerSport[filterItem]}
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
                                            openMarketsCountPerTag={openMarketsCountPerTag}
                                            showActive={showActive}
                                        ></TagsDropdown>
                                    </React.Fragment>
                                );
                            })}
                    </SportFiltersContainer>
                </SidebarContainer>
                {/* MAIN PART */}

                <MainContainer>
                    {isMobile && (
                        <>
                            <SportFilterMobile
                                sportFilter={sportFilter}
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
                            globalFilter={globalFilter}
                            dateFilter={dateFilter}
                            sportFilter={sportFilter}
                            isMobile={isMobile}
                        />
                    )}
                    {sportMarketsQueryNew.isLoading ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : (
                        <>
                            {finalMarkets.length === 0 ? (
                                <NoMarketsContainer>
                                    <NoMarketsLabel>
                                        {t('market.no-markets-found')}{' '}
                                        {t(`market.filter-label.sport.${sportFilter.toLowerCase()}`)}
                                    </NoMarketsLabel>
                                    <Button
                                        onClick={resetFilters}
                                        backgroundColor={theme.button.background.tertiary}
                                        textColor={theme.button.textColor.quaternary}
                                        borderColor={theme.button.borderColor.secondary}
                                        fontWeight="400"
                                        fontSize="15px"
                                    >
                                        {t('market.view-all-markets')}
                                    </Button>
                                </NoMarketsContainer>
                            ) : (
                                <Suspense fallback={<Loader />}>
                                    <MarketsGrid markets={finalMarkets} />
                                </Suspense>
                            )}
                        </>
                    )}
                </MainContainer>
                {/* RIGHT PART */}
                <SidebarContainer maxWidth={320}>
                    {[Network.OptimismMainnet, Network.Arbitrum].includes(networkId) && <GetUsd />}
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
        margin-left: 30px;
        margin-right: 30px;
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
`;

const NoMarketsLabel = styled.span`
    margin-bottom: 20px;
    text-align: center;
    font-size: 20px;
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
    margin-top: 20px;
    margin-bottom: 10px;
    text-align: center;
`;

const ArrowIcon = styled.i`
    font-size: 30px;
    margin-right: -10px;
    text-transform: none;
    writing-mode: vertical-lr;
`;

const getCustomModalStyles = (theme: ThemeInterface) => ({
    content: {
        top: '0',
        overflow: 'auto',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-48%',
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
    margin-left: ${(props) => (props.isMobile ? '34px' : '6px')};
    margin-top: 15px;
    label {
        color: ${(props) => props.theme.textColor.secondary};
        font-size: ${(props) => (props.isMobile ? '17px' : '12px')};
        line-height: ${(props) => (props.isMobile ? '19px' : '13px')};
        font-weight: 600;
        letter-spacing: 0.035em;
        text-transform: uppercase;
        padding-top: 2px;
        padding-left: ${(props) => (props.isMobile ? '38px' : '35px')};
        input:checked ~ .checkmark {
            border: 2px solid ${(props) => props.theme.borderColor.quaternary};
        }
    }
    .checkmark {
        height: ${(props) => (props.isMobile ? '19px' : '15px')};
        width: ${(props) => (props.isMobile ? '19px' : '15px')};
        border: 2px solid ${(props) => props.theme.borderColor.primary};
        :after {
            left: ${(props) => (props.isMobile ? '5px' : '3px')};
            width: ${(props) => (props.isMobile ? '4px' : '3px')};
            height: ${(props) => (props.isMobile ? '12px' : '8px')};
            border: 2px solid ${(props) => props.theme.borderColor.quaternary};
            border-width: 0 2px 2px 0;
        }
    }
`;

export default Home;
