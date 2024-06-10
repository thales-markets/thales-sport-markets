import { ReactComponent as ParlayEmptyIcon } from 'assets/images/parlay-empty.svg';
import MatchInfoV2 from 'components/MatchInfoV2';
import { SportFilter, StatusFilter } from 'enums/markets';
import useLiveSportsMarketsQuery from 'queries/markets/useLiveSportsMarketsQuery';
import useSportsAmmDataQuery from 'queries/markets/useSportsAmmDataQuery';
import useSportsMarketsV2Query from 'queries/markets/useSportsMarketsV2Query';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getSportFilter } from 'redux/modules/market';
import {
    getHasTicketError,
    getTicket,
    removeAll,
    resetTicketError,
    setMaxTicketSize,
    setPaymentSelectedCollateralIndex,
} from 'redux/modules/ticket';
import { getIsWalletConnected, getNetworkId } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { SportMarket, TicketMarket } from 'types/markets';
import { isSameMarket } from 'utils/marketsV2';
import { getDefaultCollateralIndexForNetworkId } from 'utils/network';
import TicketV2 from './components/TicketV2';
import ValidationModal from './components/ValidationModal';

const Parlay: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isAppReady = useSelector(getIsAppReady);
    const isMobile = useSelector(getIsMobile);
    const networkId = useSelector(getNetworkId);
    const isWalletConnected = useSelector(getIsWalletConnected);
    const ticket = useSelector(getTicket);
    const hasTicketError = useSelector(getHasTicketError);
    const sportFilter = useSelector(getSportFilter);
    const isLiveFilterSelected = sportFilter == SportFilter.Live;

    const [ticketMarkets, setTicketMarkets] = useState<TicketMarket[]>([]);
    const [oddsChanged, setOddsChanged] = useState<boolean>(false);
    const [acceptOdds, setAcceptOdds] = useState<boolean>(false);
    const [outOfLiquidityMarkets, setOutOfLiquidityMarkets] = useState<number[]>([]);

    const sportsAmmDataQuery = useSportsAmmDataQuery(networkId, {
        enabled: isAppReady,
    });

    const sportMarketsQuery = useSportsMarketsV2Query(StatusFilter.OPEN_MARKETS, networkId, {
        enabled: isAppReady,
    });

    const liveSportMarketsQuery = useLiveSportsMarketsQuery(networkId, isLiveFilterSelected, {
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
        if (liveSportMarketsQuery.isSuccess && liveSportMarketsQuery.data && isLiveFilterSelected) {
            const liveSportOpenMarkets = liveSportMarketsQuery.data.reduce(
                (acc: SportMarket[], market: SportMarket) => {
                    acc.push(market);
                    market.childMarkets.forEach((childMarket: SportMarket) => {
                        acc.push(childMarket);
                    });
                    return acc;
                },
                []
            );
            const ticketMarkets: TicketMarket[] = ticket
                .filter((ticketPosition) =>
                    liveSportOpenMarkets.some((market: SportMarket) => isSameMarket(market, ticketPosition))
                )
                .map((ticketPosition) => {
                    const openMarket: SportMarket = liveSportOpenMarkets.filter((market: SportMarket) =>
                        isSameMarket(market, ticketPosition)
                    )[0];
                    return {
                        ...openMarket,
                        position: ticketPosition.position,
                        odd: openMarket.odds[ticketPosition.position],
                    };
                });

            setTicketMarkets(ticketMarkets);
        }
    }, [isLiveFilterSelected, liveSportMarketsQuery.data, liveSportMarketsQuery.isSuccess, ticket]);

    useEffect(() => {
        if (sportMarketsQuery.isSuccess && sportMarketsQuery.data && !isLiveFilterSelected) {
            const sportOpenMarkets = sportMarketsQuery.data[StatusFilter.OPEN_MARKETS].reduce(
                (acc: SportMarket[], market: SportMarket) => {
                    acc.push(market);
                    market.childMarkets.forEach((childMarket: SportMarket) => {
                        acc.push(childMarket);
                    });
                    return acc;
                },
                []
            );

            const ticketMarkets: TicketMarket[] = ticket
                .filter((ticketPosition) =>
                    sportOpenMarkets.some((market: SportMarket) => isSameMarket(market, ticketPosition))
                )
                .map((ticketPosition) => {
                    const openMarket: SportMarket = sportOpenMarkets.filter((market: SportMarket) =>
                        isSameMarket(market, ticketPosition)
                    )[0];
                    return {
                        ...openMarket,
                        position: ticketPosition.position,
                        odd: openMarket.odds[ticketPosition.position],
                    };
                });

            // if market is not opened anymore remove it
            if (ticket.length > ticketMarkets.length) {
                const notOpenedMarkets = ticket.filter((ticketPosition) =>
                    sportOpenMarkets.every((market: SportMarket) => !isSameMarket(market, ticketPosition))
                );

                if (notOpenedMarkets.length > 0) dispatch(removeAll());
            }

            setTicketMarkets(ticketMarkets);
        }
    }, [sportMarketsQuery.isSuccess, sportMarketsQuery.data, ticket, dispatch, isLiveFilterSelected]);

    const onCloseValidationModal = useCallback(() => dispatch(resetTicketError()), [dispatch]);

    return (
        <Container isMobile={isMobile} isWalletConnected={isWalletConnected}>
            {ticketMarkets.length > 0 ? (
                <>
                    {!isMobile && <Title>{t('markets.parlay.ticket-slip')}</Title>}
                    <ListContainer>
                        {ticketMarkets.length > 0 &&
                            ticketMarkets.map((market, index) => {
                                const outOfLiquidity = outOfLiquidityMarkets.includes(index);
                                return (
                                    <RowMarket key={index} outOfLiquidity={outOfLiquidity}>
                                        <MatchInfoV2
                                            market={market}
                                            showOddUpdates
                                            setOddsChanged={setOddsChanged}
                                            acceptOdds={acceptOdds}
                                            setAcceptOdds={setAcceptOdds}
                                        />
                                    </RowMarket>
                                );
                            })}
                    </ListContainer>
                    <TicketV2
                        markets={ticketMarkets}
                        setMarketsOutOfLiquidity={setOutOfLiquidityMarkets}
                        oddsChanged={oddsChanged}
                        acceptOddChanges={(changed: boolean) => {
                            setAcceptOdds(true);
                            setOddsChanged(changed);
                        }}
                    />
                </>
            ) : (
                <>
                    <Empty>
                        <EmptyLabel>{t('markets.parlay.empty-title')}</EmptyLabel>
                        <StyledParlayEmptyIcon
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
    max-width: 360px;
    padding: 12px;
    flex: none;
    background: ${(props) => props.theme.background.quinary};
    border-radius: 7px;
    @media (max-width: 1199px) {
        max-width: 320px;
    }
    @media (max-width: 950px) {
        max-width: 100%;
        padding-bottom: 40px;
    }
`;

const Title = styled(FlexDivCentered)`
    color: ${(props) => props.theme.textColor.septenary};
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    text-transform: uppercase;
    height: 20px;
    margin-bottom: 10px;
`;

const ListContainer = styled(FlexDivColumn)``;

const RowMarket = styled.div<{ outOfLiquidity: boolean }>`
    display: flex;
    position: relative;
    // height: 45px;
    align-items: center;
    text-align: center;
    padding: ${(props) => (props.outOfLiquidity ? '6px 8px' : '8px 10px')};
    background: ${(props) =>
        props.outOfLiquidity ? props.theme.background.quinary : props.theme.background.secondary};
    ${(props) => (props.outOfLiquidity ? `border: 2px solid ${props.theme.status.loss};` : '')}
    margin-bottom: 11px;
    :first-child {
        border-radius: 5px 5px 0 0;
    }
    :last-child {
        border-radius: 0 0 5px 5px;
    }
    :first-child:last-child {
        border-radius: 5px;
    }
    :not(:first-child) {
        :before {
            content: '';
            position: absolute;
            left: 0;
            height: 6px;
            width: 100%;
            top: -4px;
            background: radial-gradient(
                    circle,
                    transparent,
                    transparent 50%,
                    ${(props) => props.theme.background.secondary} 50%,
                    ${(props) => props.theme.background.secondary} 100%
                )
                0px -6px / 0.7rem 0.7rem repeat-x;
        }
    }
    :not(:last-child) {
        :after {
            content: '';
            position: absolute;
            left: 0;
            height: 6px;
            width: 100%;
            bottom: -4px;
            background: radial-gradient(
                    circle,
                    transparent,
                    transparent 50%,
                    ${(props) => props.theme.background.secondary} 50%,
                    ${(props) => props.theme.background.secondary} 100%
                )
                0px 1px / 0.7rem 0.7rem repeat-x;
        }
    }
`;

const Empty = styled(FlexDivColumn)`
    align-items: center;
    margin-bottom: 40px;
`;

const EmptyLabel = styled.span`
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 38px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
    text-align: center;
`;

const EmptyDesc = styled.span`
    width: 80%;
    text-align: center;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 14px;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.textColor.quaternary};
`;

const StyledParlayEmptyIcon = styled(ParlayEmptyIcon)`
    margin-top: 10;
    margin-bottom: 20;
    width: 100px;
    height: 100px;
    path {
        fill: ${(props) => props.theme.textColor.quaternary};
    }
`;

export default Parlay;
