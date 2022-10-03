import SPAAnchor from 'components/SPAAnchor';
import { TAGS_LIST } from 'constants/tags';
import i18n from 'i18n';
import _ from 'lodash';
import React from 'react';
import Masonry from 'react-masonry-css';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { AccountPositionsMap, SportMarkets, TagInfo } from 'types/markets';
import { buildMarketLink } from 'utils/routes';
import MarketCard from '../MarketCard';
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
    const mobileGridView = window.innerWidth < 950;
    const language = i18n.language;
    const marketsMap = new Map();

    const marketsPartintionedByTag = _(markets).groupBy('tags[0]').values().value();

    marketsPartintionedByTag.forEach((marketArrayByTag) =>
        marketsMap.set(marketArrayByTag[0].tags[0], marketArrayByTag)
    );

    return (
        <Container>
            {mobileGridView ? (
                <Masonry breakpointCols={breakpointColumnsObj} className="">
                    {markets.map((market, index) => {
                        return (
                            <SPAAnchor key={index} href={buildMarketLink(market.address, language)}>
                                <MarketCard market={market} accountPositions={accountPositions[market.address]} />
                            </SPAAnchor>
                        );
                    })}
                </Masonry>
            ) : (
                <ListContainer>
                    {Array.from(marketsMap.keys())
                        .sort((a, b) => {
                            const leagueNameA = TAGS_LIST.find((t: TagInfo) => t.id == a)?.label;
                            const leagueNameB = TAGS_LIST.find((t: TagInfo) => t.id == b)?.label;
                            return (leagueNameA || '') > (leagueNameB || '') ? 1 : -1;
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
            )}
        </Container>
    );
};

const Container = styled(FlexDiv)`
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
    padding: 20px;
`;

export default MarketsGrid;
