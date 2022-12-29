import { ReactComponent as ParlayEmptyIcon } from 'assets/images/parlay-empty.svg';
import { GlobalFiltersEnum } from 'constants/markets';
import { t } from 'i18next';
import useParlayAmmDataQuery from 'queries/markets/useParlayAmmDataQuery';
import useSportMarketsQueryNew from 'queries/markets/useSportsMarketsQueryNew';
import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import {
    getParlay,
    getParlayPayment,
    getHasParlayError,
    setParlaySize,
    removeFromParlay,
    resetParlayError,
    setPayment,
} from 'redux/modules/parlay';
import { getIsWalletConnected, getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { ParlaysMarket, SportMarketInfo } from 'types/markets';
import MatchInfo from './components/MatchInfo';
import Payment from './components/Payment';
import Single from './components/Single';
import Ticket from './components/Ticket';
import ValidationModal from './components/ValidationModal';

const Parlay: React.FC = () => {
    const dispatch = useDispatch();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const parlay = useSelector(getParlay);
    const parlayPayment = useSelector(getParlayPayment);
    const hasParlayError = useSelector(getHasParlayError);

    const [parlayMarkets, setParlayMarkets] = useState<ParlaysMarket[]>([]);
    const [outOfLiquidityMarkets, setOutOfLiquidityMarkets] = useState<number[]>([]);

    const parlayAmmDataQuery = useParlayAmmDataQuery(networkId, {
        enabled: isAppReady,
    });

    const sportMarketsQuery = useSportMarketsQueryNew(networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (parlayAmmDataQuery.isSuccess && parlayAmmDataQuery.data) {
            dispatch(setParlaySize(parlayAmmDataQuery.data.parlaySize));
        }
    }, [dispatch, parlayAmmDataQuery.isSuccess, parlayAmmDataQuery.data]);

    useEffect(() => {
        if (sportMarketsQuery.isSuccess && sportMarketsQuery.data) {
            const sportOpenMarkets = sportMarketsQuery.data[GlobalFiltersEnum.OpenMarkets].reduce(
                (acc: SportMarketInfo[], market) => {
                    acc.push(market);
                    market.childMarkets.forEach((childMarket) => {
                        acc.push(childMarket);
                    });
                    return acc;
                },
                []
            );

            const parlayMarkets: ParlaysMarket[] = parlay
                .filter((parlayMarket) => {
                    return sportOpenMarkets.some((market: SportMarketInfo) => {
                        return market.address === parlayMarket.sportMarketAddress;
                    });
                })
                .map((parlayMarket) => {
                    const openMarket: SportMarketInfo = sportOpenMarkets.filter(
                        (market: SportMarketInfo) => market.address === parlayMarket.sportMarketAddress
                    )[0];
                    return {
                        ...openMarket,
                        position: parlayMarket.position,
                    };
                });
            // If market is not opened any more remove it
            if (parlay.length > parlayMarkets.length) {
                const notOpenedMarkets = parlay.filter((parlayMarket) => {
                    return sportOpenMarkets.some((market: SportMarketInfo) => {
                        return market.address !== parlayMarket.sportMarketAddress;
                    });
                });
                notOpenedMarkets.forEach((market) => dispatch(removeFromParlay(market.sportMarketAddress)));
            }

            setParlayMarkets(parlayMarkets);
        }
    }, [sportMarketsQuery.isSuccess, sportMarketsQuery.data, parlay, dispatch]);

    const onCloaseValidationModal = useCallback(() => dispatch(resetParlayError()), [dispatch]);

    return (
        <Container isMobile={isMobile} isWalletConnected={isWalletConnected}>
            {parlayMarkets.length > 0 ? (
                <>
                    <ListContainer>
                        {parlayMarkets.map((market, index) => {
                            const outOfLiquidity = outOfLiquidityMarkets.includes(index);
                            return (
                                <RowMarket key={index} outOfLiquidity={outOfLiquidity}>
                                    <MatchInfo market={market} isHighlighted={true} />
                                </RowMarket>
                            );
                        })}
                    </ListContainer>
                    <HorizontalLine />
                    {parlayMarkets.length === 1 ? (
                        <Single market={parlayMarkets[0]} parlayPayment={parlayPayment} />
                    ) : (
                        <Ticket
                            markets={parlayMarkets}
                            parlayPayment={parlayPayment}
                            setMarketsOutOfLiquidity={setOutOfLiquidityMarkets}
                        />
                    )}
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
                    {isWalletConnected && (
                        <Payment
                            defaultSelectedStableIndex={parlayPayment.selectedStableIndex}
                            defaultIsVoucherSelected={parlayPayment.isVoucherSelected}
                            onChangeCollateral={(index) => {
                                if (index !== parlayPayment.selectedStableIndex) {
                                    dispatch(setPayment({ ...parlayPayment, selectedStableIndex: index }));
                                }
                            }}
                            setIsVoucherSelectedProp={(isSelected) =>
                                dispatch(setPayment({ ...parlayPayment, isVoucherSelected: isSelected }))
                            }
                        />
                    )}
                </>
            )}
            {hasParlayError && <ValidationModal onClose={onCloaseValidationModal} />}
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
    ${(props) => (props.outOfLiquidity ? 'border: 2px solid #e26a78;' : '')}
    ${(props) => (props.outOfLiquidity ? 'border-radius: 2px;' : '')}
`;

const HorizontalLine = styled.hr`
    width: 100%;
    border: 1px solid #5f6180;
    border-radius: 2px;
    background: #5f6180;
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
    color: #64d9fe;
`;

const EmptyDesc = styled.span`
    width: 80%;
    text-align: center;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 14px;
    letter-spacing: 0.025em;
    color: #64d9fe;
`;

export default Parlay;
