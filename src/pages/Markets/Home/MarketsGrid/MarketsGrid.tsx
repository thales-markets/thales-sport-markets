import { TAGS_LIST } from 'constants/tags';
import i18n from 'i18n';
import _ from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { getFavouriteLeagues } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { SportMarkets, TagInfo } from 'types/markets';
import MarketsList from '../MarketsList';

type MarketsGridProps = {
    markets: SportMarkets;
};

const MarketsGrid: React.FC<MarketsGridProps> = ({ markets }) => {
    const language = i18n.language;
    const favouriteLeagues = useSelector(getFavouriteLeagues);
    const marketsMap = new Map();
    const marketsPartintionedByTag = _(markets).groupBy('tags[0]').values().value();

    marketsPartintionedByTag.forEach((marketArrayByTag) =>
        marketsMap.set(marketArrayByTag[0].tags[0], marketArrayByTag)
    );

    const marketsKeys = Array.from(marketsMap.keys());

    return (
        <Container>
            <ListContainer>
                {marketsKeys
                    .sort((a, b) => {
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
                    })
                    .map((leagueId: number, index: number) => {
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
