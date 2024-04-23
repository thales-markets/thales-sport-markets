import Scroll from 'components/Scroll';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { BOXING_TAGS, EUROPA_LEAGUE_TAGS, SPORTS_MAP, TAGS_LIST } from 'constants/tags';
import useLocalStorage from 'hooks/useLocalStorage';
import i18n from 'i18n';
import { groupBy } from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsMarketSelected } from 'redux/modules/market';
import { getFavouriteLeagues } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { SportMarketInfoV2, SportMarketsV2, TagInfo, Tags } from 'types/markets';
import MarketsListV2 from '../MarketsListV2';

type MarketsGridProps = {
    markets: SportMarketsV2;
};

const MarketsGrid: React.FC<MarketsGridProps> = ({ markets }) => {
    const language = i18n.language;
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const isMarketSelected = useSelector(getIsMarketSelected);
    const dateFilter = useLocalStorage<Date | number>(LOCAL_STORAGE_KEYS.FILTER_DATE, 0);

    const marketsMap: Record<number, SportMarketInfoV2[]> = groupBy(markets, (market) => Number(market.leagueId));
    // UNIFYING EUROPA LEAGUE MARKETS FROM BOTH ENETPULSE & RUNDOWNS PROVIDERS
    const unifiedMarketsMapEuropaLeague = unifyEuropaLeagueMarkets(marketsMap);
    const unifiedMarketsMap = unifyBoxingMarkets(unifiedMarketsMapEuropaLeague);
    const marketsKeys = sortMarketKeys(
        Object.keys(marketsMap).map((key) => Number(key)),
        unifiedMarketsMap,
        favouriteLeagues,
        dateFilter
    );

    const finalOrderKeys = Number(dateFilter) !== 0 ? groupBySortedMarketsKeys(marketsKeys) : marketsKeys;

    return (
        <Container isMarketSelected={isMarketSelected}>
            <Scroll height="calc(100vh - 154px)">
                <ListContainer>
                    {finalOrderKeys.map((leagueId: number, index: number) => {
                        return (
                            <MarketsListV2
                                key={index}
                                league={leagueId}
                                markets={marketsMap[leagueId]}
                                language={language}
                            />
                        );
                    })}
                </ListContainer>
            </Scroll>
        </Container>
    );
};

const sortMarketKeys = (
    marketsKeys: number[],
    marketsMap: Record<number, SportMarketInfoV2[]>,
    favouriteLeagues: Tags,
    dateFilter: any
) => {
    return marketsKeys.sort((a, b) => {
        if (Number(dateFilter) !== 0) {
            const earliestGameA = marketsMap[a][0];
            const earliestGameB = marketsMap[b][0];

            const favouriteA = favouriteLeagues.find((league: TagInfo) => league.id == a);
            const isFavouriteA = Number(favouriteA && favouriteA.favourite);

            const favouriteB = favouriteLeagues.find((league: TagInfo) => league.id == b);
            const isFavouriteB = Number(favouriteB && favouriteB.favourite);

            const leagueA = TAGS_LIST.find((t: TagInfo) => t.id == a);
            const leagueB = TAGS_LIST.find((t: TagInfo) => t.id == b);

            const leagueNameA = leagueA?.label || '';
            const leagueNameB = leagueB?.label || '';

            const leaguePriorityA = leagueA?.priority || 0;
            const leaguePriorityB = leagueB?.priority || 0;

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
        } else {
            const favouriteA = favouriteLeagues.find((league: TagInfo) => league.id == a);
            const isFavouriteA = Number(favouriteA && favouriteA.favourite);

            const favouriteB = favouriteLeagues.find((league: TagInfo) => league.id == b);
            const isFavouriteB = Number(favouriteB && favouriteB.favourite);

            const leagueA = TAGS_LIST.find((t: TagInfo) => t.id == a);
            const leagueB = TAGS_LIST.find((t: TagInfo) => t.id == b);

            const leagueNameA = leagueA?.label || '';
            const leagueNameB = leagueB?.label || '';

            const leaguePriorityA = leagueA?.priority || 0;
            const leaguePriorityB = leagueB?.priority || 0;

            return isFavouriteA == isFavouriteB
                ? leaguePriorityA > leaguePriorityB
                    ? 1
                    : leaguePriorityA < leaguePriorityB
                    ? -1
                    : leagueNameA > leagueNameB
                    ? 1
                    : -1
                : isFavouriteB - isFavouriteA;
        }
    });
};

