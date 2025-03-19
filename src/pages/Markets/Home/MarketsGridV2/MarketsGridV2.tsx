import Scroll from 'components/Scroll';
import { LEAGUES_SORT_PRIORITY } from 'constants/sports';
import { format } from 'date-fns';
import { SortType, StatusFilter } from 'enums/markets';
import i18n from 'i18n';
import { groupBy, orderBy, sortBy, uniq } from 'lodash';
import debounce from 'lodash/debounce';
import { BOXING_LEAGUES, getLeagueSport, League, Sport } from 'overtime-utils';
import React, { useCallback, useEffect } from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import { forceCheck } from 'react-lazyload';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getIsMarketSelected, getSortType, getStatusFilter } from 'redux/modules/market';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { SportMarket, SportMarkets } from 'types/markets';
import { setScrollMainContainerToTop } from 'utils/scroll';
import MarketsListV2 from '../MarketsListV2';

type MarketsGridProps = {
    markets: SportMarkets;
};

const MarketsGrid: React.FC<MarketsGridProps> = ({ markets }) => {
    const language = i18n.language;
    const isMarketSelected = useSelector(getIsMarketSelected);
    const isMobile = useSelector(getIsMobile);
    const sortType = useSelector(getSortType);
    const statusFilter = useSelector(getStatusFilter);

    const sortedMarkets = orderBy(
        markets,
        [
            'maturityDate',
            (market) => {
                const sortPriority = LEAGUES_SORT_PRIORITY.findIndex((league: League) => league === market.leagueId);
                return sortPriority !== -1 ? sortPriority : Number.MAX_VALUE;
            },
        ],
        statusFilter === StatusFilter.OPEN_MARKETS ? ['asc', 'asc'] : ['desc', 'asc']
    );

    const sortedLeagues = uniq(sortedMarkets.map((market) => market.leagueId));

    const marketsByLeagueMap: Record<number, SportMarket[]> = unifyBoxingMarkets(
        groupBy(sortedMarkets, (market) => Number(market.leagueId))
    );

    let finalOrderKeys: number[] = [];

    if (statusFilter === StatusFilter.OPEN_MARKETS) {
        if (sortType === SortType.DEFAULT) {
            const leaguesWithSameMinMaturityShortDateMap = new Map<number, number[]>(); // MinMaturityShortDate => League[]
            const leaguesWithMinMaturityDateMap = new Map<number, number>(); // League => MinMaturityDate

            // for every league, set array of leagues with the same min maturity date
            sortedLeagues.forEach((league: number) => {
                const minMaturityDateForLeague = Math.min(
                    ...marketsByLeagueMap[league].map((market) => Number(market.maturityDate))
                );
                const minMaturityShortDateForLeague = Number(format(minMaturityDateForLeague, 'yyyyMMdd'));

                const currentLeaguesSet = new Set(
                    leaguesWithSameMinMaturityShortDateMap.get(minMaturityShortDateForLeague) || []
                );
                currentLeaguesSet.add(league);
                leaguesWithSameMinMaturityShortDateMap.set(minMaturityShortDateForLeague, [...currentLeaguesSet]);
                leaguesWithMinMaturityDateMap.set(league, minMaturityDateForLeague);
            });

            let alreadyPrioritizedLeagues: number[] = [];

            // group leagues by maturity date and sort using priorities if there are leagues with the same maturity date
            sortedLeagues.forEach((league: number) => {
                const minMaturityDateForLeague = Math.min(
                    ...marketsByLeagueMap[league].map((market) => Number(format(market.maturityDate, 'yyyyMMdd')))
                );

                const leaguesWithSameMaturityDate =
                    leaguesWithSameMinMaturityShortDateMap.get(minMaturityDateForLeague) || [];
                const leaguesToPrioritize = leaguesWithSameMaturityDate.sort(
                    (a: number, b: number) =>
                        Number(leaguesWithMinMaturityDateMap.get(a)) - Number(leaguesWithMinMaturityDateMap.get(b))
                );
                if (leaguesToPrioritize && leaguesToPrioritize.includes(league)) {
                    // group and prioritize leagues with the same maturity date only once
                    if (!alreadyPrioritizedLeagues.includes(league)) {
                        finalOrderKeys.push(...groupBySortedMarketsKeys(leaguesToPrioritize, true));
                        alreadyPrioritizedLeagues = [...leaguesToPrioritize];
                    }
                } else {
                    // add league which is unique by maturity date
                    finalOrderKeys.push(league);
                }
            });
        }
        if (sortType === SortType.PRIORITY) {
            finalOrderKeys = groupBySortedMarketsKeys(sortedLeagues, true);
        }
    } else {
        finalOrderKeys = groupBySortedMarketsKeys(sortedLeagues, false);
    }

    useEffect(() => {
        forceCheck();
    }, [markets]);

    const getContainerContent = () => {
        let content: React.ReactElement[] = [];

        if (statusFilter === StatusFilter.OPEN_MARKETS) {
            switch (sortType) {
                case SortType.START_TIME:
                    content = [<MarketsListV2 key={'singleList'} markets={sortedMarkets} language={language} />];
                    break;
                case SortType.PRIORITY:
                case SortType.DEFAULT:
                default:
                    content = finalOrderKeys.map((leagueId: number, index: number) => (
                        <MarketsListV2
                            key={index}
                            league={leagueId}
                            markets={marketsByLeagueMap[leagueId]}
                            language={language}
                        />
                    ));
            }
        } else {
            content = finalOrderKeys.map((leagueId: number, index: number) => (
                <MarketsListV2
                    key={index}
                    league={leagueId}
                    markets={marketsByLeagueMap[leagueId]}
                    language={language}
                />
            ));
        }

        return <ListContainer isMarketSelected={isMarketSelected}>{content}</ListContainer>;
    };

    const onRefChange = useCallback((scrollRef: Scrollbars) => {
        if (scrollRef) {
            setScrollMainContainerToTop(scrollRef.scrollToTop);
        }
    }, []);

    return (
        <Container isMarketSelected={isMarketSelected}>
            {isMobile ? (
                getContainerContent()
            ) : (
                <Scroll
                    innerRef={onRefChange}
                    onScroll={debounce(() => {
                        forceCheck();
                    }, 100)}
                    height="calc(100vh - 154px)"
                >
                    {getContainerContent()}
                </Scroll>
            )}
        </Container>
    );
};

