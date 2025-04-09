import Logo from 'assets/images/overtime-logo.svg?react';
import BannerCarousel from 'components/BannerCarousel';
import Button from 'components/Button';
import Loader from 'components/Loader';
import OddsSelectorModal from 'components/OddsSelectorModal';
import Scroll from 'components/Scroll';
import Search from 'components/Search';
import SimpleLoader from 'components/SimpleLoader';
import Checkbox from 'components/fields/Checkbox/Checkbox';
import { MarketTypePlayerPropsGroupsBySport } from 'constants/marketTypes';
import { RESET_STATE } from 'constants/routes';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { SportFilter, StatusFilter } from 'enums/markets';
import useLocalStorage from 'hooks/useLocalStorage';
import i18n from 'i18n';
import { groupBy, orderBy } from 'lodash';
import {
    BOXING_LEAGUES,
    League,
    LeagueMap,
    MarketType,
    Sport,
    getSportLeagueIds,
    isBoxingLeague,
} from 'overtime-utils';
import SidebarMMLeaderboard from 'pages/MarchMadness/components/SidebarLeaderboard';
import useLiveSportsMarketsQuery from 'queries/markets/useLiveSportsMarketsQuery';
import useSportsMarketsV2Query from 'queries/markets/useSportsMarketsV2Query';
import useGameMultipliersQuery from 'queries/overdrop/useGameMultipliersQuery';
import queryString from 'query-string';
import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
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
    setDatePeriodFilter,
    setMarketSearch,
    setSelectedMarket,
    setSportFilter,
    setStatusFilter,
    setTagFilter,
} from 'redux/modules/market';
import { getFavouriteLeagues } from 'redux/modules/ui';
import styled, { CSSProperties, useTheme } from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRow, FlexDivSpaceBetween } from 'styles/common';
import { addHoursToCurrentDate, localStore } from 'thales-utils';
import { MarketsCache, SportMarket, SportMarkets, TagInfo, Tags } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { isMarchMadnessAvailableForNetworkId } from 'utils/marchMadness';
import { getDefaultPlayerPropsLeague } from 'utils/marketsV2';
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

