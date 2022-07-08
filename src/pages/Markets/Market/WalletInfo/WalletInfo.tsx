import React, { useEffect, useState } from 'react';
import {
    AlternateValue,
    Title,
    Token,
    TokenInfo,
    Value,
    ValueContainer,
    WalletInfoContainer,
} from './styled-components/WalletInfo';
import useMarketBalancesQuery from '../../../../queries/markets/useMarketBalancesQuery';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/rootReducer';
import { getIsWalletConnected, getWalletAddress } from '../../../../redux/modules/wallet';
import useMarketQuery from '../../../../queries/markets/useMarketQuery';
import { Balances, MarketData } from '../../../../types/markets';
import { Position, Side } from '../../../../constants/options';
import { ODDS_COLOR } from '../../../../constants/ui';
import { ReactComponent as WalletIcon } from 'assets/images/wallet-icon.svg';

type WalletInfoProps = {
    marketAddress: string;
};

const WalletInfo: React.FC<WalletInfoProps> = ({ marketAddress }) => {
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const [market, setMarket] = useState<MarketData | undefined>(undefined);
    const [balances, setBalances] = useState<Balances | undefined>(undefined);

    const marketBalancesQuery = useMarketBalancesQuery(marketAddress, walletAddress, {
        enabled: !!marketAddress && isWalletConnected,
    });

    const marketQuery = useMarketQuery(marketAddress);

    useEffect(() => {
        if (marketQuery.isSuccess && marketQuery.data) {
            setMarket(marketQuery.data);
        }
    }, [marketQuery.isSuccess, marketQuery.data]);

    useEffect(() => {
        if (marketBalancesQuery.isSuccess && marketBalancesQuery.data) {
            setBalances(marketBalancesQuery.data);
        }
    }, [marketBalancesQuery.isSuccess, marketBalancesQuery.data]);

    return (
        <WalletInfoContainer hasBalances={!!balances?.home || !!balances?.away || !!balances?.draw}>
            <TokenInfo>
                <WalletIcon />
                <Title>IN WALLET:</Title>
                <ValueContainer>
                    {!!balances?.home && (
                        <>
                            <Token color={ODDS_COLOR.HOME}>1</Token>
                            <Value>
                                {market?.homeTeam.toUpperCase()}: {balances?.home}
                            </Value>
                            <AlternateValue>
                                (${' '}
                                {(
                                    (market?.resolved
                                        ? 1
                                        : market?.positions[Position.HOME].sides[Side.SELL].odd || 0) *
                                    (balances?.home || 0)
                                ).toFixed(2)}
                                )
                            </AlternateValue>
                        </>
                    )}
                    {!!balances?.away && (
                        <>
                            <Token color={ODDS_COLOR.AWAY}>2</Token>
                            <Value>
                                {market?.awayTeam.toUpperCase()}: {balances?.away}
                            </Value>
                            <AlternateValue>
                                (${' '}
                                {(
                                    (market?.resolved
                                        ? 1
                                        : market?.positions[Position.AWAY].sides[Side.SELL].odd || 0) *
                                    (balances?.away || 0)
                                ).toFixed(2)}
                                )
                            </AlternateValue>
                        </>
                    )}
                    {!!balances?.draw && (
                        <>
                            <Token color={ODDS_COLOR.DRAW}>X</Token>
                            <Value>DRAW: {balances?.draw}</Value>
                            <AlternateValue>
                                (${' '}
                                {(
                                    (market?.resolved
                                        ? 1
                                        : market?.positions[Position.DRAW].sides[Side.SELL].odd || 0) *
                                    (balances?.draw || 0)
                                ).toFixed(2)}
                                )
                            </AlternateValue>
                        </>
                    )}
                </ValueContainer>
            </TokenInfo>
        </WalletInfoContainer>
    );
};

export default WalletInfo;