const groupBySortedMarketsKeys = (marketsKeys: number[], usePriority: boolean) => {
    const soccerKeys: number[] = [];
    const footballKeys: number[] = [];
    const basketballKeys: number[] = [];
    const baseballKeys: number[] = [];
    const hockeyKeys: number[] = [];
    const fightingKeys: number[] = [];
    const tennisKeys: number[] = [];
    const tableTennisKeys: number[] = [];
    const eSportsKeys: number[] = [];
    const rugbyKeys: number[] = [];
    const volleyballKeys: number[] = [];
    const handballKeys: number[] = [];
    const waterpoloKeys: number[] = [];
    const cricketKeys: number[] = [];
    const motosportKeys: number[] = [];
    const golfKeys: number[] = [];
    const politicsKeys: number[] = [];
    const futuresKeys: number[] = [];

    const leaguePriorityMap = new Map<number, number[]>();

    marketsKeys.forEach((tag: number) => {
        const leaguePriority = LEAGUES_SORT_PRIORITY.findIndex((league: League) => league === tag);

        if (usePriority && leaguePriority !== -1) {
            const currentPriorityLeagues = leaguePriorityMap.get(leaguePriority) || [];
            currentPriorityLeagues.push(tag);
            leaguePriorityMap.set(leaguePriority, currentPriorityLeagues);
        } else {
            const leagueSport = getLeagueSport(tag);

            if (leagueSport === Sport.SOCCER) {
                soccerKeys.push(tag);
            }
            if (leagueSport === Sport.FOOTBALL) {
                footballKeys.push(tag);
            }
            if (leagueSport === Sport.BASKETBALL) {
                basketballKeys.push(tag);
            }
            if (leagueSport === Sport.BASEBALL) {
                baseballKeys.push(tag);
            }
            if (leagueSport === Sport.HOCKEY) {
                hockeyKeys.push(tag);
            }
            if (leagueSport === Sport.MOTOSPORT) {
                motosportKeys.push(tag);
            }
            if (leagueSport === Sport.TENNIS) {
                tennisKeys.push(tag);
            }
            if (leagueSport === Sport.TABLE_TENNIS) {
                tableTennisKeys.push(tag);
            }
            if (leagueSport === Sport.ESPORTS) {
                eSportsKeys.push(tag);
            }
            if (leagueSport === Sport.RUGBY) {
                rugbyKeys.push(tag);
            }
            if (leagueSport === Sport.VOLLEYBALL) {
                volleyballKeys.push(tag);
            }
            if (leagueSport === Sport.HANDBALL) {
                handballKeys.push(tag);
            }
            if (leagueSport === Sport.WATERPOLO) {
                waterpoloKeys.push(tag);
            }
            if (leagueSport === Sport.CRICKET) {
                cricketKeys.push(tag);
            }
            if (leagueSport === Sport.FIGHTING) {
                fightingKeys.push(tag);
            }
            if (leagueSport === Sport.GOLF) {
                golfKeys.push(tag);
            }
            if (leagueSport === Sport.POLITICS) {
                politicsKeys.push(tag);
            }
            if (leagueSport === Sport.FUTURES) {
                futuresKeys.push(tag);
            }
        }
    });

    const prioritizedLeagueKeys: number[] = [];

    sortBy(Array.from(leaguePriorityMap.keys())).forEach((priority: number) => {
        prioritizedLeagueKeys.push(...(leaguePriorityMap.get(priority) || []));
    });

    const sortedWithPriority = [
        ...prioritizedLeagueKeys,
        ...soccerKeys,
        ...tennisKeys,
        ...footballKeys,
        ...basketballKeys,
        ...baseballKeys,
        ...hockeyKeys,
        ...fightingKeys,
        ...tableTennisKeys,
        ...eSportsKeys,
        ...rugbyKeys,
        ...volleyballKeys,
        ...handballKeys,
        ...waterpoloKeys,
        ...cricketKeys,
        ...motosportKeys,
        ...golfKeys,
        ...politicsKeys,
        ...futuresKeys,
    ];

    return sortedWithPriority;
};