const SHOW_MM_SIDEBAR_LEADERBOARD = false; // TODO: remove after march madness

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

    const networkId = useChainId();

    const marketSearch = useSelector(getMarketSearch);
    const datePeriodFilter = useSelector(getDatePeriodFilter);
    const statusFilter = useSelector(getStatusFilter);
    const sportFilter = useSelector(getSportFilter);
    const tagFilter = useSelector(getTagFilter);
    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const marketTypeGroupFilter = useSelector(getMarketTypeGroupFilter);
    const location = useLocation();
    const isMobile = useSelector(getIsMobile);
    const isMarketSelected = useSelector(getIsMarketSelected);
    const selectedMarket = useSelector(getSelectedMarket);

    const [showBurger, setShowBurger] = useState<boolean>(false);
    const [playerPropsCountPerTag, setPlayerPropsCountPerTag] = useState<Record<string, number>>({});
    const [showActive, setShowActive] = useLocalStorage(LOCAL_STORAGE_KEYS.FILTER_ACTIVE, true);
    const [showTicketMobileModal, setShowTicketMobileModal] = useState<boolean>(false);
    const [showOddsSelectorModal, setShowOddsSelectorModal] = useState<boolean>(false);
    const [availableMarketTypes, setAvailableMarketTypes] = useState<MarketType[]>([]);
    const getSelectedOddsType = localStore.get(LOCAL_STORAGE_KEYS.ODDS_TYPE);

    const queryParams: { freeBet?: string } = queryString.parse(location.search);

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

    useEffect(() => {
        if (getSelectedOddsType == undefined && !queryParams.freeBet) {
            setShowOddsSelectorModal(true);
        }
    }, [getSelectedOddsType, queryParams.freeBet]);

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
                if (sportFilter == SportFilter.PlayerProps) {
                    setTagParam(LeagueMap[League.NBA].label);
                } else {
                    setTagParam(tagFilter.map((tag) => tag.label).toString());
                }
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

    useEffect(() => {
        if (sportFilter === SportFilter.PlayerProps) {
            setTagParam(LeagueMap[getDefaultPlayerPropsLeague(playerPropsCountPerTag)].label);
        }
    }, [playerPropsCountPerTag, sportFilter, setTagParam]);

    const sportMarketsQuery = useSportsMarketsV2Query(statusFilter, false, { networkId }, undefined);

    const liveSportMarketsQuery = useLiveSportsMarketsQuery(sportFilter === SportFilter.Live, { networkId });

    const gameMultipliersQuery = useGameMultipliersQuery();

    const finalMarkets = useMemo(() => {
        if (showBurger) {
            return [];
        }
        const allMarkets: MarketsCache =
            sportMarketsQuery.isSuccess && sportMarketsQuery.data
                ? sportMarketsQuery.data
                : {
                      [StatusFilter.OPEN_MARKETS]: [],
                      [StatusFilter.ONGOING_MARKETS]: [],
                      [StatusFilter.RESOLVED_MARKETS]: [],
                      [StatusFilter.PAUSED_MARKETS]: [],
                      [StatusFilter.CANCELLED_MARKETS]: [],
                  };
        const marketTypes = new Set<MarketType>();
        const allLiveMarkets =
            liveSportMarketsQuery.isSuccess && liveSportMarketsQuery.data ? liveSportMarketsQuery.data.live : [];

        const gameMultipliers =
            gameMultipliersQuery.isSuccess && gameMultipliersQuery.data ? gameMultipliersQuery.data : [];

        let marketsToFilter = [];

        if (sportFilter === SportFilter.PlayerProps) {
            const playerMarketMap = allMarkets[statusFilter].reduce(
                (prev: Record<string, SportMarket>, curr: SportMarket) => {
                    const playerMap = { ...prev };
                    curr.childMarkets.forEach((childMarket) => {
                        if (childMarket.isPlayerPropsMarket) {
                            if (playerMap[childMarket.playerProps.playerName + childMarket.gameId]) {
                                playerMap[childMarket.playerProps.playerName + childMarket.gameId].childMarkets = [
                                    ...playerMap[childMarket.playerProps.playerName + childMarket.gameId].childMarkets,
                                    childMarket,
                                ];
                            } else {
                                playerMap[childMarket.playerProps.playerName + childMarket.gameId] = {
                                    ...curr,
                                    isPlayerPropsMarket: true,
                                    gameId: childMarket.gameId,
                                    isOneSideMarket: true,
                                    childMarkets: [childMarket],
                                    playerProps: childMarket.playerProps,
                                };
                            }
                        }
                    });
                    return playerMap;
                },
                {}
            );

            marketsToFilter = Object.keys(playerMarketMap).map((key) => playerMarketMap[key]);
        } else {
            marketsToFilter =
                sportFilter === SportFilter.Live
                    ? allLiveMarkets
                    : allMarkets[statusFilter] || allMarkets[StatusFilter.OPEN_MARKETS];
        }

        const filteredMarkets = marketsToFilter.filter((market: SportMarket) => {
            if (marketSearch) {
                if (sportFilter == SportFilter.PlayerProps) {
                    if (!market.playerProps.playerName.toLowerCase().includes(marketSearch.toLowerCase())) {
                        return false;
                    }
                } else if (
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
                } else if (sportFilter === SportFilter.Boosted) {
                    if (!gameMultipliers.find((multiplier) => multiplier.gameId === market.gameId)) {
                        return false;
                    }
                } else {
                    if (sportFilter != SportFilter.Favourites && sportFilter != SportFilter.Live) {
                        if (((market.sport as unknown) as SportFilter) !== sportFilter) {
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

        return filteredMarkets;
    }, [
        sportMarketsQuery.isSuccess,
        sportMarketsQuery.data,
        liveSportMarketsQuery.isSuccess,
        liveSportMarketsQuery.data,
        gameMultipliersQuery.isSuccess,
        gameMultipliersQuery.data,
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
    ]);

    const marketsLoading =
        sportFilter === SportFilter.Live ? liveSportMarketsQuery.isLoading : sportMarketsQuery.isLoading;

    useEffect(() => {
        if (sportFilter == SportFilter.Favourites) {
            setAvailableTags(favouriteLeagues);
        }
    }, [favouriteLeagues, sportFilter, showActive]);

    const openSportMarketsQuery = useSportsMarketsV2Query(StatusFilter.OPEN_MARKETS, false, { networkId }, undefined);

    const openSportMarkets = useMemo(() => {
        if (openSportMarketsQuery.isSuccess && openSportMarketsQuery.data) {
            return openSportMarketsQuery.data[StatusFilter.OPEN_MARKETS];
        }
        return undefined;
    }, [openSportMarketsQuery.data, openSportMarketsQuery.isSuccess]);

    const openMarketsCountPerTag = useMemo(() => {
        const groupedMarkets = groupBy(openSportMarkets || [], (market) => market.leagueId);

        const openMarketsCountPerTag: any = {};
        const ppMarketsCountPerTag: any = {};
        Object.keys(groupedMarkets).forEach((key: string) => {
            const playerMarketMap = groupedMarkets[key].reduce(
                (prev: Record<string, SportMarket>, curr: SportMarket) => {
                    const playerMap = { ...prev };
                    curr.childMarkets.forEach((childMarket) => {
                        if (childMarket.isPlayerPropsMarket) {
                            if (playerMap[childMarket.playerProps.playerName + childMarket.gameId]) {
                                playerMap[childMarket.playerProps.playerName + childMarket.gameId].childMarkets = [
                                    ...playerMap[childMarket.playerProps.playerName + childMarket.gameId].childMarkets,
                                    childMarket,
                                ];
                            } else {
                                playerMap[childMarket.playerProps.playerName as string] = {
                                    ...curr,
                                    homeTeam: childMarket.playerProps.playerName,
                                    isOneSideMarket: true,
                                    childMarkets: [childMarket],
                                };
                            }
                        }
                    });
                    return playerMap;
                },
                {}
            );
            if (isBoxingLeague(Number(key))) {
                openMarketsCountPerTag[BOXING_LEAGUES[0].toString()] = groupedMarkets[key].length;

                ppMarketsCountPerTag[BOXING_LEAGUES[0].toString()] = Object.keys(playerMarketMap).map(
                    (key) => playerMarketMap[key]
                ).length;
            } else {
                openMarketsCountPerTag[key] = groupedMarkets[key].length;
                ppMarketsCountPerTag[key] = Object.keys(playerMarketMap).map((key) => playerMarketMap[key]).length;
            }
        });
        setPlayerPropsCountPerTag(ppMarketsCountPerTag);
        return openMarketsCountPerTag;
    }, [openSportMarkets]);

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
        openMarketsCount[SportFilter.PlayerProps] = Object.keys(playerPropsCountPerTag).reduce(
            (prev: number, curr: string) => prev + playerPropsCountPerTag[curr],
            0
        );
        let favouriteCount = 0;
        favouriteLeagues.forEach((tag: TagInfo) => {
            favouriteCount += openMarketsCountPerTag[tag.id] || 0;
        });
        openMarketsCount[SportFilter.Favourites] = favouriteCount;

        return openMarketsCount;
    }, [favouriteLeagues, openMarketsCountPerTag, playerPropsCountPerTag]);

    const liveMarketsCountPerTag = useMemo(() => {
        const liveSportMarkets: SportMarkets =
            liveSportMarketsQuery.isSuccess && liveSportMarketsQuery.data ? liveSportMarketsQuery.data.live : [];

        const groupedMarkets = groupBy(liveSportMarkets, (market) => market.leagueId);

        const liveMarketsCountPerTag: any = {};
        Object.keys(groupedMarkets).forEach((key: string) => {
            if (isBoxingLeague(Number(key))) {
                liveMarketsCountPerTag[BOXING_LEAGUES[0].toString()] = groupedMarkets[key].length;
            } else {
                liveMarketsCountPerTag[key] = groupedMarkets[key].length;
            }
        });

        return liveMarketsCountPerTag;
    }, [liveSportMarketsQuery]);

    const boostedMarketsCount = useMemo(() => {
        const gameMultipliers =
            gameMultipliersQuery.isSuccess && gameMultipliersQuery.data ? gameMultipliersQuery.data : [];

        return (openSportMarkets || []).filter((openMarket) =>
            gameMultipliers.find((multiplier) => multiplier.gameId === openMarket.gameId)
        ).length;
    }, [gameMultipliersQuery.data, gameMultipliersQuery.isSuccess, openSportMarkets]);

    const liveMarketsCountPerSport = useMemo(() => {
        const liveMarketsCount: any = {};
        let totalCount = 0;
        Object.keys(liveMarketsCountPerTag).forEach((key) => {
            totalCount += liveMarketsCountPerTag[Number(key)];
        });

        liveMarketsCount[SportFilter.Live] = totalCount;

        let favouriteCount = 0;
        favouriteLeagues.forEach((tag: TagInfo) => {
            favouriteCount += liveMarketsCountPerTag[tag.id] || 0;
        });
        liveMarketsCount[SportFilter.Favourites] = favouriteCount;

        return liveMarketsCount;
    }, [liveMarketsCountPerTag, favouriteLeagues]);

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
                const openSportMarkets: SportMarkets =
                    openSportMarketsQuery.isSuccess && openSportMarketsQuery.data
                        ? openSportMarketsQuery.data[StatusFilter.OPEN_MARKETS]
                        : [];

                return openSportMarkets.find(
                    (market) => market.gameId.toLowerCase() === selectedMarket.gameId.toLowerCase()
                );
            }
        }
    }, [
        openSportMarketsQuery.data,
        openSportMarketsQuery.isSuccess,
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
                        openSportMarketsQuery.isLoading ||
                        filterItem === SportFilter.Favourites
                )
                .map((filterItem: any, index) => {
                    return (
                        <SportTags
                            key={index}
                            onSportClick={() => {
                                if (filterItem !== sportFilter) {
                                    const scrollMainToTop = getScrollMainContainerToTop();
                                    scrollMainToTop();
                                    dispatch(setSportFilter(filterItem));
                                    setSportParam(filterItem);
                                    dispatch(
                                        setTagFilter(
                                            filterItem === SportFilter.PlayerProps
                                                ? [LeagueMap[getDefaultPlayerPropsLeague(playerPropsCountPerTag)]]
                                                : []
                                        )
                                    );
                                    setTagParam(
                                        filterItem === SportFilter.PlayerProps
                                            ? LeagueMap[getDefaultPlayerPropsLeague(playerPropsCountPerTag)].label
                                            : ''
                                    );
                                    if (filterItem === SportFilter.All || filterItem === SportFilter.PlayerProps) {
                                        dispatch(setDatePeriodFilter(0));
                                        setDateParam('');
                                        setAvailableTags(tagsList);
                                    } else if (filterItem === SportFilter.Live) {
                                        setDateParam('');
                                        dispatch(setDatePeriodFilter(0));
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
                                                        openSportMarketsQuery.isLoading)
                                            );
                                            setAvailableTags(filteredTags);
                                        } else {
                                            setAvailableTags([]);
                                        }
                                    }
                                } else {
                                    if (filterItem !== SportFilter.PlayerProps) {
                                        dispatch(setTagFilter([]));
                                        setTagParam('');
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
                            setSportParam={setSportParam}
                            setTagParam={setTagParam}
                            openMarketsCountPerTag={openMarketsCountPerTag}
                            liveMarketsCountPerTag={liveMarketsCountPerTag}
                            liveMarketsCountPerSport={liveMarketsCountPerSport}
                            playerPropsMarketsCountPerTag={playerPropsCountPerTag}
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
                    <Scroll height="calc(100vh - 430px)">
                        <SportFiltersContainer>
                            {getStatusFilters()}
                            {getSportFilters()}
                            {SHOW_MM_SIDEBAR_LEADERBOARD && (
                                <Suspense fallback={<Loader />}>
                                    {isMarchMadnessAvailableForNetworkId(networkId) && <SidebarMMLeaderboard />}
                                </Suspense>
                            )}
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
                            />
                            {!marketsLoading &&
                                finalMarkets.length > 0 &&
                                (statusFilter === StatusFilter.OPEN_MARKETS || sportFilter === SportFilter.Live) && (
                                    <Header
                                        allMarkets={finalMarkets}
                                        availableMarketTypes={availableMarketTypes}
                                        market={selectedMarketData}
                                    />
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
                            {!isMobile && (
                                <FiltersContainer>
                                    <Breadcrumbs setTagParam={setTagParam} />
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
