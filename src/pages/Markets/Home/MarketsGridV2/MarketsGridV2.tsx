import Scroll from 'components/Scroll';
import { LeagueMap } from 'constants/sports';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { BOXING_TAGS, EUROPA_LEAGUE_TAGS } from 'constants/tags';
import { Sport } from 'enums/sports';
import useLocalStorage from 'hooks/useLocalStorage';
import i18n from 'i18n';
import { groupBy } from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsMarketSelected } from 'redux/modules/market';
import { getFavouriteLeagues } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { SportMarket, SportMarkets, TagInfo, Tags } from 'types/markets';
import { getIsMobile } from '../../../../redux/modules/app';
import { getLeagueSport } from '../../../../utils/sports';
import MarketsListV2 from '../MarketsListV2';

type MarketsGridProps = {
    markets: SportMarkets;
};

const MarketsGrid: React.FC<MarketsGridProps> = ({ markets }) => {
    const language = i18n.language;
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const isMarketSelected = useSelector(getIsMarketSelected);
    const isMobile = useSelector(getIsMobile);
    const datePeriodFilter = useLocalStorage<number>(LOCAL_STORAGE_KEYS.FILTER_DATE_PERIOD, 0);

    const marketsMap: Record<number, SportMarket[]> = groupBy(markets, (market) => Number(market.leagueId));
    // UNIFYING EUROPA LEAGUE MARKETS FROM BOTH ENETPULSE & RUNDOWNS PROVIDERS
    const unifiedMarketsMapEuropaLeague = unifyEuropaLeagueMarkets(marketsMap);
    const unifiedMarketsMap = unifyBoxingMarkets(unifiedMarketsMapEuropaLeague);
    const marketsKeys = sortMarketKeys(
        Object.keys(marketsMap).map((key) => Number(key)),
        unifiedMarketsMap,
        favouriteLeagues,
        datePeriodFilter
    );

    const finalOrderKeys = Number(datePeriodFilter) !== 0 ? groupBySortedMarketsKeys(marketsKeys) : marketsKeys;

    const getContainerContent = () => (
        <ListContainer isMarketSelected={isMarketSelected}>
            {finalOrderKeys.map((leagueId: number, index: number) => {
                return (
                    <MarketsListV2 key={index} league={leagueId} markets={marketsMap[leagueId]} language={language} />
                );
            })}
        </ListContainer>
    );

    return (
        <Container isMarketSelected={isMarketSelected}>
            {isMobile ? getContainerContent() : <Scroll height="calc(100vh - 154px)">{getContainerContent()}</Scroll>}
        </Container>
    );
};

const sortMarketKeys = (
    marketsKeys: number[],
    marketsMap: Record<number, SportMarket[]>,
    favouriteLeagues: Tags,
    datePeriodFilter: any
) => {
    return marketsKeys.sort((a, b) => {
        if (Number(datePeriodFilter) !== 0) {
            const earliestGameA = marketsMap[a][0];
            const earliestGameB = marketsMap[b][0];

            const favouriteA = favouriteLeagues.find((league: TagInfo) => league.id == a);
            const isFavouriteA = Number(favouriteA && favouriteA.favourite);

            const favouriteB = favouriteLeagues.find((league: TagInfo) => league.id == b);
            const isFavouriteB = Number(favouriteB && favouriteB.favourite);

            const leagueA = Object.values(LeagueMap).find((t: TagInfo) => t.id == a);
            const leagueB = Object.values(LeagueMap).find((t: TagInfo) => t.id == b);

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

            const leagueA = Object.values(LeagueMap).find((t: TagInfo) => t.id == a);
            const leagueB = Object.values(LeagueMap).find((t: TagInfo) => t.id == b);

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
            mmaKeys.push(tag);
        }
        if (leagueSport === Sport.TENNIS) {
            tennisKeys.push(tag);
        }
        if (leagueSport === Sport.ESPORTS) {
            eSportsKeys.push(tag);
        }
        if (leagueSport === Sport.CRICKET) {
            cricketKeys.push(tag);
        }
        if (leagueSport === Sport.FIGHTING_SPORTS) {
            motosportKeys.push(tag);
        }
        if (leagueSport === Sport.GOLF) {
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

const unifyEuropaLeagueMarkets = (marketsMap: Record<number, SportMarket[]>) => {
    const rundownEuropaLeagueGames = marketsMap[EUROPA_LEAGUE_TAGS[0]] ? marketsMap[EUROPA_LEAGUE_TAGS[0]] : [];
    const enetpulseEuropaLeagueGames = marketsMap[EUROPA_LEAGUE_TAGS[1]] ? marketsMap[EUROPA_LEAGUE_TAGS[1]] : [];
    if (rundownEuropaLeagueGames.length > 0 || enetpulseEuropaLeagueGames.length > 0) {
        marketsMap[EUROPA_LEAGUE_TAGS[0]] = [...rundownEuropaLeagueGames, ...enetpulseEuropaLeagueGames];
        delete marketsMap[EUROPA_LEAGUE_TAGS[1]];
    }
    return marketsMap;
};

const unifyBoxingMarkets = (marketsMap: Record<number, SportMarket[]>) => {
    const boxingMarkets = marketsMap[BOXING_TAGS[0]] ? marketsMap[BOXING_TAGS[0]] : [];
    const boxingNonTitleMarkets = marketsMap[BOXING_TAGS[1]] ? marketsMap[BOXING_TAGS[1]] : [];
    if (boxingMarkets.length > 0 || boxingNonTitleMarkets.length > 0) {
        marketsMap[BOXING_TAGS[0]] = [...boxingMarkets, ...boxingNonTitleMarkets];
        delete marketsMap[BOXING_TAGS[1]];
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
