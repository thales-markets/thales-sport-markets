import Button from 'components/Button';
import SimpleLoader from 'components/SimpleLoader';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'constants/defaults';
import useDebouncedMemo from 'hooks/useDebouncedMemo';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRow, FlexDivStart } from 'styles/common';
import {
    AccountPosition,
    AccountPositionsMap,
    GamesOnDate,
    SortOptionType,
    SportMarketInfo,
    SportMarkets,
    TagInfo,
    Tags,
} from 'types/markets';
import TagButton from '../../../components/TagButton';
import GlobalFilter from '../components/GlobalFilter';
import MarketsGrid from './MarketsGrid';
import RangedDatepicker from 'components/RangedDatepicker';
import Search from 'components/Search';
import {
    DEFAULT_SORT_BY,
    GlobalFilterEnum,
    ODDS_TYPES,
    OddsType,
    SortDirection,
    SportFilterEnum,
} from 'constants/markets';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { SPORTS_TAGS_MAP, TAGS_LIST } from 'constants/tags';
import useLocalStorage from 'hooks/useLocalStorage';
import useAccountPositionsQuery from 'queries/markets/useAccountPositionsQuery';
import { getMarketSearch, setMarketSearch } from 'redux/modules/market';
import { isClaimAvailable } from 'utils/markets';
import SortOption from '../components/SortOption';
import SportFilter from '../components/SportFilter';
import ViewSwitch from '../components/ViewSwitch';
import HeaderDatepicker from './HeaderDatepicker';
import UserHistory from './UserHistory';
import burger from 'assets/images/burger.svg';
import Logo from 'components/Logo';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import useSportMarketsQuery, { marketsCache } from 'queries/markets/useSportMarketsQuery';
import Dropdown from '../../../components/Dropdown';
import { getOddsType, setOddsType } from '../../../redux/modules/ui';
import SPAAnchor from 'components/SPAAnchor';
import { buildHref } from 'utils/routes';
import ROUTES from 'constants/routes';

