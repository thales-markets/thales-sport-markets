import Logo from 'assets/images/overtime-logo.svg?react';
import BannerCarousel from 'components/BannerCarousel';
import Button from 'components/Button';
import Loader from 'components/Loader';
import Scroll from 'components/Scroll';
import Search from 'components/Search';
import SimpleLoader from 'components/SimpleLoader';
import Checkbox from 'components/fields/Checkbox/Checkbox';
import { MarketTypePlayerPropsGroupsBySport } from 'constants/marketTypes';
import { RESET_STATE } from 'constants/routes';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { MAIN_VIEW_RIGHT_CONTAINER_WIDTH_LARGE, MAIN_VIEW_RIGHT_CONTAINER_WIDTH_MEDIUM } from 'constants/ui';
import { TimeFilter } from 'enums/filters';
import { SportFilter, StatusFilter } from 'enums/markets';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useLocalStorage from 'hooks/useLocalStorage';
import i18n from 'i18n';
import { isEqual, orderBy } from 'lodash';
import {
    BOXING_LEAGUES,
    League,
    LeagueMap,
    MarketType,
    Sport,
    getLeagueSport,
    getSportLeagueIds,
    isBoxingLeague,
    isSgpBuilderMarket,
} from 'overtime-utils';
import useGamesCountQuery from 'queries/markets/useGamesCountQuery';
import useLiveSportsMarketsQuery from 'queries/markets/useLiveSportsMarketsQuery';
import useSportsMarketsV2Query, {
    SportsMarketsFilterProps,
    marketsCache,
} from 'queries/markets/useSportsMarketsV2Query';
import useGameMultipliersQuery from 'queries/overdrop/useGameMultipliersQuery';
import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsMobile } from 'redux/modules/app';
import {
    getDatePeriodFilter,
    getIsMarketSelected,
    getMarketSearch,
    getMarketTypeFilter,
    getMarketTypeGroupFilter,
    getSelectedMarket,
    getSportFilter,
    getStatusFilter,
    getTagFilter,
    getTournamentFilter,
    setDatePeriodFilter,
    setMarketSearch,
    setSelectedMarket,
    setSportFilter,
    setStatusFilter,
    setTagFilter,
    setTournamentFilter,
} from 'redux/modules/market';
import { getFavouriteLeagues } from 'redux/modules/ui';
import styled, { CSSProperties, useTheme } from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRow, FlexDivSpaceBetween } from 'styles/common';
import { addHoursToCurrentDate } from 'thales-utils';
import { MarketsCache, NonEmptySport, SportMarket, SportMarkets, TagInfo, Tags } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { getCaseAccentInsensitiveString } from 'utils/formatters/string';
import { getFiltersInfo, isStalePausedMarket } from 'utils/marketsV2';
import { history } from 'utils/routes';
import { getScrollMainContainerToTop } from 'utils/scroll';
import useQueryParam from 'utils/useQueryParams';
import { useChainId } from 'wagmi';
import TimeFilters from '../../../layouts/DappLayout/DappHeader/components/TimeFilters';
import FilterTagsMobile from '../components/FilterTagsMobile';
import SportFilterMobile from '../components/SportFilter/SportFilterMobile';
import SportTags from '../components/SportTags';
import GlobalFilters from '../components/StatusFilters';
import Breadcrumbs from './Breadcrumbs';
import Filters from './Filters';
import Header from './Header';
import SelectedMarket from './SelectedMarket';

const Parlay = lazy(() => import(/* webpackChunkName: "Parlay" */ './Parlay'));

const TicketMobileModal = lazy(
    () => import(/* webpackChunkName: "TicketMobileModal" */ './Parlay/components/TicketMobileModal')
);

const FooterSidebarMobile = lazy(
    () => import(/* webpackChunkName: "FooterSidebarMobile" */ 'components/FooterSidebarMobile')
);

const MarketsGridV2 = lazy(() => import(/* webpackChunkName: "MarketsGrid" */ './MarketsGridV2'));

