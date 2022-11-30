import { useMatomo } from '@datapunt/matomo-tracker-react';
import Button from 'components/Button';
import FooterSidebarMobile from 'components/FooterSidebarMobile';
import GetUsd from 'components/GetUsd';
import Logo from 'components/Logo';
import Search from 'components/Search';
import SimpleLoader from 'components/SimpleLoader';
import SPAAnchor from 'components/SPAAnchor';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'constants/defaults';
import { GlobalFiltersEnum, SortDirection, SportFilterEnum } from 'constants/markets';
import ROUTES, { RESET_STATE } from 'constants/routes';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { SPORTS_TAGS_MAP, TAGS_LIST } from 'constants/tags';
import useDebouncedMemo from 'hooks/useDebouncedMemo';
import useLocalStorage from 'hooks/useLocalStorage';
import i18n from 'i18n';
import SidebarLeaderboard from 'pages/MintWorldCupNFT/components/SidebarLeaderboard';
import useAccountPositionsQuery from 'queries/markets/useAccountPositionsQuery';
import useDiscountMarkets from 'queries/markets/useDiscountMarkets';
import useSportMarketsQuery, { marketsCache } from 'queries/markets/useSportMarketsQuery';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getMarketSearch, setMarketSearch } from 'redux/modules/market';
import { getParlay } from 'redux/modules/parlay';
import { getFavouriteLeagues } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { AccountPosition, AccountPositionsMap, SportMarketInfo, SportMarkets, TagInfo, Tags } from 'types/markets';
import { addHoursToCurrentDate } from 'utils/formatters/date';
import { isClaimAvailable } from 'utils/markets';
import { NetworkIdByName } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { buildHref, history } from 'utils/routes';
import useQueryParam from 'utils/useQueryParams';
import GlobalFilters from '../components/GlobalFilters';
import SportFilter from '../components/SportFilter';
import SportFilterMobile from '../components/SportFilter/SportFilterMobile';
import TagsDropdown from '../components/TagsDropdown';
import MarketsGrid from './MarketsGrid';
import Parlay from './Parlay';
import ParlayMobileModal from './Parlay/components/ParlayMobileModal';
import UserHistory from './UserHistory';

