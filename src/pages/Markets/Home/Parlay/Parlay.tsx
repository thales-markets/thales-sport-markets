import { GlobalFiltersEnum } from 'constants/markets';
import useInterval from 'hooks/useInterval';
import useSportMarketsQuery from 'queries/markets/useSportMarketsQuery';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getParlay, getParlayError, resetParlayError } from 'redux/modules/parlay';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { ParlaysMarket, SportMarketInfo } from 'types/markets';
import MatchInfo from './components/MatchInfo';
import Single from './components/Single';
import Ticket from './components/Ticket';
import { CustomTooltip } from './styled-components';

const Parlay: React.FC = () => {
    const dispatch = useDispatch();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const parlay = useSelector(getParlay);
    const hasParlayError = useSelector(getParlayError);

    const [parlayMarkets, setParlayMarkets] = useState<ParlaysMarket[]>([]);

    const sportMarketsQuery = useSportMarketsQuery(networkId, GlobalFiltersEnum.OpenMarkets, null, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (sportMarketsQuery.isSuccess && sportMarketsQuery.data) {
            const sportOpenMarkets = sportMarketsQuery.data[GlobalFiltersEnum.OpenMarkets];

            const parlayOpenMarkets: ParlaysMarket[] = parlay
                .filter((parlayMarket) => {
                    return sportOpenMarkets.some((marker) => {
                        return marker.id === parlayMarket.sportMarketId;
                    });
                })
                .map((parlayMarket) => {
                    const openMarket: SportMarketInfo = sportOpenMarkets.filter(
                        (market) => market.id === parlayMarket.sportMarketId
                    )[0];
                    return {
                        ...openMarket,
                        position: parlayMarket.position,
                    };
                });
            setParlayMarkets(parlayOpenMarkets);
        }
    }, [sportMarketsQuery.isSuccess, sportMarketsQuery.data, parlay]);

    useInterval(async () => {
        if (hasParlayError) {
            dispatch(resetParlayError());
        }
    }, 5000);

    return (
        <Container>
            {parlayMarkets.length > 0 ? (
                <>
                    <ListContainer>
                        {parlayMarkets.map((market, index) => {
                            return (
                                <RowMarket key={index}>
                                    <MatchInfo market={market} />
                                </RowMarket>
                            );
                        })}
                    </ListContainer>
                    <CustomTooltip open={hasParlayError} title={'TODO: Maximum 4 markets in Parlay'}>
                        <HorizontalLine />
                    </CustomTooltip>
                    {parlayMarkets.length === 1 ? (
                        <Single market={parlayMarkets[0]} />
                    ) : (
                        <Ticket markets={parlayMarkets} />
                    )}
                </>
            ) : (
                <>NO POSITIONS</> // TODO: implement empty Parlay
            )}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    padding: 15px;
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
    background: #5f6180;
`;

export default Parlay;
