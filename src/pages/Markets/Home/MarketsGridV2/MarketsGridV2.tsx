import Scroll from 'components/Scroll';
import { BOXING_LEAGUES, LEAGUES_SORT_PRIORITY, LeagueMap } from 'constants/sports';
import { SportFilter } from 'enums/markets';
import { League, Sport } from 'enums/sports';
import i18n from 'i18n';
import { groupBy, sortBy } from 'lodash';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect } from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import { forceCheck } from 'react-lazyload';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getIsMarketSelected, getSportFilter } from 'redux/modules/market';
import { getFavouriteLeagues } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { SportMarket, SportMarkets, TagInfo, Tags } from 'types/markets';
import { setScrollMainContainerToTop } from 'utils/scroll';
import { getLeagueSport } from 'utils/sports';
import MarketsListV2 from '../MarketsListV2';

type MarketsGridProps = {
    markets: SportMarkets;
};

const MarketsGrid: React.FC<MarketsGridProps> = ({ markets }) => {
    const language = i18n.language;
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const isMarketSelected = useSelector(getIsMarketSelected);
    const isMobile = useSelector(getIsMobile);
    const sportFilter = useSelector(getSportFilter);

    const marketsMap: Record<number, SportMarket[]> = groupBy(markets, (market) => Number(market.leagueId));
    const unifiedMarketsMap = unifyBoxingMarkets(marketsMap);
    const marketsKeys = sortMarketKeys(
        Object.keys(marketsMap).map((key) => Number(key)),
        unifiedMarketsMap,
        favouriteLeagues
    );

    const finalOrderKeys = groupBySortedMarketsKeys(marketsKeys);

    useEffect(() => {
        forceCheck();
    }, [markets]);

    const getContainerContent = () => {
        let content: React.ReactElement[] = [];
        if (sportFilter === SportFilter.Boosted) {
            let sortedMarketsByLeague: SportMarket[] = [];
            let previousMarketLeagueId: League;
            markets.forEach((market: SportMarket, index: number) => {
                if (!previousMarketLeagueId || market.leagueId === previousMarketLeagueId) {
                    sortedMarketsByLeague.push(market);
                } else {
                    content.push(
                        <MarketsListV2
                            key={index}
                            league={previousMarketLeagueId}
                            markets={sortedMarketsByLeague}
                            language={language}
                        />
                    );
                    sortedMarketsByLeague = [market];
                }
                previousMarketLeagueId = market.leagueId;
                if (markets.length - 1 === index && sortedMarketsByLeague.length) {
                    content.push(
                        <MarketsListV2
                            key={'sorted' + sortedMarketsByLeague.length}
                            league={previousMarketLeagueId as League}
                            markets={sortedMarketsByLeague}
                            language={language}
                        />
                    );
                }
            });
        } else {
            content = finalOrderKeys.map((leagueId: number, index: number) => (
                <MarketsListV2 key={index} league={leagueId} markets={marketsMap[leagueId]} language={language} />
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

const sortMarketKeys = (marketsKeys: number[], marketsMap: Record<number, SportMarket[]>, favouriteLeagues: Tags) => {
    return marketsKeys.sort((a: League, b: League) => {
        const earliestGameA = marketsMap[a][0];
        const earliestGameB = marketsMap[b][0];

        const isFavouriteA = Number(!!favouriteLeagues.find((league: TagInfo) => league.id == a));
        const isFavouriteB = Number(!!favouriteLeagues.find((league: TagInfo) => league.id == b));

        const leagueInfoA = LeagueMap[a];
        const leagueInfoB = LeagueMap[b];

        const leagueNameA = leagueInfoA?.label || '';
        const leagueNameB = leagueInfoB?.label || '';

        const leaguePriorityA = leagueInfoA?.priority || 0;
        const leaguePriorityB = leagueInfoB?.priority || 0;

        return earliestGameA.maturityDate.getTime() == earliestGameB.maturityDate.getTime()
            ? isFavouriteA == isFavouriteB
                ? leaguePriorityA > leaguePriorityB
                    ? 1
                    : leaguePriorityA < leaguePriorityB
                    ? -1
                    : leagueNameA > leagueNameB
                    ? 1
                    : -1
                : isFavouriteB - isFavouriteA
            : earliestGameA.maturityDate.getTime() - earliestGameB.maturityDate.getTime();
    });
};

const groupBySortedMarketsKeys = (marketsKeys: number[]) => {
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

        if (leaguePriority !== -1) {
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

    return [
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
