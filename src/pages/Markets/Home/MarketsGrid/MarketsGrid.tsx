import SPAAnchor from 'components/SPAAnchor';
import React from 'react';
import Masonry from 'react-masonry-css';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { AccountPositionsMap, SportMarkets } from 'types/markets';
import { buildMarketLink } from 'utils/routes';
import MarketCard from '../MarketCard';
import MarketListCard from '../MarketListCard';

type MarketsGridProps = {
    markets: SportMarkets;
    accountPositions: AccountPositionsMap;
    layoutType?: number;
};

export const breakpointColumnsObj = {
    default: 3,
    1200: 2,
    850: 1,
};

const MarketsGrid: React.FC<MarketsGridProps> = ({ markets, accountPositions, layoutType = 0 }) => {
    return (
        <Container>
            {layoutType == 0 && (
                <Masonry breakpointCols={breakpointColumnsObj} className="">
                    {markets.map((market, index) => {
                        return (
                            <SPAAnchor key={index} href={buildMarketLink(market.address)}>
                                <MarketCard market={market} accountPosition={accountPositions[market.address]} />
                            </SPAAnchor>
                        );
                    })}
                </Masonry>
            )}
            {layoutType == 1 && (
                <ListContainer>
                    {markets.map((market, index) => {
                        return (
                            <SPAAnchor key={index} href={buildMarketLink(market.address)}>
                                <MarketListCard
                                    market={market}
                                    key={index + 'list'}
                                    accountPosition={accountPositions[market.address]}
                                />
                            </SPAAnchor>
                        );
                    })}
                </ListContainer>
            )}
        </Container>
    );
};

const Container = styled(FlexDiv)`
    flex-wrap: wrap;
    max-width: 1220px;
    justify-content: center;
    flex-grow: 2;
    > div {
        display: flex;
        width: 100%;
    }
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

export default MarketsGrid;
