// import SPAAnchor from 'components/SPAAnchor';
import { TAGS_LIST } from 'constants/tags';
import i18n from 'i18n';
import _ from 'lodash';
import React from 'react';
// import Masonry from 'react-masonry-css';
import { useSelector } from 'react-redux';
// import { getIsMobile } from 'redux/modules/app';
import { getFavouriteLeagues } from 'redux/modules/ui';
// import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { AccountPositionsMap, SportMarkets, TagInfo } from 'types/markets';
// import { buildMarketLink } from 'utils/routes';
// import MarketCard from '../MarketCard';
import MarketsList from '../MarketsList';

type MarketsGridProps = {
    markets: SportMarkets;
    accountPositions: AccountPositionsMap;
};

export const breakpointColumnsObj = {
    default: 3,
    1600: 2,
    1200: 1,
};

const MarketsGrid: React.FC<MarketsGridProps> = ({ markets, accountPositions }) => {
    // const isMobile = useSelector((state: RootState) => getIsMobile(state));
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
            {/* {isMobile ? (
                <Masonry breakpointCols={breakpointColumnsObj} className="">
                    {markets.map((market, index) => {
                        return (
                            <SPAAnchor key={index} href={buildMarketLink(market.address, language)}>
                                <MarketCard market={market} accountPositions={accountPositions[market.address]} />
                            </SPAAnchor>
                        );
                    })}
                </Masonry>
            ) : ( */}
            <ListContainer>
                {marketsKeys
                    .sort((a, b) => {
                        const isFavouriteA = Number(
                            favouriteLeagues.filter((league: TagInfo) => league.id == a)[0].favourite
                        );
                        const isFavouriteB = Number(
                            favouriteLeagues.filter((league: TagInfo) => league.id == b)[0].favourite
                        );
                        const leagueNameA = TAGS_LIST.find((t: TagInfo) => t.id == a)?.label;
                        const leagueNameB = TAGS_LIST.find((t: TagInfo) => t.id == b)?.label;
                        if (isFavouriteA == isFavouriteB) {
                            return (leagueNameA || '') > (leagueNameB || '') ? 1 : -1;
                        } else {
                            return isFavouriteB - isFavouriteA;
                        }
                    })
                    .map((leagueId: number, index: number) => {
                        return (
                            <MarketsList
                                key={index}
                                league={leagueId}
                                markets={marketsMap.get(leagueId)}
                                language={language}
                                accountPositions={accountPositions}
                            />
                        );
                    })}
            </ListContainer>
            {/* )} */}
        </Container>
    );
};

const Container = styled(FlexDiv)`
    margin: 20px 20px 0 0;
    flex-wrap: wrap;
    max-width: 750px;
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
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0 20px 20px 20px;
`;

export default MarketsGrid;