const groupBySortedMarketsKeys = (marketsKeys: number[]) => {
    const soccerKeys: number[] = [];
    const footballKeys: number[] = [];
    const basketballKeys: number[] = [];
    const baseballKeys: number[] = [];
    const hockeyKeys: number[] = [];
    const mmaKeys: number[] = [];
    const tennisKeys: number[] = [];
    const eSportsKeys: number[] = [];
    const cricketKeys: number[] = [];
    const motosportKeys: number[] = [];
    const golfKeys: number[] = [];
    marketsKeys.forEach((tag: number) => {
        if (SPORTS_MAP[tag] == 'Soccer') {
            soccerKeys.push(tag);
        }
        if (SPORTS_MAP[tag] == 'Football') {
            footballKeys.push(tag);
        }
        if (SPORTS_MAP[tag] == 'Basketball') {
            basketballKeys.push(tag);
        }
        if (SPORTS_MAP[tag] == 'Baseball') {
            baseballKeys.push(tag);
        }
        if (SPORTS_MAP[tag] == 'Hockey') {
            hockeyKeys.push(tag);
        }
        if (SPORTS_MAP[tag] == 'Motosport') {
            mmaKeys.push(tag);
        }
        if (SPORTS_MAP[tag] == 'Tennis') {
            tennisKeys.push(tag);
        }
        if (SPORTS_MAP[tag] == 'eSports') {
            eSportsKeys.push(tag);
        }
        if (SPORTS_MAP[tag] == 'Cricket') {
            cricketKeys.push(tag);
        }
        if (SPORTS_MAP[tag] == 'MMA') {
            motosportKeys.push(tag);
        }
        if (SPORTS_MAP[tag] == 'Golf') {
            golfKeys.push(tag);
        }
    });

    return [
        ...footballKeys,
        ...soccerKeys,
        ...basketballKeys,
        ...baseballKeys,
        ...hockeyKeys,
        ...mmaKeys,
        ...tennisKeys,
        ...eSportsKeys,
        ...cricketKeys,
        ...motosportKeys,
        ...golfKeys,
    ];
};

const unifyEuropaLeagueMarkets = (marketsMap: Record<number, SportMarketInfoV2[]>) => {
    const rundownEuropaLeagueGames = marketsMap[EUROPA_LEAGUE_TAGS[0]] ? marketsMap[EUROPA_LEAGUE_TAGS[0]] : [];
    const enetpulseEuropaLeagueGames = marketsMap[EUROPA_LEAGUE_TAGS[1]] ? marketsMap[EUROPA_LEAGUE_TAGS[1]] : [];
    if (rundownEuropaLeagueGames.length > 0 || enetpulseEuropaLeagueGames.length > 0) {
        marketsMap[EUROPA_LEAGUE_TAGS[0]] = [...rundownEuropaLeagueGames, ...enetpulseEuropaLeagueGames];
        delete marketsMap[EUROPA_LEAGUE_TAGS[1]];
    }
    return marketsMap;
};

const unifyBoxingMarkets = (marketsMap: Record<number, SportMarketInfoV2[]>) => {
    const boxingMarkets = marketsMap[BOXING_TAGS[0]] ? marketsMap[BOXING_TAGS[0]] : [];
    const boxingNonTitleMarkets = marketsMap[BOXING_TAGS[1]] ? marketsMap[BOXING_TAGS[1]] : [];
    if (boxingMarkets.length > 0 || boxingNonTitleMarkets.length > 0) {
        marketsMap[BOXING_TAGS[0]] = [...boxingMarkets, ...boxingNonTitleMarkets];
        delete marketsMap[BOXING_TAGS[1]];
    }
    return marketsMap;
};

const Container = styled(FlexDiv)<{ isMarketSelected: boolean }>`
    margin: 10px 5px 0 0;
    flex-wrap: wrap;
    max-width: ${(props) => (props.isMarketSelected ? '210px' : '100%')};
    justify-content: center;
    flex-grow: 2;
    > div {
        display: flex;
        max-width: ${(props) => (props.isMarketSelected ? '100%' : '100%')};
        width: ${(props) => (props.isMarketSelected ? '100%' : '100%')};
    }
    overflow-x: hidden;
    scrollbar-width: 5px; /* Firefox */n
    -ms-overflow-style: none;
    ::-webkit-scrollbar {
        border-radius: 8px;
        width: 10px;
    }
    @media (max-width: 950px) {
        margin: 0;
        scrollbar-width: 0px; /* Firefox */
        ::-webkit-scrollbar {
            /* WebKit */
            width: 0px;
            height: 0px;
        }
    }
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0 10px 0 0;
    @media (max-width: 950px) {
        padding: 0 0px 0 0px;
    }
`;

export default MarketsGrid;