import { GlobalFiltersEnum } from 'constants/markets';
import useSportMarketsQuery from 'queries/markets/useSportMarketsQuery';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getParlay } from 'redux/modules/parlay';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { ParlaysMarket, ParlaysMarketPosition } from 'types/markets';
import Game from './components/Game';

const Parlay: React.FC = () => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const parlay = useSelector(getParlay);

    const [parlayMarkets, setParlayMarkets] = useState<ParlaysMarket[]>([]);

    const sportMarketsQuery = useSportMarketsQuery(networkId, GlobalFiltersEnum.OpenMarkets, null, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (sportMarketsQuery.isSuccess && sportMarketsQuery.data) {
            const sportOpenMarkets = sportMarketsQuery.data[GlobalFiltersEnum.OpenMarkets];

            const filteredOpenMarkets = sportOpenMarkets.filter((sportOpenMarket) => {
                return parlay.some((parlayMarket) => {
                    return parlayMarket.sportMarketId === sportOpenMarket.id;
                });
            });

            const mappedMarkets: ParlaysMarket[] = filteredOpenMarkets.map((openMarket) => {
                const parlaysMarket: ParlaysMarketPosition = parlay.filter(
                    (parlaysMarket) => parlaysMarket.sportMarketId === openMarket.id
                )[0];
                return {
                    ...openMarket,
                    position: parlaysMarket.position,
                };
            });
            setParlayMarkets(mappedMarkets);
        }
    }, [sportMarketsQuery.isSuccess, sportMarketsQuery.data, parlay]);

    return (
        <Container>
            <ListContainer>
                {parlayMarkets.map((market, index) => {
                    return (
                        <RowMarket key={index}>
                            <Game market={market} />
                        </RowMarket>
                    );
                })}
            </ListContainer>
            <HorizontalLine />
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    padding: 10px;
    max-width: 250px;
    flex-grow: 1;
    background: linear-gradient(180deg, #303656 0%, #1a1c2b 100%);
    border-radius: 10px;
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const RowMarket = styled.div`
    display: flex;
    position: relative;
    margin: 10px 0;
    height: 40px;
    align-items: center;
    text-align: center;
`;

const HorizontalLine = styled.hr`
    width: 100%;
    border: 1px solid #5f6180;
    border-radius: 2px;
`;

export default Parlay;
