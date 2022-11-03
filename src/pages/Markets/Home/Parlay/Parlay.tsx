import { ReactComponent as ParlayEmptyIcon } from 'assets/images/parlay-empty.svg';
import { LINKS } from 'constants/links';
import { GlobalFiltersEnum } from 'constants/markets';
import { t } from 'i18next';
import useSportMarketsQuery from 'queries/markets/useSportMarketsQuery';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import {
    getParlay,
    getParlayPayment,
    getHasParlayError,
    removeFromParlay,
    resetParlayError,
} from 'redux/modules/parlay';
import { getIsWalletConnected, getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { ParlaysMarket, SportMarketInfo } from 'types/markets';
import MatchInfo from './components/MatchInfo';
import Payment from './components/Payment';
import Single from './components/Single';
import Ticket from './components/Ticket';
import ValidationModal from './components/ValidationModal';

const Parlay: React.FC = () => {
    const dispatch = useDispatch();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const parlay = useSelector(getParlay);
    const parlayPayment = useSelector(getParlayPayment);
    const hasParlayError = useSelector(getHasParlayError);

    const [parlayMarkets, setParlayMarkets] = useState<ParlaysMarket[]>([]);
    const [outOfLiquidityMarkets, setOutOfLiquidityMarkets] = useState<number[]>([]);

    const sportMarketsQuery = useSportMarketsQuery(networkId, GlobalFiltersEnum.OpenMarkets, null, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (sportMarketsQuery.isSuccess && sportMarketsQuery.data) {
            const sportOpenMarkets = sportMarketsQuery.data[GlobalFiltersEnum.OpenMarkets];
            const parlayMarkets: ParlaysMarket[] = parlay
                .filter((parlayMarket) => {
                    return sportOpenMarkets.some((market) => {
                        return market.id === parlayMarket.sportMarketId;
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
            // If market is not opened any more remove it
            if (parlay.length > parlayMarkets.length) {
                const notOpenedMarkets = parlay.filter((parlayMarket) => {
                    return sportOpenMarkets.some((market) => {
                        return market.id !== parlayMarket.sportMarketId;
                    });
                });
                notOpenedMarkets.forEach((market) => dispatch(removeFromParlay(market.sportMarketId)));
            }

            setParlayMarkets(parlayMarkets);
        }
    }, [sportMarketsQuery.isSuccess, sportMarketsQuery.data, parlay, dispatch]);

    return (
        <Container isWalletConnected={isWalletConnected}>
            {parlayMarkets.length > 0 ? (
                <>
                    <ListContainer>
                        {parlayMarkets.map((market, index) => {
                            const outOfLiquidity = outOfLiquidityMarkets.includes(index);
                            return (
                                <RowMarket key={index} outOfLiquidity={outOfLiquidity}>
                                    <MatchInfo market={market} />
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
                    <Footer>
                        <Link target="_blank" rel="noreferrer" href={LINKS.Footer.Twitter}>
                            <TwitterIcon />
                        </Link>
                        <Link target="_blank" rel="noreferrer" href={'TODO: Share Parlay'}>
                            <ShareIcon />
                        </Link>
                    </Footer>
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
                    {isWalletConnected && <Payment />}
                </>
            )}
            {hasParlayError && <ValidationModal onClose={() => dispatch(resetParlayError())} />}
        </Container>
    );
};

const Container = styled(FlexDivColumn)<{ isWalletConnected?: boolean }>`
    margin-top: ${(props) => (props.isWalletConnected ? '20px' : '44px')};
    padding: 15px;
    flex: none;
    background: linear-gradient(180deg, #303656 0%, #1a1c2b 100%);
    border-radius: 10px;
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const RowMarket = styled.div<{ outOfLiquidity: boolean }>`
    display: flex;
    position: relative;
    margin: 5px 0;
    height: 45px;
    align-items: center;
    text-align: center;
    padding: ${(props) => (props.outOfLiquidity ? '5px' : '5px 7px')};
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

const Footer = styled(FlexDivCentered)`
    display: none; // TODO: Twitter is not supported yet
    margin-top: 20px;
`;

const Link = styled.a`
    font-size: 20px;
    :not(:last-child) {
        margin-right: 20px;
    }
`;

const TwitterIcon = styled.i`
    color: #ffffff;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\005C';
    }
`;

const ShareIcon = styled.i`
    color: #ffffff;
    &:before {
        font-family: ExoticIcons !important;
        content: '\\0052';
    }
`;

export default Parlay;