const Home: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const marketSearch = useSelector((state: RootState) => getMarketSearch(state));
    const { trackPageView } = useMatomo();
    const location = useLocation();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [lastValidMarkets, setLastValidMarkets] = useState<SportMarkets>([]);

    const [globalFilter, setGlobalFilter] = useLocalStorage<GlobalFiltersEnum>(
        LOCAL_STORAGE_KEYS.FILTER_GLOBAL,
        GlobalFiltersEnum.OpenMarkets
    );
    const [sportFilter, setSportFilter] = useLocalStorage(LOCAL_STORAGE_KEYS.FILTER_SPORT, SportFilterEnum.All);
    const [marketsCached, setMarketsCached] = useState<typeof marketsCache>(marketsCache);
    const [showBurger, setShowBurger] = useState<boolean>(false);
    const [showParlayMobileModal, setshowParlayMobileModal] = useState<boolean>(false);
    const parlayMarkets = useSelector(getParlay);

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

    const discountQuery = useDiscountMarkets(networkId, { enabled: true });
    const discountsMap = useMemo(() => {
        return discountQuery.isSuccess ? discountQuery.data : new Map();
    }, [discountQuery.isSuccess, discountQuery.data]);

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
                        case '1':
                            calculateDate(1);
                            break;
                        case '3':
                            calculateDate(3);
                            break;
                        case '12':
                            calculateDate(12);
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

    const sportMarketsQuery = useSportMarketsQuery(networkId, globalFilter, setMarketsCached, { enabled: isAppReady });

    useEffect(() => {
        if (sportMarketsQuery.isSuccess && sportMarketsQuery.data) {
            setLastValidMarkets(marketsCached[globalFilter]);
        }
    }, [sportMarketsQuery.isSuccess, sportMarketsQuery.data, globalFilter, marketsCached, networkId]);

    const markets: SportMarkets = useMemo(() => {
        let sportMarkets = [];
        if (sportMarketsQuery.isSuccess && sportMarketsQuery.data) {
            sportMarkets = marketsCached[globalFilter];
        } else {
            sportMarkets = lastValidMarkets;
        }

        return sportMarkets.map((sportMarket) => {
            const marketDiscount = discountsMap?.get(sportMarket.address);
            return { ...sportMarket, ...marketDiscount };
        });
    }, [
        sportMarketsQuery.isSuccess,
        sportMarketsQuery.data,
        marketsCached,
        globalFilter,
        lastValidMarkets,
        discountsMap,
    ]);

    const accountPositionsQuery = useAccountPositionsQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    const accountPositions: AccountPositionsMap = useMemo(() => {
        return accountPositionsQuery.isSuccess ? accountPositionsQuery.data : {};
    }, [accountPositionsQuery.data, accountPositionsQuery.isSuccess]);

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

    useEffect(() => {
        if (sportFilter == SportFilterEnum.Favourites) {
            const filteredTags = favouriteLeagues.filter((tag: any) => tag.favourite);
            setAvailableTags(filteredTags);
        }
    }, [favouriteLeagues, sportFilter]);

    const datesFilteredMarkets = useMemo(() => {
        let filteredMarkets = marketSearch ? searchFilteredMarkets : markets;
        if (dateFilter !== 0) {
            filteredMarkets = filteredMarkets.filter((market: SportMarketInfo) => {
                if (typeof dateFilter === 'number') {
                    return market.maturityDate.getTime() <= dateFilter;
                } else {
                    const dateToCompare = new Date(dateFilter);
                    return market.maturityDate.toDateString() == dateToCompare.toDateString();
                }
            });
        }

        return filteredMarkets;
    }, [markets, searchFilteredMarkets, dateFilter, marketSearch]);

    const sportFilteredMarkets = useMemo(() => {
        let filteredMarkets = datesFilteredMarkets;
        if (sportFilter !== SportFilterEnum.All) {
            if (sportFilter == SportFilterEnum.Favourites) {
                filteredMarkets = filteredMarkets.filter((market: SportMarketInfo) =>
                    favouriteLeagues
                        .filter((league) => league.favourite)
                        .map((league) => league.id)
                        .includes(market.tags.map((tag) => Number(tag))[0])
                );
            } else {
                filteredMarkets = filteredMarkets.filter((market: SportMarketInfo) => market.sport === sportFilter);
            }
        }

        return filteredMarkets;
    }, [datesFilteredMarkets, sportFilter, favouriteLeagues]);

    const tagsFilteredMarkets = useMemo(() => {
        let filteredMarkets = sportFilteredMarkets;
        if (tagFilter.length > 0) {
            filteredMarkets = filteredMarkets.filter((market: SportMarketInfo) =>
                tagFilter.map((tag) => tag.id).includes(market.tags.map((tag) => Number(tag))[0])
            );
        }
        return filteredMarkets;
    }, [sportFilteredMarkets, tagFilter]);

    const marketsList = useMemo(() => {
        let filteredMarkets = tagsFilteredMarkets;
        switch (globalFilter) {
            case GlobalFiltersEnum.OpenMarkets:
                filteredMarkets = filteredMarkets.filter(
                    (market: SportMarketInfo) =>
                        market.isOpen &&
                        !market.isCanceled &&
                        !market.isPaused &&
                        (market.homeOdds !== 0 || market.awayOdds !== 0 || market.drawOdds !== 0)
                );
                break;
            case GlobalFiltersEnum.ResolvedMarkets:
                filteredMarkets = filteredMarkets.filter(
                    (market: SportMarketInfo) =>
                        market.isResolved &&
                        !market.isCanceled &&
                        market.maturityDate.getTime() + 7 * 24 * 60 * 60 * 1000 > new Date().getTime()
                );
                break;
            case GlobalFiltersEnum.PendingMarkets:
                filteredMarkets = filteredMarkets.filter(async (market: SportMarketInfo) => {
                    if (market.maturityDate < new Date() && !market.isResolved && !market.isCanceled) {
                        if (market.isPaused) {
                            const rundownConsumerContract = networkConnector.theRundownConsumerContract;
                            const [marketInvalidOdds] = await Promise.all([
                                await rundownConsumerContract?.invalidOdds(market.address),
                            ]);
                            if (marketInvalidOdds) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return true;
                        }
                    }
                    return false;
                });
                break;
            case GlobalFiltersEnum.YourPositions:
                filteredMarkets = filteredMarkets.filter((market: SportMarketInfo) => {
                    const accountPositionsPerMarket: AccountPosition[] = accountPositions[market.address];
                    let positionExists = false;
                    accountPositionsPerMarket?.forEach((accountPosition) =>
                        accountPosition.amount > 0 ? (positionExists = true) : ''
                    );
                    return positionExists;
                });
                break;
            case GlobalFiltersEnum.Claim:
                filteredMarkets = filteredMarkets.filter((market: SportMarketInfo) => {
                    const accountPositionsPerMarket: AccountPosition[] = accountPositions[market.address];
                    return isClaimAvailable(accountPositionsPerMarket);
                });
                break;
            case GlobalFiltersEnum.Canceled:
                filteredMarkets = filteredMarkets.filter(async (market: SportMarketInfo) => {
                    if ((market.isCanceled || market.isPaused) && !market.isResolved) {
                        if (market.isPaused && market.maturityDate < new Date()) {
                            const rundownConsumerContract = networkConnector.theRundownConsumerContract;

                            const [marketInvalidOdds] = await Promise.all([
                                await rundownConsumerContract?.invalidOdds(market.address),
                            ]);

                            if (marketInvalidOdds) {
                                return false;
                            }
                        }
                        return true;
                    }
                    return false;
                });
                break;
            default:
                break;
        }
        const sortedFilteredMarkets = filteredMarkets.sort((a, b) => {
            switch (globalFilter) {
                case GlobalFiltersEnum.ResolvedMarkets:
                case GlobalFiltersEnum.Canceled:
                    return sortByField(a, b, SortDirection.DESC, 'maturityDate');
                default:
                    return sortByField(a, b, SortDirection.ASC, 'maturityDate');
            }
        });

        if (GlobalFiltersEnum.OpenMarkets == globalFilter) {
            return groupBySortedMarkets(sortedFilteredMarkets);
        }
        return sortedFilteredMarkets;
    }, [tagsFilteredMarkets, globalFilter, accountPositions]);

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

            <BurgerFiltersContainer show={showBurger && isMobile}>
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
                                            setAvailableTags(tagsList.sort((a, b) => a.label.localeCompare(b.label)));
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

            <RowContainer>
                {/* LEFT FILTERS */}
                <SidebarContainer>
                    <Search
                        text={marketSearch}
                        handleChange={(value) => {
                            dispatch(setMarketSearch(value));
                            setSearchParam(value);
                        }}
                        width={300}
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
                    <SidebarLeaderboard />
                </SidebarContainer>
                {/* MAIN PART */}
                {sportMarketsQuery.isLoading ? (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                ) : globalFilter === GlobalFiltersEnum.History ? (
                    <UserHistory />
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
                        {marketsList.length === 0 ? (
                            <NoMarketsContainer>
                                <NoMarketsLabel>{t('market.no-markets-found')}</NoMarketsLabel>
                                <Button onClick={resetFilters}>{t('market.view-all-markets')}</Button>
                            </NoMarketsContainer>
                        ) : (
                            <MarketsGrid markets={marketsList} accountPositions={accountPositions} />
                        )}
                    </MainContainer>
                )}
                {/* RIGHT PART */}
                <SidebarContainer>
                    {networkId === NetworkIdByName.OptimismMainnet && <GetUsd />}
                    <Parlay />
                </SidebarContainer>
            </RowContainer>
            {isMobile && showParlayMobileModal && <ParlayMobileModal onClose={() => setshowParlayMobileModal(false)} />}
            {isMobile && (
                <FooterSidebarMobile
                    setParlayMobileVisibility={setshowParlayMobileModal}
                    setShowBurger={setShowBurger}
                    parlayMarkets={parlayMarkets}
                />
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
`;

const RowContainer = styled(FlexDivRow)`
    width: 100%;
    flex: 1 1 0%;
    flex-direction: row;
    justify-content: center;
`;

const MainContainer = styled(FlexDivColumn)`
    padding-top: 25px;
    width: 100%;
    max-width: 750px;
    flex-grow: 1;
`;

const SidebarContainer = styled(FlexDivColumn)`
    padding-top: 25px;
    max-width: 300px;
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
    padding-top: 20px;
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

export default Home;
`;

export default Home;
