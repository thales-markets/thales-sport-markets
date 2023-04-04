import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { SPORTS_MAP, TAGS_LIST } from 'constants/tags';
import useLocalStorage from 'hooks/useLocalStorage';
import i18n from 'i18n';
import _ from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { getFavouriteLeagues } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { SportMarkets, TagInfo, Tags } from 'types/markets';
import { isMobile } from 'utils/device';
import { addHoursToCurrentDate } from 'utils/formatters/date';
import MarketsList from '../MarketsList';

type MarketsGridProps = {
    markets: SportMarkets;
};

const MarketsGrid: React.FC<MarketsGridProps> = ({ markets }) => {
    const language = i18n.language;
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const marketsMap = new Map();
    const marketsPartintionedByTag = _(markets).groupBy('tags[0]').values().value();
    const dateFilter = useLocalStorage<Date | number>(
        LOCAL_STORAGE_KEYS.FILTER_DATE,
        !isMobile ? addHoursToCurrentDate(72, true).getTime() : 0
    );

    marketsPartintionedByTag.forEach((marketArrayByTag) =>
        marketsMap.set(marketArrayByTag[0].tags[0], marketArrayByTag)
    );

    const marketsKeys = sortMarketKeys(Array.from(marketsMap.keys()), marketsMap, favouriteLeagues, dateFilter);

    const finalOrderKeys = Number(dateFilter) !== 0 ? groupBySortedMarketsKeys(marketsKeys) : marketsKeys;

    return (
        <Container>
            <ListContainer>
                {finalOrderKeys.map((leagueId: number, index: number) => {
                    return (
                        <MarketsList
                            key={index}
                            league={leagueId}
                            markets={marketsMap.get(leagueId)}
                            language={language}
                        />
                    );
                })}
            </ListContainer>
        </Container>
    );
};

const sortMarketKeys = (marketsKeys: number[], marketsMap: Map<any, any>, favouriteLeagues: Tags, dateFilter: any) => {
    return marketsKeys.sort((a, b) => {
        if (Number(dateFilter) !== 0) {
            const earliestGameA = marketsMap.get(a)[0];
            const earliestGameB = marketsMap.get(b)[0];

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
    const ufcKeys: number[] = [];
    const tennisKeys: number[] = [];
    const eSportsKeys: number[] = [];
    // const cricketKeys: number[] = [];
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
        if (SPORTS_MAP[tag] == 'UFC') {
            ufcKeys.push(tag);
        }
        if (SPORTS_MAP[tag] == 'Tennis') {
            tennisKeys.push(tag);
        }
        if (SPORTS_MAP[tag] == 'eSports') {
            eSportsKeys.push(tag);
        }
        // if (SPORTS_MAP[tag] == 'Cricket') {
        //     cricketKeys.push(tag);
        // }
    });

    return [
        ...soccerKeys,
        ...footballKeys,
        ...basketballKeys,
        ...baseballKeys,
        ...hockeyKeys,
        ...ufcKeys,
        ...tennisKeys,
        ...eSportsKeys,
        // ...cricketKeys,
    ];
};

const Container = styled(FlexDiv)`
    margin: 10px 10px 0 0;
    flex-wrap: wrap;
    max-width: 800px;
    justify-content: center;
    flex-grow: 2;
    > div {
        display: flex;
        width: 100%;
    }
    overflow-y: auto;
    // TODO - maybe remove max-height and scrolling, enable whole page scroll
    max-height: 1210px;
    scrollbar-width: 5px; /* Firefox */
    -ms-overflow-style: none;
    ::-webkit-scrollbar {
        /* WebKit */
        width: 5px;
        height: 5px;
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
    padding: 0 10px 20px 10px;
    @media (max-width: 950px) {
        padding: 0 0px 20px 0px;
    }
`;

export default MarketsGrid;