let finalMarketsCached: any = [];

const Home: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();

    const marketSearch = useSelector(getMarketSearch);
    const datePeriodFilter = useSelector(getDatePeriodFilter);
    const statusFilter = useSelector(getStatusFilter);
    const sportFilter = useSelector(getSportFilter);
    const tagFilter = useSelector(getTagFilter);
    const tournamentFilter = useSelector(getTournamentFilter);
    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const marketTypeGroupFilter = useSelector(getMarketTypeGroupFilter);
    const location = useLocation();
    const isMobile = useSelector(getIsMobile);
    const isMarketSelected = useSelector(getIsMarketSelected);
    const selectedMarket = useSelector(getSelectedMarket);

    const [showBurger, setShowBurger] = useState<boolean>(false);
    const [showActive, setShowActive] = useLocalStorage(LOCAL_STORAGE_KEYS.FILTER_ACTIVE, true);
    const [showTicketMobileModal, setShowTicketMobileModal] = useState<boolean>(false);
    const [availableMarketTypes, setAvailableMarketTypes] = useState<MarketType[]>([]);
    const [unfilteredPlayerPropsMarkets, setUnfilteredPlayerPropsMarkets] = useState<SportMarket[]>([]);
    const [sportMarketsQueryFilters, setSportMarketsQueryFilters] = useState<SportsMarketsFilterProps>({
        status: statusFilter,
        includeProofs: false,
        sport: sportFilter,
        leaguedIds: [],
        gameIds: [],
        timeLimitHours: TimeFilter.TWELVE_HOURS,
    });

    const tagsList: Tags = useMemo(
        () =>
            orderBy(
                Object.values(LeagueMap).filter((tag) => !tag.hidden),
                ['priority', 'label'],
                ['asc', 'asc']
            ).map((tag) => {
                return {
                    id: tag.id,
                    label: tag.label,
                };
            }),
        []
    );

    const favouriteLeagues = useSelector(getFavouriteLeagues);

    const [availableTags, setAvailableTags] = useState<Tags>(tagsList);

    const [sportParam, setSportParam] = useQueryParam('sport', '');
    const [statusParam, setStatusParam] = useQueryParam('status', '');
    const [searchParam, setSearchParam] = useQueryParam('search', '');
    const [dateParam, setDateParam] = useQueryParam('date', '');
    const [tagParam, setTagParam] = useQueryParam('tag', '');
    const [selectedLanguage, setSelectedLanguage] = useQueryParam('lang', '');
    const [activeParam, setActiveParam] = useQueryParam('showActive', '');
    const [tournamentParam, setTournamentParam] = useQueryParam('tournament', '');

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
                const timeFilter = Number(dateParam.split('h')[0]) as TimeFilter;
                switch (timeFilter) {
                    case TimeFilter.TWELVE_HOURS:
                        dispatch(setDatePeriodFilter(TimeFilter.TWELVE_HOURS));
                        break;
                    case TimeFilter.DAY:
                        dispatch(setDatePeriodFilter(TimeFilter.DAY));
                        break;
                    case TimeFilter.THREE_DAYS:
                        dispatch(setDatePeriodFilter(TimeFilter.THREE_DAYS));
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

            if (tournamentParam != '') {
                const tournamentParamsSplitted = tournamentParam.split(';');
                tournamentParamsSplitted.length > 0
                    ? dispatch(setTournamentFilter(tournamentParamsSplitted))
                    : dispatch(setTournamentFilter([]));
            } else {
                setTournamentParam(tournamentFilter.map((filter) => filter).join(';'));
            }

            searchParam != '' ? dispatch(setMarketSearch(searchParam)) : '';

            selectedLanguage == '' ? setSelectedLanguage(i18n.language) : '';

            if (
                sportFilter == SportFilter.Favourites ||
                sportFilter == SportFilter.Live ||
                sportFilter == SportFilter.PlayerProps
            ) {
                setAvailableTags(tagsList);
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

    const liveSportMarketsQuery = useLiveSportsMarketsQuery(sportFilter === SportFilter.Live, { networkId });

    const gameMultipliersQuery = useGameMultipliersQuery();

    const gameMultipliers = useMemo(
        () => (gameMultipliersQuery.isSuccess && gameMultipliersQuery.data ? gameMultipliersQuery.data : []),
        [gameMultipliersQuery.data, gameMultipliersQuery.isSuccess]
    );

    const countPerTagQuery = useGamesCountQuery(networkId);

    const gamesCount = useMemo(() => {
        if (countPerTagQuery.isSuccess && countPerTagQuery.data) {
            return countPerTagQuery.data;
        }
        return undefined;
    }, [countPerTagQuery.data, countPerTagQuery.isSuccess]);

    const wasSportTimeLimited = useRef<boolean>(false);
    useEffect(() => {
        const { leagueIdsFilter, gameIdsFilter, gamesCountFilter, timeLimitFilter } = getFiltersInfo(
            sportFilter,
            tagFilter,
            gamesCount,
            gameMultipliers,
            favouriteLeagues
        );
        const isSportTimeLimited = timeLimitFilter !== TimeFilter.ALL;

        if (isSportTimeLimited) {
            dispatch(setDatePeriodFilter(timeLimitFilter));
            wasSportTimeLimited.current = true;
        } else if (wasSportTimeLimited.current) {
            dispatch(setDatePeriodFilter(TimeFilter.ALL));
            wasSportTimeLimited.current = false;
        }

        setSportMarketsQueryFilters({
            status: statusFilter,
            includeProofs: false,
            sport: sportFilter,
            leaguedIds: isSportTimeLimited ? leagueIdsFilter : [],
            gameIds: isSportTimeLimited ? gameIdsFilter : [],
            timeLimitHours: timeLimitFilter,
            isDisabled: !gamesCountFilter,
        });
    }, [statusFilter, sportFilter, tagFilter, gamesCount, favouriteLeagues, gameMultipliers, dispatch]);

    const sportMarketsQuery = useSportsMarketsV2Query(
        sportMarketsQueryFilters,
        { networkId },
        { enabled: !sportMarketsQueryFilters.isDisabled }
    );

    const openSportMarkets = useMemo(() => {
        if (sportMarketsQuery.isSuccess && sportMarketsQuery.data) {
            return sportMarketsQuery.data[StatusFilter.OPEN_MARKETS];
        }
        return undefined;
    }, [sportMarketsQuery.data, sportMarketsQuery.isSuccess]);

    const selectedSportMarketQuery = useSportsMarketsV2Query(
        {
            status: StatusFilter.OPEN_MARKETS,
            includeProofs: false,
            gameIds: selectedMarket ? [selectedMarket.gameId] : [],
        },
        { networkId },
        { enabled: !!selectedMarket && !selectedMarket.live }
    );

    const finalMarkets = useMemo(() => {
        if (showBurger) {
            return [];
        }
        const allMarkets: MarketsCache =
            sportMarketsQuery.isSuccess && sportMarketsQuery.data ? sportMarketsQuery.data : marketsCache;

        const marketTypes = new Set<MarketType>();
        const allLiveMarkets =
            liveSportMarketsQuery.isSuccess && liveSportMarketsQuery.data
                ? liveSportMarketsQuery.data.live.filter((market) => {
                      let keepMarket = true;
                      switch (statusFilter) {
                          // for now all status filters for live are showing all markets which are not stale paused
                          case StatusFilter.OPEN_MARKETS:
                          case StatusFilter.ONGOING_MARKETS:
                          case StatusFilter.RESOLVED_MARKETS:
                          case StatusFilter.CANCELLED_MARKETS:
                              keepMarket = !isStalePausedMarket(market);
                              break;
                          case StatusFilter.PAUSED_MARKETS:
                              keepMarket = market.isPaused;
                              break;
                      }
                      return keepMarket;
                  })
                : [];

        let marketsToFilter = [];

        if (sportFilter === SportFilter.PlayerProps) {
            const playerMarketMap: Record<string, SportMarket> = (() => {
                const map: Record<string, SportMarket> = {};

                for (const curr of allMarkets[statusFilter]) {
                    for (const childMarket of curr.childMarkets) {
                        if (!childMarket.isPlayerPropsMarket) continue;

                        const key = childMarket.playerProps.playerName + childMarket.gameId;

                        const existing = map[key];
                        if (existing) {
                            existing.childMarkets.push(childMarket);
                        } else {
                            map[key] = {
                                ...curr,
                                isPlayerPropsMarket: true,
                                gameId: childMarket.gameId,
                                isOneSideMarket: true,
                                childMarkets: [childMarket],
                                playerProps: childMarket.playerProps,
                            };
                        }
                    }
                }

                return map;
            })();

            marketsToFilter = Object.keys(playerMarketMap).map((key) => playerMarketMap[key]);
            setUnfilteredPlayerPropsMarkets(marketsToFilter);
        } else {
            marketsToFilter =
                sportFilter === SportFilter.Live
                    ? allLiveMarkets
                    : allMarkets[statusFilter] || allMarkets[StatusFilter.OPEN_MARKETS];
        }

        const filteredMarkets = marketsToFilter.filter((market: SportMarket) => {
            if (marketSearch) {
                const normalizedMarketSearch = getCaseAccentInsensitiveString(marketSearch);
                if (sportFilter == SportFilter.PlayerProps) {
                    if (
                        !getCaseAccentInsensitiveString(market.playerProps.playerName).includes(normalizedMarketSearch)
                    ) {
                        return false;
                    }
                } else if (
                    !getCaseAccentInsensitiveString(market.homeTeam).includes(normalizedMarketSearch) &&
                    !getCaseAccentInsensitiveString(market.awayTeam).includes(normalizedMarketSearch)
                ) {
                    return false;
                }
            }

            if (tournamentFilter.length > 0) {
                if (!tournamentFilter.find((tournament) => tournament === market.tournamentName)) {
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
                } else if (
                    !tagFilter.find(
                        (tag) =>
                            tag.id === market.leagueId ||
                            (tag.label === SportFilter.Favourites &&
                                favouriteLeagues.find((tag) => tag.id === market.leagueId))
                    )
                ) {
                    return false;
                }
            }

            if (datePeriodFilter !== 0) {
                if (market.maturityDate.getTime() > calculateDate(datePeriodFilter)) {
                    return false;
                }
            }

            if (sportFilter !== SportFilter.All) {
                if (sportFilter === SportFilter.PlayerProps) {
                    if (!market.childMarkets.length) {
                        return false;
                    }
                } else if (sportFilter === SportFilter.QuickSgp) {
                    if (!market.childMarkets.some((childMarket) => isSgpBuilderMarket(childMarket.typeId))) {
                        return false;
                    }
                } else if (sportFilter === SportFilter.Boosted) {
                    if (!gameMultipliers.find((multiplier) => multiplier.gameId === market.gameId)) {
                        return false;
                    }
                } else {
                    if (sportFilter != SportFilter.Favourites && sportFilter != SportFilter.Live) {
                        if (
                            ((market.sport as unknown) as SportFilter) !== sportFilter &&
                            ((market.initialSport as unknown) as SportFilter) !== sportFilter
                        ) {
                            return false;
                        }
                    } else {
                        if (sportFilter == SportFilter.Favourites) {
                            if (!favouriteLeagues.map((league) => league.id).includes(market.leagueId)) return false;
                        }
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

            if (marketTypeGroupFilter !== undefined && sportFilter === SportFilter.PlayerProps && !selectedMarket) {
                const marketMarketTypes = [
                    market.typeId,
                    ...(market.childMarkets || []).map((childMarket) => childMarket.typeId),
                ];
                const marketTypeGroupFilters = marketTypeGroupFilter
                    ? MarketTypePlayerPropsGroupsBySport[market.sport][marketTypeGroupFilter] || []
                    : [];

                if (!marketMarketTypes.some((marketType) => marketTypeGroupFilters.includes(marketType))) {
                    return false;
                }
            }

            return true;
        });

        if (selectedMarket && !filteredMarkets.map((market) => market.gameId).includes(selectedMarket.gameId)) {
            dispatch(setSelectedMarket(undefined));
        }

        setAvailableMarketTypes(Array.from(marketTypes));

        if (isEqual(finalMarketsCached, filteredMarkets)) {
            return finalMarketsCached;
        }
        finalMarketsCached = filteredMarkets;

        return filteredMarkets;
    }, [
        sportMarketsQuery.isSuccess,
        sportMarketsQuery.data,
        liveSportMarketsQuery.isSuccess,
        liveSportMarketsQuery.data,
        gameMultipliers,
        sportFilter,
        statusFilter,
        marketSearch,
        tagFilter,
        datePeriodFilter,
        marketTypeFilter,
        marketTypeGroupFilter,
        favouriteLeagues,
        selectedMarket,
        showBurger,
        dispatch,
        tournamentFilter,
    ]);

    const marketsLoading =
        sportFilter === SportFilter.Live ? liveSportMarketsQuery.isLoading : sportMarketsQuery.isLoading;

    useEffect(() => {
        if (sportFilter == SportFilter.Favourites) {
            setAvailableTags(favouriteLeagues);
        }
    }, [favouriteLeagues, sportFilter, showActive]);

    const openMarketsCountPerTag = useMemo(() => {
        const openMarketsCount: any = {};
        if (gamesCount) {
            Object.keys(gamesCount)
                .filter(
                    (sport) => sport !== 'All' && sport !== 'Live' && sport !== 'PlayerProps' && sport !== 'QuickSgp'
                )
                .forEach((sport) => {
                    Object.keys(gamesCount[sport as NonEmptySport]?.leagues).forEach((key: any) => {
                        openMarketsCount[key as League] =
                            gamesCount[sport as NonEmptySport]?.leagues[key as League].total || 0;
                    });
                });
        }

        return openMarketsCount;
    }, [gamesCount]);

    const liveMarketsCountPerTag = useMemo(() => {
        const liveMarketsCountPerTag: any = {};
        if (gamesCount) {
            Object.keys(gamesCount.Live)
                .filter((sport) => sport !== 'total')
                .forEach((sportKey) => {
                    Object.keys(gamesCount.Live[sportKey as NonEmptySport].leagues).forEach((key: any) => {
                        if (isBoxingLeague(Number(key))) {
                            liveMarketsCountPerTag[BOXING_LEAGUES[0].toString()] =
                                gamesCount.Live[sportKey as NonEmptySport].leagues[BOXING_LEAGUES[0] as League].total;
                        } else {
                            liveMarketsCountPerTag[key] =
                                gamesCount.Live[sportKey as NonEmptySport].leagues[key as League].total;
                        }
                    });
                });
        }

        return liveMarketsCountPerTag;
    }, [gamesCount]);

    const quickSgpCountPerTag = useMemo(() => {
        const quickSgpCountPerTag: any = {};
        if (gamesCount) {
            Object.keys(gamesCount['QuickSgp'])
                .filter((sport) => sport !== 'total')
                .forEach((sportKey) => {
                    Object.keys(gamesCount.QuickSgp[sportKey as NonEmptySport].leagues).forEach((key: any) => {
                        if (isBoxingLeague(Number(key))) {
                            quickSgpCountPerTag[BOXING_LEAGUES[0].toString()] =
                                gamesCount.QuickSgp[sportKey as NonEmptySport].leagues[key as League].total;
                        } else {
                            quickSgpCountPerTag[key as League] =
                                gamesCount.QuickSgp[sportKey as NonEmptySport].leagues[key as League].total;
                        }
                    });
                });
        }

        return quickSgpCountPerTag;
    }, [gamesCount]);

    const openMarketsCountPerSport = useMemo(() => {
        const openMarketsCount: any = {};
        if (gamesCount) {
            (Object.keys(gamesCount) as Array<string>).forEach((key) => {
                openMarketsCount[key] = (gamesCount as any)[key]?.total ?? 0;
            });
            openMarketsCount[SportFilter.All] = gamesCount.All.total;
            let favouriteCount = 0;
            favouriteLeagues.forEach((tag: TagInfo) => {
                const sportForTag = getLeagueSport(tag.id);
                favouriteCount += gamesCount[sportForTag as NonEmptySport]?.leagues[tag.id].total || 0;
            });
            openMarketsCount[SportFilter.Favourites] = favouriteCount;
        }

        return openMarketsCount;
    }, [gamesCount, favouriteLeagues]);

    const liveMarketsCountPerSport = useMemo(() => {
        const liveMarketsCount: any = {};
        if (gamesCount) {
            liveMarketsCount[SportFilter.Live] = gamesCount.Live.total;

            Object.keys(gamesCount.Live).forEach((key) => {
                liveMarketsCount[key] = gamesCount.Live[key as NonEmptySport]?.total;
            });

            let favouriteCount = 0;
            favouriteLeagues.forEach((tag: TagInfo) => {
                const sportForTag = getLeagueSport(tag.id);
                favouriteCount += gamesCount.Live[sportForTag as NonEmptySport]?.leagues[tag.id]?.total || 0;
            });
            liveMarketsCount[SportFilter.Favourites] = favouriteCount;
        }
        return liveMarketsCount;
    }, [gamesCount, favouriteLeagues]);

    const playerPropsCountPerTag = useMemo(() => {
        const playerPropsCountPerTag: any = {};
        if (gamesCount) {
            Object.keys(gamesCount.PlayerProps)
                .filter((sport) => sport !== 'total' && sport !== 'tournaments')
                .forEach((sportKey: string) => {
                    Object.keys(gamesCount.PlayerProps[sportKey as NonEmptySport].leagues).forEach((key: any) => {
                        if (isBoxingLeague(Number(key))) {
                            playerPropsCountPerTag[BOXING_LEAGUES[0].toString()] =
                                gamesCount.PlayerProps[sportKey as NonEmptySport].leagues[key as League].total;
                        } else {
                            playerPropsCountPerTag[key as League] =
                                gamesCount.PlayerProps[sportKey as NonEmptySport].leagues[key as League].total;
                        }
                    });
                });
        }

        return playerPropsCountPerTag;
    }, [gamesCount]);

    const boostedMarketsCount = 0;

    const selectedMarketData = useMemo(() => {
        if (selectedMarket) {
            if (selectedMarket.live) {
                const liveMarkets: SportMarkets =
                    liveSportMarketsQuery.isSuccess && liveSportMarketsQuery.data
                        ? liveSportMarketsQuery.data.live
                        : [];
                return liveMarkets.find(
                    (market) => market.gameId.toLowerCase() === selectedMarket.gameId.toLowerCase()
                );
            } else {
                // Non-live
                const selectedMarket: SportMarkets =
                    selectedSportMarketQuery.isSuccess && selectedSportMarketQuery.data
                        ? selectedSportMarketQuery.data[StatusFilter.OPEN_MARKETS]
                        : [];

                return selectedMarket.length > 0 ? selectedMarket[0] : undefined;
            }
        }
    }, [
        selectedSportMarketQuery.data,
        selectedSportMarketQuery.isSuccess,
        liveSportMarketsQuery.data,
        liveSportMarketsQuery.isSuccess,
        selectedMarket,
    ]);

    const resetFilters = useCallback(() => {
        dispatch(setStatusFilter(StatusFilter.OPEN_MARKETS));
        setStatusParam(StatusFilter.OPEN_MARKETS);
        dispatch(setSportFilter(SportFilter.All));
        setSportParam(SportFilter.All);
        setDateParam('');
        dispatch(setDatePeriodFilter(TimeFilter.ALL));
        dispatch(setTagFilter([]));
        setTagParam('');
        setSearchParam('');
        dispatch(setMarketSearch(''));
        dispatch(setTournamentFilter([]));
        setTournamentParam('');
    }, [dispatch, setStatusParam, setSportParam, setDateParam, setTagParam, setSearchParam, setTournamentParam]);

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
                                (e.target.checked && !!liveMarketsCountPerTag[tag.id]) || !e.target.checked
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
                        (showActive && filterItem === SportFilter.Boosted && boostedMarketsCount > 0) ||
                        (showActive && filterItem === SportFilter.Live && liveMarketsCountPerSport[filterItem] > 0) ||
                        !showActive ||
                        countPerTagQuery.isLoading ||
                        filterItem === SportFilter.Favourites
                )
                .map((filterItem: any, index) => {
                    return (
                        <SportTags
                            key={`${filterItem}-${index}`}
                            onSportClick={() => {
                                if (filterItem !== sportFilter) {
                                    const scrollMainToTop = getScrollMainContainerToTop();
                                    scrollMainToTop();
                                    dispatch(setSportFilter(filterItem));
                                    setSportParam(filterItem);
                                    dispatch(setTagFilter([]));
                                    setTagParam('');
                                    dispatch(setTournamentFilter([]));
                                    setTournamentParam('');
                                    if (filterItem === SportFilter.All) {
                                        dispatch(setDatePeriodFilter(TimeFilter.ALL));
                                        setDateParam('');
                                        setAvailableTags(tagsList);
                                    } else if (filterItem === SportFilter.Live) {
                                        setDateParam('');
                                        dispatch(setDatePeriodFilter(TimeFilter.ALL));
                                        const filteredTags = tagsList.filter(
                                            (tag: TagInfo) =>
                                                (showActive && !!liveMarketsCountPerTag[tag.id]) ||
                                                !showActive ||
                                                liveSportMarketsQuery.isLoading
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
                                                        countPerTagQuery.isLoading)
                                            );
                                            setAvailableTags(filteredTags);
                                        } else {
                                            setAvailableTags([]);
                                        }
                                    }
                                }
                            }}
                            sport={filterItem}
                            sportCount={
                                filterItem === SportFilter.Boosted
                                    ? boostedMarketsCount
                                    : filterItem == SportFilter.Live
                                    ? liveMarketsCountPerSport[filterItem]
                                    : openMarketsCountPerSport[filterItem]
                            }
                            showActive={showActive}
                            tags={tagsList}
                            openMarketsCountPerTag={openMarketsCountPerTag}
                            liveMarketsCountPerTag={liveMarketsCountPerTag}
                            liveMarketsCountPerSport={liveMarketsCountPerSport}
                            playerPropsMarketsCountPerTag={playerPropsCountPerTag}
                            quickSgpMarketsCountPerTag={quickSgpCountPerTag}
                            gamesCount={gamesCount}
                        />
                    );
                })}
        </>
    );

    const getStatusFilters = () => <GlobalFilters />;

    return (
        <Container>
            <ReactModal
                isOpen={showBurger && isMobile}
                onRequestClose={() => {
                    setShowBurger(false);
                }}
                shouldCloseOnOverlayClick={false}
                style={getCustomModalStyles(theme, '12')}
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
                    <Scroll height="calc(100vh - 418px)">
                        <SportFiltersContainer>
                            {getStatusFilters()}
                            {getSportFilters()}
                        </SportFiltersContainer>
                    </Scroll>
                </LeftSidebarContainer>

                {/* MAIN PART */}
                <MainContainer>
                    {isMobile && (
                        <>
                            <SportFilterMobile
                                playerPropsCountPerTag={playerPropsCountPerTag}
                                setAvailableTags={setAvailableTags}
                                tagsList={tagsList}
                                openMarketsCountPerSport={openMarketsCountPerSport}
                                boostedMarketsCount={boostedMarketsCount}
                                liveMarketsCountPerSport={liveMarketsCountPerSport}
                                showActive={showActive}
                                isLoading={countPerTagQuery.isLoading}
                            />
                            {!marketsLoading &&
                                finalMarkets.length > 0 &&
                                (statusFilter === StatusFilter.OPEN_MARKETS || sportFilter === SportFilter.Live) && (
                                    <Header
                                        allMarkets={finalMarkets}
                                        availableMarketTypes={availableMarketTypes}
                                        market={selectedMarketData}
                                        unfilteredPlayerPropsMarkets={unfilteredPlayerPropsMarkets}
                                    />
                                )}
                            <Filters isMainPageView />
                            <FilterTagsMobile />
                        </>
                    )}
                    {marketsLoading ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : (
                        <>
                            {!isMobile && (
                                <FiltersContainer>
                                    <Breadcrumbs />
                                    <Filters isMainPageView />
                                </FiltersContainer>
                            )}
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
                                        (statusFilter === StatusFilter.OPEN_MARKETS ||
                                            sportFilter === SportFilter.Live) && (
                                            <Header
                                                allMarkets={finalMarkets}
                                                availableMarketTypes={availableMarketTypes}
                                                market={selectedMarketData}
                                                unfilteredPlayerPropsMarkets={unfilteredPlayerPropsMarkets}
                                            />
                                        )}

                                    <FlexDivRow>
                                        <Suspense
                                            fallback={
                                                <LoaderContainer>
                                                    <Loader />
                                                </LoaderContainer>
                                            }
                                        >
                                            <MarketsGridV2 markets={finalMarkets} />
                                        </Suspense>

                                        {isMobile ? (
                                            <ReactModal
                                                isOpen={
                                                    isMarketSelected &&
                                                    (statusFilter === StatusFilter.OPEN_MARKETS ||
                                                        !!selectedMarket?.live)
                                                }
                                                onRequestClose={() => {
                                                    dispatch(setSelectedMarket(undefined));
                                                }}
                                                shouldCloseOnOverlayClick={false}
                                                style={getCustomModalStyles(theme, '10')}
                                            >
                                                <SelectedMarket market={selectedMarketData} />
                                            </ReactModal>
                                        ) : (
                                            isMarketSelected &&
                                            (statusFilter === StatusFilter.OPEN_MARKETS || !!selectedMarket?.live) && (
                                                <SelectedMarket market={selectedMarketData} />
                                            )
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
                        <Parlay openMarkets={openSportMarkets} />
                    </Suspense>
                </RightSidebarContainer>
            </RowContainer>
            <Suspense fallback={<Loader />}>
                <TicketMobileModal
                    onClose={() => setShowTicketMobileModal(false)}
                    isOpen={isMobile && showTicketMobileModal}
                    openMarkets={openSportMarkets}
                />
            </Suspense>
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
    @media (max-width: 950px) {
        margin-top: 0;
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
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        margin-right: 0;
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
    max-width: ${MAIN_VIEW_RIGHT_CONTAINER_WIDTH_LARGE};
    @media (max-width: ${ScreenSizeBreakpoint.LARGE}px) {
        max-width: ${MAIN_VIEW_RIGHT_CONTAINER_WIDTH_MEDIUM};
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
    svg {
        height: 25px;
        width: 100%;
    }
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

const getCustomModalStyles = (theme: ThemeInterface, zIndex: string) => ({
    content: {
        top: '0',
        overflow: 'auto',
        left: '0',
        right: 'auto',
        bottom: 'auto',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        width: '100%',
        height: '100vh',
        color: theme.textColor.primary,
    },
    overlay: {
        backgroundColor: theme.background.secondary,
        zIndex: zIndex,
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

const FiltersContainer = styled(FlexDivSpaceBetween)`
    margin-bottom: 10px;
`;

export default Home;