const Home: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const marketSearch = useSelector((state: RootState) => getMarketSearch(state));
    const { trackPageView } = useMatomo();

    const [lastValidMarkets, setLastValidMarkets] = useState<SportMarkets>([]);
    const [globalFilter, setGlobalFilter] = useLocalStorage<GlobalFilterEnum>(
        LOCAL_STORAGE_KEYS.FILTER_GLOBAL,
        GlobalFilterEnum.OpenMarkets
    );
    const [sportFilter, setSportFilter] = useLocalStorage(LOCAL_STORAGE_KEYS.FILTER_SPORT, SportFilterEnum.All);
    const [sortDirection, setSortDirection] = useLocalStorage(LOCAL_STORAGE_KEYS.SORT_DIRECTION, SortDirection.ASC);
    const [sortBy, setSortBy] = useLocalStorage(LOCAL_STORAGE_KEYS.SORT_BY, DEFAULT_SORT_BY);
    const [showListView, setListView] = useLocalStorage(LOCAL_STORAGE_KEYS.LIST_VIEW, true);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [marketsCached, setMarketsCached] = useState<typeof marketsCache>(marketsCache);
    const [showBurger, setShowBurger] = useState<boolean>(false);
    const selectedOddsType = useSelector(getOddsType);
    const setSelectedOddsType = useCallback(
        (oddsType: OddsType) => {
            return dispatch(setOddsType(oddsType));
        },
        [dispatch]
    );
    const sortOptions: SortOptionType[] = [
        { id: 1, title: t('market.time-remaining-label') },
        { id: 2, title: t('market.sport') },
    ];

    const allTagsFilterItem: TagInfo = {
        id: 0,
        label: t('market.filter-label.all'),
    };

    const [tagFilter, setTagFilter] = useLocalStorage(LOCAL_STORAGE_KEYS.FILTER_TAGS, allTagsFilterItem);
    const [availableTags, setAvailableTags] = useState<Tags>([
        allTagsFilterItem,
        ...TAGS_LIST.sort((a, b) => a.label.localeCompare(b.label)),
    ]);

    const [dateFilter, setDateFilter] = useLocalStorage(LOCAL_STORAGE_KEYS.FILTER_DATES, new Date().toDateString());
    const [gamesPerDay, setGamesPerDayMap] = useState<GamesOnDate[]>([]);

    const sportMarketsQuery = useSportMarketsQuery(networkId, globalFilter, setMarketsCached, { enabled: isAppReady });

    useEffect(() => {
        if (sportMarketsQuery.isSuccess && sportMarketsQuery.data) {
            setLastValidMarkets(marketsCached[globalFilter]);
        }
    }, [sportMarketsQuery.isSuccess, sportMarketsQuery.data, globalFilter]);

    const markets: SportMarkets = useMemo(() => {
        if (sportMarketsQuery.isSuccess && sportMarketsQuery.data) {
            return marketsCached[globalFilter];
        }
        return lastValidMarkets;
    }, [sportMarketsQuery.isSuccess, sportMarketsQuery.data, lastValidMarkets, globalFilter]);

    useEffect(() => {
        const marketDates = markets
            .filter((market: SportMarketInfo) => market.maturityDate >= new Date())
            .map((market: SportMarketInfo) => market.maturityDate);
        const uniqueSortedDates = marketDates
            .filter((date, i, self) => self.findIndex((d) => d.toDateString() === date.toDateString()) === i)
            .sort((a, b) => a.getTime() - b.getTime());

        const daysNumberOfGames = new Array<GamesOnDate>();
        uniqueSortedDates.forEach((date) => {
            const gamesPerDay = markets.filter((market: SportMarketInfo) => {
                if (sportFilter !== SportFilterEnum.All) {
                    return market.maturityDate.toDateString() === date?.toDateString() && market.sport === sportFilter;
                } else {
                    return market.maturityDate.toDateString() === date?.toDateString();
                }
            }).length;
            daysNumberOfGames.push({ date: date.toDateString(), numberOfGames: gamesPerDay });
        });
        setGamesPerDayMap(daysNumberOfGames);
    }, [markets, sportFilter]);

    const accountPositionsQuery = useAccountPositionsQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const accountPositions: AccountPositionsMap = accountPositionsQuery.isSuccess ? accountPositionsQuery.data : {};

    const searchFilteredMarkets = useDebouncedMemo(
        () => {
            return marketSearch
                ? markets.filter(
                      (market: SportMarketInfo) =>
                          market.homeTeam.toLowerCase().includes(marketSearch.toLowerCase()) ||
                          market.awayTeam.toLowerCase().includes(marketSearch.toLowerCase())
                  )
                : markets;
        },
        [markets, marketSearch],
        DEFAULT_SEARCH_DEBOUNCE_MS
    );

    const datesFilteredMarkets = useMemo(() => {
        let filteredMarkets = marketSearch ? searchFilteredMarkets : markets;

        if (dateFilter !== '') {
            filteredMarkets = filteredMarkets.filter(
                (market: SportMarketInfo) => market.maturityDate.toDateString() === dateFilter
            );
        }
        return filteredMarkets;
    }, [markets, searchFilteredMarkets, dateFilter, marketSearch]);

    const dateRangeFilteredMarkets = useMemo(() => {
        let filteredMarkets = marketSearch ? searchFilteredMarkets : markets;

        if (startDate !== null && endDate !== null) {
            filteredMarkets = filteredMarkets.filter(
                (market: SportMarketInfo) => market.maturityDate >= startDate && market.maturityDate <= endDate
            );
        }
        return filteredMarkets;
    }, [markets, startDate, endDate, marketSearch]);

    const sportFilteredMarkets = useMemo(() => {
        let filteredMarkets = startDate !== null && endDate !== null ? dateRangeFilteredMarkets : datesFilteredMarkets;

        if (sportFilter !== SportFilterEnum.All) {
            filteredMarkets = filteredMarkets.filter((market: SportMarketInfo) => market.sport === sportFilter);
        }

        return filteredMarkets;
    }, [datesFilteredMarkets, sportFilter, markets, marketSearch, dateRangeFilteredMarkets]);

    const tagsFilteredMarkets = useMemo(() => {
        let filteredMarkets = sportFilteredMarkets;

        if (tagFilter.id !== allTagsFilterItem.id) {
            filteredMarkets = filteredMarkets.filter((market: SportMarketInfo) =>
                market.tags.map((tag) => Number(tag)).includes(tagFilter.id)
            );
        }

        return filteredMarkets;
    }, [sportFilteredMarkets, tagFilter.id, allTagsFilterItem.id]);

    const accountClaimsCount = useMemo(() => {
        if (sportMarketsQuery.data) {
            const allMarketsFiltered = filterMarketsForCount(
                marketsCached[GlobalFilterEnum.All],
                marketSearch,
                dateFilter,
                startDate,
                endDate,
                sportFilter,
                tagFilter,
                allTagsFilterItem
            );

            return allMarketsFiltered.filter((market: SportMarketInfo) => {
                const accountPositionsPerMarket: AccountPosition[] = accountPositions[market.address];
                return isClaimAvailable(accountPositionsPerMarket);
            }).length;
        }
    }, [tagsFilteredMarkets, accountPositions, marketsCached]);

    const [allMarketsCount, openedMarketsCount, resolvedMarketsCount, canceledCount] = useMemo(() => {
        let [allMarketsCount, openedMarketsCount, resolvedMarketsCount, canceledCount] = [0, 0, 0, 0];
        if (sportMarketsQuery.data) {
            const allMarketsFiltered = filterMarketsForCount(
                marketsCached[GlobalFilterEnum.All],
                marketSearch,
                dateFilter,
                startDate,
                endDate,
                sportFilter,
                tagFilter,
                allTagsFilterItem
            );
            allMarketsCount = allMarketsFiltered.length;

            const openedMarketsFiltered = filterMarketsForCount(
                marketsCached[GlobalFilterEnum.OpenMarkets],
                marketSearch,
                dateFilter,
                startDate,
                endDate,
                sportFilter,
                tagFilter,
                allTagsFilterItem
            );
            openedMarketsCount = openedMarketsFiltered.length;

            const canceledMarketsFiltered = filterMarketsForCount(
                marketsCached[GlobalFilterEnum.Canceled],
                marketSearch,
                dateFilter,
                startDate,
                endDate,
                sportFilter,
                tagFilter,
                allTagsFilterItem
            );
            canceledCount = canceledMarketsFiltered.length;

            const resolvedMarketsFiltered = filterMarketsForCount(
                marketsCached[GlobalFilterEnum.ResolvedMarkets],
                marketSearch,
                dateFilter,
                startDate,
                endDate,
                sportFilter,
                tagFilter,
                allTagsFilterItem
            );
            resolvedMarketsCount = resolvedMarketsFiltered.length;
        }

        return [allMarketsCount, openedMarketsCount, resolvedMarketsCount, canceledCount];
    }, [
        allTagsFilterItem.id,
        dateFilter,
        endDate,
        marketSearch,
        markets,
        sportFilter,
        startDate,
        tagFilter.id,
        tagsFilteredMarkets,
        marketsCached,
    ]);

    const accountPositionsCount = useMemo(() => {
        if (sportMarketsQuery.data) {
            const allMarketsFiltered = filterMarketsForCount(
                marketsCached[GlobalFilterEnum.All],
                marketSearch,
                dateFilter,
                startDate,
                endDate,
                sportFilter,
                tagFilter,
                allTagsFilterItem
            );

            return allMarketsFiltered.filter((market: SportMarketInfo) => {
                const accountPositionsPerMarket: AccountPosition[] = accountPositions[market.address];
                let positionExists = false;
                accountPositionsPerMarket?.forEach((accountPosition) =>
                    accountPosition.amount > 0 ? (positionExists = true) : ''
                );
                return positionExists;
            }).length;
        }
    }, [tagsFilteredMarkets, accountPositions, marketsCached]);

    const marketsList = useMemo(() => {
        let filteredMarkets = tagsFilteredMarkets;

        switch (globalFilter) {
            case GlobalFilterEnum.OpenMarkets:
                filteredMarkets = filteredMarkets.filter(
                    (market: SportMarketInfo) =>
                        market.isOpen &&
                        !market.isCanceled &&
                        (market.homeOdds !== 0 || market.awayOdds !== 0 || market.drawOdds !== 0)
                );
                break;
            case GlobalFilterEnum.ResolvedMarkets:
                filteredMarkets = filteredMarkets.filter(
                    (market: SportMarketInfo) =>
                        market.isResolved &&
                        !market.isCanceled &&
                        market.maturityDate.getTime() + 7 * 24 * 60 * 60 * 1000 > new Date().getTime()
                );
                break;
            case GlobalFilterEnum.YourPositions:
                filteredMarkets = filteredMarkets.filter((market: SportMarketInfo) => {
                    const accountPositionsPerMarket: AccountPosition[] = accountPositions[market.address];
                    let positionExists = false;
                    accountPositionsPerMarket?.forEach((accountPosition) =>
                        accountPosition.amount > 0 ? (positionExists = true) : ''
                    );
                    return positionExists;
                });
                break;
            case GlobalFilterEnum.Claim:
                filteredMarkets = filteredMarkets.filter((market: SportMarketInfo) => {
                    const accountPositionsPerMarket: AccountPosition[] = accountPositions[market.address];
                    return isClaimAvailable(accountPositionsPerMarket);
                });
                break;
            case GlobalFilterEnum.Canceled:
                filteredMarkets = filteredMarkets.filter((market: SportMarketInfo) => market.isCanceled);
                break;
            case GlobalFilterEnum.Archived:
                filteredMarkets = filteredMarkets.filter(
                    (market: SportMarketInfo) =>
                        (market.isResolved || market.isCanceled) &&
                        market.maturityDate.getTime() + 7 * 24 * 60 * 60 * 1000 < new Date().getTime()
                );
                break;
            default:
                break;
        }

        const sortedFilteredMarkets = filteredMarkets.sort((a, b) => {
            switch (sortBy) {
                case 1:
                    return sortByField(a, b, sortDirection, 'maturityDate');
                case 2:
                    return sortByField(a, b, sortDirection, 'sport');
                default:
                    return 0;
            }
        });

        return groupBySortedMarkets(sortedFilteredMarkets);
    }, [tagsFilteredMarkets, sortBy, sortDirection, globalFilter]);

    const setSort = (sortOption: SortOptionType) => {
        if (sortBy === sortOption.id) {
            switch (sortDirection) {
                case SortDirection.NONE:
                    setSortDirection(SortDirection.DESC);
                    break;
                case SortDirection.DESC:
                    setSortDirection(SortDirection.ASC);
                    break;
                case SortDirection.ASC:
                    setSortDirection(SortDirection.DESC);
                    setSortBy(DEFAULT_SORT_BY);
                    break;
            }
        } else {
            setSortBy(sortOption.id);
            setSortDirection(SortDirection.DESC);
        }
    };

    const onDateRangeChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        end ? setDateFilter('') : '';
        setStartDate(start);
        end?.setHours(end.getHours() + 23);
        end?.setMinutes(end.getMinutes() + 59);
        setEndDate(end);
    };

    const getCount = (filter: GlobalFilterEnum) => {
        switch (filter) {
            case GlobalFilterEnum.OpenMarkets:
                return openedMarketsCount;
            case GlobalFilterEnum.ResolvedMarkets:
                return resolvedMarketsCount;
            case GlobalFilterEnum.Canceled:
                return canceledCount;
            case GlobalFilterEnum.YourPositions:
                return accountPositionsCount;
            case GlobalFilterEnum.Claim:
                return accountClaimsCount;
            case GlobalFilterEnum.All:
                return allMarketsCount;
            default:
                return undefined;
        }
    };

    const resetFilters = () => {
        setGlobalFilter(GlobalFilterEnum.OpenMarkets);
        setSportFilter(SportFilterEnum.All);
        setDateFilter('');
        setStartDate(null);
        setEndDate(null);
        setTagFilter(allTagsFilterItem);
        dispatch(setMarketSearch(''));
    };

    useEffect(() => {
        trackPageView({});
    }, []);

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
            <BurgerFiltersContainer show={showBurger} onClick={() => setShowBurger(false)}>
                <LogoContainer>
                    <Logo />
                </LogoContainer>

                <SportFiltersContainer>
                    {Object.values(SportFilterEnum).map((filterItem: any) => {
                        return (
                            <SportFilter
                                disabled={
                                    filterItem !== SportFilterEnum.All &&
                                    filterItem !== SportFilterEnum.Baseball &&
                                    filterItem !== SportFilterEnum.Soccer &&
                                    filterItem !== SportFilterEnum.Football &&
                                    filterItem !== SportFilterEnum.UFC
                                }
                                selected={sportFilter === filterItem}
                                sport={filterItem}
                                onClick={() => {
                                    if (filterItem !== sportFilter) {
                                        setSportFilter(filterItem);
                                        setDateFilter('');
                                        setStartDate(null);
                                        setEndDate(null);
                                        setTagFilter(allTagsFilterItem);
                                        setGlobalFilter(GlobalFilterEnum.OpenMarkets);
                                        if (filterItem === SportFilterEnum.All) {
                                            setAvailableTags([
                                                allTagsFilterItem,
                                                ...TAGS_LIST.sort((a, b) => a.label.localeCompare(b.label)),
                                            ]);
                                        } else {
                                            const tagsPerSport = SPORTS_TAGS_MAP[filterItem];
                                            if (tagsPerSport) {
                                                const filteredTags = TAGS_LIST.filter((tag: TagInfo) =>
                                                    tagsPerSport.includes(tag.id)
                                                );
                                                setAvailableTags([allTagsFilterItem, ...filteredTags]);
                                            } else {
                                                setAvailableTags([allTagsFilterItem]);
                                            }
                                        }
                                    } else {
                                        setSportFilter(SportFilterEnum.All);
                                        setAvailableTags([
                                            allTagsFilterItem,
                                            ...TAGS_LIST.sort((a, b) => a.label.localeCompare(b.label)),
                                        ]);
                                    }
                                }}
                                key={filterItem}
                            >
                                {t(`market.filter-label.sport.${filterItem.toLowerCase()}`)}
                            </SportFilter>
                        );
                    })}
                </SportFiltersContainer>
                <GlobalFiltersContainer>
                    {Object.values(GlobalFilterEnum)
                        .filter(
                            (filterItem) =>
                                filterItem != GlobalFilterEnum.Claim &&
                                filterItem != GlobalFilterEnum.History &&
                                filterItem != GlobalFilterEnum.YourPositions
                        )
                        .map((filterItem) => {
                            return (
                                <GlobalFilter
                                    disabled={false}
                                    selected={globalFilter === filterItem}
                                    onClick={() => {
                                        if (
                                            filterItem === GlobalFilterEnum.OpenMarkets ||
                                            filterItem === GlobalFilterEnum.YourPositions
                                        ) {
                                            setDateFilter('');
                                            setStartDate(null);
                                            setEndDate(null);
                                            setTagFilter(allTagsFilterItem);
                                            setSportFilter(SportFilterEnum.All);
                                        }
                                        setGlobalFilter(filterItem);
                                    }}
                                    key={filterItem}
                                    count={getCount(filterItem)}
                                >
                                    {t(`market.filter-label.global.${filterItem.toLowerCase()}`)}
                                </GlobalFilter>
                            );
                        })}
                </GlobalFiltersContainer>
                <UserRelatedFiltersContainer>
                    {Object.values(GlobalFilterEnum)
                        .filter(
                            (filterItem) =>
                                filterItem == GlobalFilterEnum.Claim ||
                                filterItem == GlobalFilterEnum.History ||
                                filterItem == GlobalFilterEnum.YourPositions
                        )
                        .map((filterItem) => {
                            return (
                                <GlobalFilter
                                    disabled={false}
                                    selected={globalFilter === filterItem}
                                    onClick={() => {
                                        if (
                                            filterItem === GlobalFilterEnum.OpenMarkets ||
                                            filterItem === GlobalFilterEnum.YourPositions
                                        ) {
                                            setDateFilter('');
                                            setStartDate(null);
                                            setEndDate(null);
                                            setTagFilter(allTagsFilterItem);
                                            setSportFilter(SportFilterEnum.All);
                                        }
                                        setGlobalFilter(filterItem);
                                    }}
                                    key={filterItem}
                                    count={getCount(filterItem)}
                                >
                                    {t(`market.filter-label.global.${filterItem.toLowerCase()}`)}
                                </GlobalFilter>
                            );
                        })}
                </UserRelatedFiltersContainer>
                <SortingContainer>
                    {sortOptions.map((sortOption) => {
                        return (
                            <SortOption
                                disabled={false}
                                selected={sortOption.id === sortBy}
                                sortDirection={sortDirection}
                                onClick={() => {
                                    setSort(sortOption);
                                }}
                                key={sortOption.title}
                            >
                                {sortOption.title}
                            </SortOption>
                        );
                    })}
                </SortingContainer>
            </BurgerFiltersContainer>
            <FiltersContainer>
                <HeaderDatepicker
                    gamesPerDay={gamesPerDay}
                    dateFilter={dateFilter}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    setDateFilter={setDateFilter}
                />
            </FiltersContainer>
            <BurgerAndSwitchSwitchContainer>
                <BurgerMenu
                    src={burger}
                    onClick={() => {
                        setShowBurger(!showBurger);
                    }}
                />
                <SwitchContainer>
                    <Dropdown<OddsType>
                        list={ODDS_TYPES}
                        selectedItem={selectedOddsType}
                        onSelect={setSelectedOddsType}
                        style={{ marginRight: '10px', width: 'max-content' }}
                    />
                    <ViewSwitch selected={showListView} onClick={() => setListView(true)}>
                        {t('market.list-view')}
                    </ViewSwitch>
                    <ViewSwitch selected={!showListView} onClick={() => setListView(false)}>
                        {t('market.grid-view')}
                    </ViewSwitch>
                </SwitchContainer>
            </BurgerAndSwitchSwitchContainer>

            <RowContainer>
                {/* LEFT FILTERS */}
                <SidebarContainer>
                    <Search text={marketSearch} handleChange={(value) => dispatch(setMarketSearch(value))} />
                    <SportFiltersContainer>
                        {Object.values(SportFilterEnum).map((filterItem: any) => {
                            return (
                                <SportFilter
                                    disabled={
                                        filterItem !== SportFilterEnum.All &&
                                        filterItem !== SportFilterEnum.Baseball &&
                                        filterItem !== SportFilterEnum.Soccer &&
                                        filterItem !== SportFilterEnum.Football &&
                                        filterItem !== SportFilterEnum.UFC
                                    }
                                    selected={sportFilter === filterItem}
                                    sport={filterItem}
                                    onClick={() => {
                                        if (filterItem !== sportFilter) {
                                            setSportFilter(filterItem);
                                            setDateFilter('');
                                            setStartDate(null);
                                            setEndDate(null);
                                            setTagFilter(allTagsFilterItem);
                                            setGlobalFilter(GlobalFilterEnum.OpenMarkets);
                                            if (filterItem === SportFilterEnum.All) {
                                                setAvailableTags([
                                                    allTagsFilterItem,
                                                    ...TAGS_LIST.sort((a, b) => a.label.localeCompare(b.label)),
                                                ]);
                                            } else {
                                                const tagsPerSport = SPORTS_TAGS_MAP[filterItem];
                                                if (tagsPerSport) {
                                                    const filteredTags = TAGS_LIST.filter((tag: TagInfo) =>
                                                        tagsPerSport.includes(tag.id)
                                                    );
                                                    setAvailableTags([allTagsFilterItem, ...filteredTags]);
                                                } else {
                                                    setAvailableTags([allTagsFilterItem]);
                                                }
                                            }
                                        } else {
                                            setSportFilter(SportFilterEnum.All);
                                            setAvailableTags([
                                                allTagsFilterItem,
                                                ...TAGS_LIST.sort((a, b) => a.label.localeCompare(b.label)),
                                            ]);
                                        }
                                    }}
                                    key={filterItem}
                                >
                                    {t(`market.filter-label.sport.${filterItem.toLowerCase()}`)}
                                </SportFilter>
                            );
                        })}
                    </SportFiltersContainer>
                    <RangedDatepicker onDateRangeChange={onDateRangeChange} startDate={startDate} endDate={endDate} />
                </SidebarContainer>
                {/* MAIN PART */}
                {sportMarketsQuery.isLoading ? (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                ) : globalFilter === GlobalFilterEnum.History ? (
                    <UserHistory />
                ) : marketsList.length === 0 ? (
                    <NoMarketsContainer>
                        <NoMarketsLabel>{t('market.no-markets-found')}</NoMarketsLabel>
                        <Button onClick={resetFilters}>{t('market.view-all-markets')}</Button>
                    </NoMarketsContainer>
                ) : (
                    <MarketsGrid
                        markets={marketsList}
                        accountPositions={accountPositions}
                        layoutType={showListView ? 1 : 0}
                    />
                )}
                {/* RIGHT FILTERS */}
                <SidebarContainer>
                    <GlobalFiltersContainer>
                        {Object.values(GlobalFilterEnum)
                            .filter(
                                (filterItem) =>
                                    filterItem != GlobalFilterEnum.Claim &&
                                    filterItem != GlobalFilterEnum.History &&
                                    filterItem != GlobalFilterEnum.YourPositions
                            )
                            .map((filterItem) => {
                                return (
                                    <GlobalFilter
                                        disabled={false}
                                        selected={globalFilter === filterItem}
                                        onClick={() => {
                                            if (
                                                filterItem === GlobalFilterEnum.OpenMarkets ||
                                                filterItem === GlobalFilterEnum.YourPositions
                                            ) {
                                                setDateFilter('');
                                                setStartDate(null);
                                                setEndDate(null);
                                                setTagFilter(allTagsFilterItem);
                                                setSportFilter(SportFilterEnum.All);
                                            }
                                            setGlobalFilter(filterItem);
                                        }}
                                        key={filterItem}
                                        count={getCount(filterItem)}
                                    >
                                        {t(`market.filter-label.global.${filterItem.toLowerCase()}`)}
                                    </GlobalFilter>
                                );
                            })}
                    </GlobalFiltersContainer>
                    <UserRelatedFiltersContainer>
                        {Object.values(GlobalFilterEnum)
                            .filter(
                                (filterItem) =>
                                    filterItem == GlobalFilterEnum.Claim ||
                                    filterItem == GlobalFilterEnum.History ||
                                    filterItem == GlobalFilterEnum.YourPositions
                            )
                            .map((filterItem) => {
                                return (
                                    <GlobalFilter
                                        disabled={false}
                                        selected={globalFilter === filterItem}
                                        onClick={() => {
                                            if (
                                                filterItem === GlobalFilterEnum.OpenMarkets ||
                                                filterItem === GlobalFilterEnum.YourPositions
                                            ) {
                                                setDateFilter('');
                                                setStartDate(null);
                                                setEndDate(null);
                                                setTagFilter(allTagsFilterItem);
                                                setSportFilter(SportFilterEnum.All);
                                            }
                                            setGlobalFilter(filterItem);
                                        }}
                                        key={filterItem}
                                        count={getCount(filterItem)}
                                    >
                                        {t(`market.filter-label.global.${filterItem.toLowerCase()}`)}
                                    </GlobalFilter>
                                );
                            })}
                    </UserRelatedFiltersContainer>
                    <SortingContainer>
                        {sortOptions.map((sortOption) => {
                            return (
                                <SortOption
                                    disabled={false}
                                    selected={sortOption.id === sortBy}
                                    sortDirection={sortDirection}
                                    onClick={() => {
                                        setSort(sortOption);
                                    }}
                                    key={sortOption.title}
                                >
                                    {sortOption.title}
                                </SortOption>
                            );
                        })}
                    </SortingContainer>
                    <TagsContainer>
                        {availableTags.map((tag: TagInfo) => {
                            return (
                                <TagButton
                                    disabled={false}
                                    selected={tagFilter.id === tag.id}
                                    onClick={() => setTagFilter(tagFilter.id === tag.id ? allTagsFilterItem : tag)}
                                    key={tag.label}
                                >
                                    {tag.label}
                                </TagButton>
                            );
                        })}
                    </TagsContainer>
                </SidebarContainer>
            </RowContainer>
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
    const pendingResolutionMarkets: SportMarkets = [];
    const finishedMarkets: SportMarkets = [];
    const canceledMarkets: SportMarkets = [];

    markets.forEach((market: SportMarketInfo) => {
        if (
            market.isOpen &&
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
        if (market.maturityDate < new Date() && !market.isResolved && !market.isCanceled)
            pendingResolutionMarkets.push(market);
        if (market.isResolved) finishedMarkets.push(market);
        if (market.isCanceled) canceledMarkets.push(market);
    });

    return [...openMarkets, ...comingSoonMarkets, ...pendingResolutionMarkets, ...finishedMarkets, ...canceledMarkets];
};

