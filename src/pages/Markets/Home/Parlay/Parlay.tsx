import { ReactComponent as ParlayEmptyIcon } from 'assets/images/parlay-empty.svg';
import { t } from 'i18next';
import useParlayAmmDataQuery from 'queries/markets/useParlayAmmDataQuery';
import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import {
    getParlay,
    getParlayPayment,
    getHasParlayError,
    setParlaySize,
    resetParlayError,
    setPayment,
    setPaymentSelectedStableIndex,
    getIsMultiSingle,
    setIsMultiSingle,
    getMultiSingle,
    removeAll,
    getCombinedPositions,
} from 'redux/modules/parlay';
import { getIsWalletConnected, getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { CombinedParlayMarket, ParlaysMarket, SportMarketInfo } from 'types/markets';
import { getDefaultCollateralIndexForNetworkId } from 'utils/network';
import MatchInfo from './components/MatchInfo';
import Payment from './components/Payment';
import Single from './components/Single';
import MultiSingle from './components/MultiSingle';
import Ticket from './components/Ticket';
import ValidationModal from './components/ValidationModal';
import Toggle from 'components/Toggle';
import MatchInfoOfCombinedMarket from './components/MatchInfoOfCombinedMarket';
import useSportMarketsQuery from 'queries/markets/useSportsMarketsQuery';
import { GlobalFiltersEnum } from 'enums/markets';
import { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';

type ParylayProps = {
    onBuySuccess?: () => void;
};

// type CombinedMarketsData = {
//     combinedMarkets: CombinedParlayMarket[];
//     parlaysWithoutCombinedMarkets: ParlaysMarket[];
//     isCombinedMarketsInParlay: boolean;
// };

const Parlay: React.FC<ParylayProps> = ({ onBuySuccess }) => {
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const parlay = useSelector(getParlay);
    const combinedPositions = useSelector(getCombinedPositions);
    const parlayPayment = useSelector(getParlayPayment);
    const isMultiSingleBet = useSelector(getIsMultiSingle);
    const hasParlayError = useSelector(getHasParlayError);
    const multiSingleStore = useSelector(getMultiSingle);

    const [parlayMarkets, setParlayMarkets] = useState<ParlaysMarket[]>([]);
    const [combinedMarketsData, setCombinedMarketsData] = useState<CombinedParlayMarket[]>([]);
    const [aggregatedParlayMarkets, setAggregatedParlayMarkets] = useState<ParlaysMarket[]>([]);

    const [outOfLiquidityMarkets, setOutOfLiquidityMarkets] = useState<number[]>([]);

    const parlayAmmDataQuery = useParlayAmmDataQuery(networkId, {
        enabled: isAppReady,
    });

    const sportMarketsQuery = useSportMarketsQuery(GlobalFiltersEnum.OpenMarkets, networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        dispatch(setPaymentSelectedStableIndex(getDefaultCollateralIndexForNetworkId(networkId)));
    }, [networkId, dispatch]);

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

            const combinedPositionMarkets: CombinedParlayMarket[] = combinedPositions
                .filter((combinedPosition) => {
                    return combinedPosition.markets.every((combinedMarket) => {
                        return !!sportOpenMarkets.find(
                            (sportMarket) => sportMarket.address == combinedMarket.sportMarketAddress
                        );
                    });
                })
                .map((position) => {
                    const combinedParlayMarket: CombinedParlayMarket = {
                        markets: [],
                        positions: [],
                        totalOdd: 0,
                        totalBonus: 0,
                        positionName: null,
                    };

                    position.markets.forEach((market) => {
                        const sportMarket = sportOpenMarkets.find(
                            (sportMarket) => sportMarket.address == market.sportMarketAddress
                        );
                        if (sportMarket) {
                            combinedParlayMarket.markets.push({
                                ...sportMarket,
                                position: market.position,
                            });
                            combinedParlayMarket.positions.push(market.position);
                        }
                    });

                    combinedParlayMarket.totalOdd = position.totalOdd;
                    combinedParlayMarket.totalBonus = position.totalBonus ?? 0;
                    combinedParlayMarket.positionName = position.positionName;

                    return combinedParlayMarket;
                });

            // If market is not opened any more remove it
            if (parlay.length > parlayMarkets.length) {
                const notOpenedMarkets = parlay.filter((parlayMarket) => {
                    return sportOpenMarkets.some((market: SportMarketInfo) => {
                        return market.address !== parlayMarket.sportMarketAddress;
                    });
                });

                if (notOpenedMarkets.length > 0) dispatch(removeAll());
            }

            setCombinedMarketsData(combinedPositionMarkets);
            setParlayMarkets(parlayMarkets);

            if (combinedPositionMarkets.length > 0 || parlayMarkets.length > 0) {
                const markets: ParlaysMarket[] = [];
                combinedPositionMarkets.forEach((item) => item.markets.forEach((market) => markets.push(market)));
                setAggregatedParlayMarkets([...markets, ...parlayMarkets]);
            }
        }
    }, [sportMarketsQuery.isSuccess, sportMarketsQuery.data, parlay, dispatch, combinedPositions]);

    console.log('aggregatedParlayMarkets ', aggregatedParlayMarkets);

    const onCloseValidationModal = useCallback(() => dispatch(resetParlayError()), [dispatch]);

    const onToggleTypeClickHandler = () => {
        const toggle = !isMultiSingleBet;
        dispatch(setIsMultiSingle(toggle));
    };

    return (
        <Container isMobile={isMobile} isWalletConnected={isWalletConnected}>
            {parlayMarkets.length > 0 || combinedMarketsData.length > 0 ? (
                <>
                    <Toggle
                        label={{
                            firstLabel: t('markets.parlay.toggle-parlay.parlay'),
                            secondLabel: t('markets.parlay.toggle-parlay.multi-single'),
                        }}
                        active={isMultiSingleBet}
                        disabled={multiSingleStore.length === 0}
                        dotSize="18px"
                        dotBackground={theme.background.secondary}
                        dotBorder={`3px solid ${theme.borderColor.quaternary}`}
                        handleClick={onToggleTypeClickHandler}
                    />
                    {isMultiSingleBet && multiSingleStore.length ? (
                        <>
                            <MultiSingle
                                markets={parlayMarkets}
                                combinedMarkets={combinedMarketsData}
                                parlayPayment={parlayPayment}
                            />
                        </>
                    ) : (
                        <>
                            <ListContainer>
                                {combinedMarketsData.length > 0 &&
                                    combinedMarketsData.map((market, index) => {
                                        return (
                                            <RowMarket key={index + 'combined'} outOfLiquidity={false}>
                                                <MatchInfoOfCombinedMarket
                                                    combinedMarket={market}
                                                    isHighlighted={true}
                                                />
                                            </RowMarket>
                                        );
                                    })}
                                {parlayMarkets.length > 0 &&
                                    parlayMarkets.map((market, index) => {
                                        const outOfLiquidity = outOfLiquidityMarkets.includes(index);
                                        return (
                                            <RowMarket key={index} outOfLiquidity={outOfLiquidity}>
                                                <MatchInfo market={market} isHighlighted={true} />
                                            </RowMarket>
                                        );
                                    })}
                            </ListContainer>
                            <HorizontalLine />
                            {aggregatedParlayMarkets.length === 1 ? (
                                <Single
                                    market={aggregatedParlayMarkets[0]}
                                    parlayPayment={parlayPayment}
                                    onBuySuccess={onBuySuccess}
                                />
                            ) : (
                                <Ticket
                                    markets={aggregatedParlayMarkets}
                                    parlayPayment={parlayPayment}
                                    setMarketsOutOfLiquidity={setOutOfLiquidityMarkets}
                                    onBuySuccess={onBuySuccess}
                                />
                            )}
                        </>
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
            {hasParlayError && <ValidationModal onClose={onCloseValidationModal} />}
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
