import SPAAnchor from 'components/SPAAnchor';
import i18n from 'i18n';
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
    1600: 2,
    1200: 1,
};

const MarketsGrid: React.FC<MarketsGridProps> = ({ markets, accountPositions, layoutType = 0 }) => {
    const mobileGridView = window.innerWidth < 950;
    const language = i18n.language;

    return (
        <Container>
            {mobileGridView || layoutType == 0 ? (
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
                    {markets.map((market, index) => {
                        return (
                            <SPAAnchor key={index} href={buildMarketLink(market.address, language)}>
                                <MarketListCard
                                    market={market}
                                    key={index + 'list'}
                                    accountPositions={accountPositions[market.address]}
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
    overflow-y: auto;
    max-height: 1035px;
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px;
`;

export default MarketsGrid;