const filterMarketsForCount = (
    markets: SportMarkets,
    marketSearch: string,
    dateFilter: any,
    startDate: Date | null,
    endDate: Date | null,
    sportFilter: any,
    tagFilter: any,
    allTagsFilterItem: TagInfo
) => {
    return markets.filter((market) => {
        if (marketSearch && !market.awayTeam.toLowerCase().includes(marketSearch.toLowerCase())) {
            return false;
        }
        if (dateFilter !== '' && market.maturityDate.toDateString() !== dateFilter) {
            return false;
        }
        if (
            startDate !== null &&
            endDate !== null &&
            (market.maturityDate < startDate || market.maturityDate > endDate)
        ) {
            return false;
        }
        if (sportFilter !== SportFilterEnum.All && market.sport !== sportFilter) {
            return false;
        }
        if (tagFilter.id !== allTagsFilterItem.id && !market.tags.map((tag) => Number(tag)).includes(tagFilter.id)) {
            return false;
        }
        return true;
    });
};

const Container = styled(FlexDivColumn)`
    width: 100%;
`;

const RowContainer = styled(FlexDivRow)`
    width: 100%;
    flex: 1 1 0%;
    flex-direction: row;
    justify-content: stretch;
`;

const SidebarContainer = styled(FlexDivColumn)`
    padding-top: 25px;
    max-width: 240px;
    flex-grow: 1;
    @media (max-width: 950px) {
        display: none;
    }
`;

