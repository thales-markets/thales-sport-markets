import Button from 'components/Button';
import SimpleLoader from 'components/SimpleLoader';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'constants/defaults';
import useDebouncedMemo from 'hooks/useDebouncedMemo';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { DEFAULT_SORT_BY, GlobalFilterEnum, SortDirection, SportFilterEnum } from 'constants/markets';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { SPORTS_TAGS_MAP, TAGS_LIST } from 'constants/tags';
import useLocalStorage from 'hooks/useLocalStorage';
import useAccountPositionsQuery from 'queries/markets/useAccountPositionsQuery';
import useSportMarketsQuery from 'queries/markets/useSportMarketsQuery';
import { getMarketSearch, setMarketSearch } from 'redux/modules/market';
import { isClaimAvailable } from 'utils/markets';
import SortOption from '../components/SortOption';
import SportFilter from '../components/SportFilter';
import ViewSwitch from '../components/ViewSwitch';
import HeaderDatepicker from './HeaderDatepicker';
import UserHistory from './UserHistory';
import burger from 'assets/images/burger.svg';

const Home: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const marketSearch = useSelector((state: RootState) => getMarketSearch(state));

    const [globalFilter, setGlobalFilter] = useLocalStorage(LOCAL_STORAGE_KEYS.FILTER_GLOBAL, GlobalFilterEnum.All);
    const [sportFilter, setSportFilter] = useLocalStorage(LOCAL_STORAGE_KEYS.FILTER_SPORT, SportFilterEnum.All);
    const [sortDirection, setSortDirection] = useLocalStorage(LOCAL_STORAGE_KEYS.SORT_DIRECTION, SortDirection.ASC);
    const [sortBy, setSortBy] = useLocalStorage(LOCAL_STORAGE_KEYS.SORT_BY, DEFAULT_SORT_BY);
    const [showGridView, setGridView] = useLocalStorage(LOCAL_STORAGE_KEYS.GRID_VIEW, true);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

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

    const [dateFilter, setDateFilter] = useLocalStorage(LOCAL_STORAGE_KEYS.FILTER_DATES, '');
    const [gamesPerDay, setGamesPerDayMap] = useState<GamesOnDate[]>([]);

    const sportMarketsQuery = useSportMarketsQuery(networkId, { enabled: isAppReady });
    const markets: SportMarkets = sportMarketsQuery.isSuccess ? sportMarketsQuery.data : [];

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
    }, [markets, sportFilteredMarkets, tagFilter, marketSearch]);

    const accountClaimsCount = useMemo(() => {
        return tagsFilteredMarkets.filter((market: SportMarketInfo) => {
            const accountPositionsPerMarket: AccountPosition[] = accountPositions[market.address];
            return isClaimAvailable(accountPositionsPerMarket);
        }).length;
    }, [tagsFilteredMarkets, accountPositions]);

    const [totalCount, openedMarketsCount, resolvedMarketsCount, canceledCount] = useMemo(() => {
        let [totalCount, openedMarketsCount, resolvedMarketsCount, canceledCount] = [0, 0, 0, 0];
        totalCount = tagsFilteredMarkets.length;
        tagsFilteredMarkets.map((market: SportMarketInfo) => {
            if (market.isOpen && !market.isCanceled) {
                openedMarketsCount++;
            }
            if (market.isResolved && !market.isCanceled) {
                resolvedMarketsCount++;
            }
            if (market.isCanceled) {
                canceledCount++;
            }
        });
        return [totalCount, openedMarketsCount, resolvedMarketsCount, canceledCount];
    }, [markets, tagsFilteredMarkets, tagFilter, marketSearch]);

    const accountPositionsCount = useMemo(() => {
        return tagsFilteredMarkets.filter((market: SportMarketInfo) => {
            const accountPositionsPerMarket: AccountPosition[] = accountPositions[market.address];
            let positionExists = false;
            accountPositionsPerMarket?.forEach((accountPosition) =>
                accountPosition.amount > 0 ? (positionExists = true) : ''
            );
            return positionExists;
        }).length;
    }, [tagsFilteredMarkets, accountPositions]);

    const marketsList = useMemo(() => {
        let filteredMarkets = tagsFilteredMarkets;

        switch (globalFilter) {
            case GlobalFilterEnum.All:
                break;
            case GlobalFilterEnum.OpenMarkets:
                filteredMarkets = filteredMarkets.filter(
                    (market: SportMarketInfo) => market.isOpen && !market.isCanceled
                );
                break;
            case GlobalFilterEnum.ResolvedMarkets:
                filteredMarkets = filteredMarkets.filter(
                    (market: SportMarketInfo) => market.isResolved && !market.isCanceled
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
            default:
                break;
        }

        return filteredMarkets.sort((a, b) => {
            switch (sortBy) {
                case 1:
                    return sortByField(a, b, sortDirection, 'maturityDate');
                case 2:
                    return sortByField(a, b, sortDirection, 'sport');
                default:
                    return 0;
            }
        });
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
            case GlobalFilterEnum.All:
                return totalCount;
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
            default:
                return undefined;
        }
    };

    const resetFilters = () => {
        setGlobalFilter(GlobalFilterEnum.All);
        setSportFilter(SportFilterEnum.All);
        setDateFilter('');
        setStartDate(null);
        setEndDate(null);
        setTagFilter(allTagsFilterItem);
        dispatch(setMarketSearch(''));
    };

    return (
        <Container>
            <FiltersContainer>
                <HeaderDatepicker
                    gamesPerDay={gamesPerDay}
                    dateFilter={dateFilter}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    setDateFilter={setDateFilter}
                />
            </FiltersContainer>
            <FlexDivRow>
                <BurgerMenu src={burger} />
                <SwitchContainer>
                    <ViewSwitch selected={showGridView} onClick={() => setGridView(true)}>
                        {t('market.grid-view')}
                    </ViewSwitch>
                    <ViewSwitch selected={!showGridView} onClick={() => setGridView(false)}>
                        {t('market.list-view')}
                    </ViewSwitch>
                </SwitchContainer>
            </FlexDivRow>

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
                                        filterItem !== SportFilterEnum.Soccer
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
                                            setGlobalFilter(GlobalFilterEnum.All);
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
                        layoutType={showGridView ? 0 : 1}
                    />
                )}
                {/* RIGHT FILTERS */}
                <SidebarContainer>
                    <GlobalFiltersContainer>
                        {Object.values(GlobalFilterEnum).map((filterItem) => {
                            return (
                                <GlobalFilter
                                    disabled={false}
                                    selected={globalFilter === filterItem}
                                    onClick={() => {
                                        if (filterItem === GlobalFilterEnum.All) {
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
                        {sortOptions.map((sortOption) => {
                            return (
                                <SortOption
                                    disabled={false}
                                    selected={sortOption.id === sortBy}
                                    sortDirection={sortDirection}
                                    onClick={() => setSort(sortOption)}
                                    key={sortOption.title}
                                >
                                    {sortOption.title}
                                </SortOption>
                            );
                        })}
                    </GlobalFiltersContainer>
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
    justify-content: flex-start;
    margin-bottom: 10px;
`;

const FiltersContainer = styled(FlexDivRow)`
    align-self: center;
    margin-bottom: 4px;
`;

const GlobalFiltersContainer = styled(FlexDivColumn)`
    height: fit-content;
    flex: 0;
    margin-bottom: 10px;
    padding-top: 20px;
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

export default Home;