const unifyBoxingMarkets = (marketsMap: Record<number, SportMarket[]>) => {
    const boxingMarkets = marketsMap[BOXING_LEAGUES[0]] ? marketsMap[BOXING_LEAGUES[0]] : [];
    const boxingNonTitleMarkets = marketsMap[BOXING_LEAGUES[1]] ? marketsMap[BOXING_LEAGUES[1]] : [];
    if (boxingMarkets.length > 0 || boxingNonTitleMarkets.length > 0) {
        marketsMap[BOXING_LEAGUES[0]] = [...boxingMarkets, ...boxingNonTitleMarkets];
        delete marketsMap[BOXING_LEAGUES[1]];
    }
    return marketsMap;
};

const Container = styled(FlexDiv)<{ isMarketSelected: boolean }>`
    margin: ${(props) => (props.isMarketSelected ? '10px 5px 0 0' : '10px 0 0 0')};;
    flex-wrap: wrap;
    max-width: ${(props) => (props.isMarketSelected ? '210px' : '100%')};
    justify-content: center;
    flex-grow: 2;
    > div {
        display: flex;
        max-width: ${(props) => (props.isMarketSelected ? '100%' : '100%')};
        width: ${(props) => (props.isMarketSelected ? '100%' : '100%')};
    }
    @media (max-width: 950px) {
        margin: 10px 0 0 0;
`;

const ListContainer = styled.div<{ isMarketSelected: boolean }>`
    display: flex;
    flex-direction: column;
    padding-right: ${(props) => (props.isMarketSelected ? '10px' : '15px')};
    @media (max-width: 1199px) {
        padding-right: 10px;
    }
    @media (max-width: 950px) {
        padding: 0;
    }
`;

export default MarketsGrid;