const BurgerMenu = styled.img`
    position: relative;
    top: 10px;
    left: 10px;
    display: none;
    @media (max-width: 950px) {
        display: block;
    }
`;

const SwitchContainer = styled(FlexDivRow)`
    width: 25%;
    min-width: 150px;
    position: relative;
    top: 20px;
    align-self: end;
    flex-direction: row;
    justify-content: flex-end;
    margin-bottom: 10px;
    @media (max-width: 950px) {
        top: 15px;
    }
`;

const FiltersContainer = styled(FlexDivRow)`
    align-self: center;
    margin-bottom: 4px;
`;

const GlobalFiltersContainer = styled(FlexDivColumn)`
    height: fit-content;
    flex: 0;
    padding-top: 20px;
    &:before {
        content: '';
        height: 3px;
        background: ${(props) => props.theme.borderColor.primary};
        border-radius: 10px 10px 10px 10px;
        margin-bottom: 20px;
        margin-left: 10px;
    }
`;

const UserRelatedFiltersContainer = styled(FlexDivColumn)`
    height: fit-content;
    flex: 0;
    &:before {
        content: '';
        height: 3px;
        background: ${(props) => props.theme.borderColor.primary};
        border-radius: 10px 10px 10px 10px;
        margin-bottom: 20px;
        margin-left: 10px;
    }
    &:after {
        content: '';
        height: 3px;
        background: ${(props) => props.theme.borderColor.primary};
        border-radius: 10px 10px 10px 10px;
        margin-bottom: 10px;
        margin-left: 10px;
    }
`;

