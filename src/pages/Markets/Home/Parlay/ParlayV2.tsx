import { ReactComponent as ParlayEmptyIcon } from 'assets/images/parlay-empty.svg';
import { GlobalFiltersEnum } from 'enums/markets';
import { t } from 'i18next';
import useSportsAmmDataQuery from 'queries/markets/useSportsAmmDataQuery';
import useSportsMarketsV2Query from 'queries/markets/useSportsMarketsV2Query';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import {
    getHasTicketError,
    getTicket,
    removeAll,
    resetTicketError,
    setMaxTicketSize,
    setPaymentSelectedCollateralIndex,
} from 'redux/modules/ticket';
import { getIsWalletConnected, getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { SportMarketInfoV2, TicketMarket } from 'types/markets';
import { isSameMarket } from 'utils/markets';
import { getDefaultCollateralIndexForNetworkId } from 'utils/network';
import MatchInfoV2 from './components/MatchInfoV2';
import TicketV2 from './components/TicketV2';
import ValidationModal from './components/ValidationModal';

type ParylayProps = {
    onBuySuccess?: () => void;
};

const Parlay: React.FC<ParylayProps> = ({ onBuySuccess }) => {
    const dispatch = useDispatch();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const ticket = useSelector(getTicket);
    const hasTicketError = useSelector(getHasTicketError);

    const [ticketMarkets, setTicketMarkets] = useState<TicketMarket[]>([]);
    const [updatedQuotes, setUpdatedQuotes] = useState<number[]>([]);

    const [outOfLiquidityMarkets, setOutOfLiquidityMarkets] = useState<number[]>([]);

    const sportsAmmDataQuery = useSportsAmmDataQuery(networkId, {
        enabled: isAppReady,
    });

    const sportMarketsQuery = useSportsMarketsV2Query(GlobalFiltersEnum.OpenMarkets, networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        dispatch(
            setPaymentSelectedCollateralIndex({
                selectedCollateralIndex: getDefaultCollateralIndexForNetworkId(networkId),
                networkId: networkId,
            })
        );
    }, [networkId, dispatch]);

    useEffect(() => {
        if (sportsAmmDataQuery.isSuccess && sportsAmmDataQuery.data) {
            dispatch(setMaxTicketSize(sportsAmmDataQuery.data.maxTicketSize));
        }
    }, [dispatch, sportsAmmDataQuery.isSuccess, sportsAmmDataQuery.data]);

    useEffect(() => {
        if (sportMarketsQuery.isSuccess && sportMarketsQuery.data) {
            const sportOpenMarkets = sportMarketsQuery.data[GlobalFiltersEnum.OpenMarkets].reduce(
                (acc: SportMarketInfoV2[], market: SportMarketInfoV2) => {
                    acc.push(market);
                    market.childMarkets.forEach((childMarket: SportMarketInfoV2) => {
                        acc.push(childMarket);
                    });
                    return acc;
                },
                []
            );

            const ticketMarkets: TicketMarket[] = ticket
                .filter((ticketPosition) => {
                    return sportOpenMarkets.some((market: SportMarketInfoV2) => {
                        return isSameMarket(market, ticketPosition);
                    });
                })
                .map((ticketPosition) => {
                    const openMarket: SportMarketInfoV2 = sportOpenMarkets.filter((market: SportMarketInfoV2) =>
                        isSameMarket(market, ticketPosition)
                    )[0];
                    return {
                        ...openMarket,
                        position: ticketPosition.position,
                    };
                });

            // If market is not opened any more remove it
            if (ticket.length > ticketMarkets.length) {
                const notOpenedMarkets = ticket.filter((ticketPosition) => {
                    return sportOpenMarkets.some((market: SportMarketInfoV2) => {
                        return !isSameMarket(market, ticketPosition);
                    });
                });

                if (notOpenedMarkets.length > 0) dispatch(removeAll());
            }

            setTicketMarkets(ticketMarkets);
        }
    }, [sportMarketsQuery.isSuccess, sportMarketsQuery.data, ticket, dispatch]);

    useEffect(() => {
        setUpdatedQuotes([]);
    }, [setUpdatedQuotes, ticketMarkets]);

    const onCloseValidationModal = useCallback(() => dispatch(resetTicketError()), [dispatch]);

    return (
        <Container isMobile={isMobile} isWalletConnected={isWalletConnected}>
            {ticketMarkets.length > 0 ? (
                <>
                    <>
                        <ListContainer>
                            {ticketMarkets.length > 0 &&
                                ticketMarkets.map((market, index) => {
                                    const outOfLiquidity = outOfLiquidityMarkets.includes(index);
                                    return (
                                        <RowMarket key={index} outOfLiquidity={outOfLiquidity}>
                                            <MatchInfoV2
                                                updatedQuote={updatedQuotes[index]}
                                                market={market}
                                                isHighlighted={true}
                                            />
                                        </RowMarket>
                                    );
                                })}
                        </ListContainer>
                        <HorizontalLine />
                        <TicketV2
                            markets={ticketMarkets}
                            setMarketsOutOfLiquidity={setOutOfLiquidityMarkets}
                            onBuySuccess={onBuySuccess}
                            setUpdatedQuotes={setUpdatedQuotes}
                        />
                    </>
                </>
            ) : (
                <>
                    <Empty>
                        <EmptyLabel>{t('markets.parlay.empty-title')}</EmptyLabel>
                        <ParlayEmptyIcon
                            style={{
                                marginTop: 10,
                                marginBottom: 20,
                                width: '100px',
                                height: '100px',
                            }}
                        />
                        <EmptyDesc>{t('markets.parlay.empty-description')}</EmptyDesc>
                    </Empty>
                </>
            )}
            {hasTicketError && <ValidationModal onClose={onCloseValidationModal} />}
        </Container>
    );
};

const Container = styled(FlexDivColumn)<{ isMobile: boolean; isWalletConnected?: boolean }>`
    max-width: 320px;
    padding: 12px;
    flex: none;
    background: linear-gradient(180deg, #303656 0%, #1a1c2b 100%);
    border-radius: 7px;
`;

const ListContainer = styled(FlexDivColumn)``;

const RowMarket = styled.div<{ outOfLiquidity: boolean }>`
    display: flex;
    position: relative;
    height: 45px;
    align-items: center;
    text-align: center;
    padding: ${(props) => (props.outOfLiquidity ? '5px' : '5px 0px')};
    ${(props) => (props.outOfLiquidity ? 'background: rgba(26, 28, 43, 0.5);' : '')}
    ${(props) => (props.outOfLiquidity ? `border: 2px solid ${props.theme.status.loss};` : '')}
    ${(props) => (props.outOfLiquidity ? 'border-radius: 2px;' : '')}
`;

const HorizontalLine = styled.hr`
    width: 100%;
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    border-radius: 2px;
    background: ${(props) => props.theme.background.tertiary};
`;

const Empty = styled(FlexDivColumn)`
    align-items: center;
    margin-bottom: 40px;
`;

const EmptyLabel = styled.span`
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 38px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
`;

const EmptyDesc = styled.span`
    width: 80%;
    text-align: center;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 14px;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.textColor.quaternary};
`;

export default Parlay;