const SortingContainer = styled(FlexDivColumn)`
    height: fit-content;
    flex: 0;
    margin-bottom: 10px;
    padding-top: 10px;
    &:after {
        content: '';
        height: 3px;
        background: ${(props) => props.theme.borderColor.primary};
        border-radius: 10px 10px 10px 10px;
        margin-bottom: 10px;
        margin-left: 10px;
    }
`;

const SportFiltersContainer = styled(FlexDivColumn)`
    height: fit-content;
    flex: 0;
    margin-bottom: 10px;
    padding-top: 20px;
`;

const TagsContainer = styled(FlexDivStart)`
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 10px;
    margin-left: 20px;
`;

const NoMarketsContainer = styled(FlexDivColumnCentered)`
    min-height: 200px;
    align-items: center;
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

const LoaderContainer = styled(FlexDivColumn)`
    position: relative;
    min-height: 300px;
`;

const BurgerFiltersContainer = styled(FlexDivColumn)<{ show: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: auto;
    background: #303656;
    display: ${(props) => (props.show ? 'flex' : 'none')};
    z-index: 1000;
`;

const LogoContainer = styled.div`
    width: 100%;
    margin-top: 20px;
    margin-bottom: 10px;
    text-align: center;
`;

const BurgerAndSwitchSwitchContainer = styled(FlexDivRow)`
    justify-content: flex-end;
    width: calc(100% - 240px);
    @media (max-width: 950px) {
        width: 100%;
        justify-content: space-between;
        margin-bottom: 10px;
    }
`;

const Info = styled.div`
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

export default Home;
