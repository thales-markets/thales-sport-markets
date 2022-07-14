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
import { Balances, MarketData } from '../../../../types/markets';
import { Position, Side } from '../../../../constants/options';
import { ODDS_COLOR } from '../../../../constants/ui';
import { ReactComponent as WalletIcon } from 'assets/images/wallet-icon.svg';
import { FlexDivCentered } from '../../../../styles/common';

type WalletInfoProps = {
    market: MarketData | undefined;
};

const WalletInfo: React.FC<WalletInfoProps> = ({ market }) => {
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const [balances, setBalances] = useState<Balances | undefined>(undefined);

    const marketBalancesQuery = useMarketBalancesQuery(market?.address || '', walletAddress, {
        enabled: !!market?.address && isWalletConnected,
    });

    useEffect(() => {
        if (marketBalancesQuery.isSuccess && marketBalancesQuery.data) {
            setBalances(marketBalancesQuery.data);
        }
    }, [marketBalancesQuery.isSuccess, marketBalancesQuery.data]);

    return (
        <WalletInfoContainer hasBalances={!!balances?.home || !!balances?.away || !!balances?.draw}>
            <TokenInfo>
                <FlexDivCentered>
                    <WalletIcon />
                    <Title>IN WALLET:</Title>
                </FlexDivCentered>
                <ValueContainer>
                    {!!balances?.home && (
                        <>
                            <Token color={ODDS_COLOR.HOME}>1</Token>
                            <Value>
                                {market?.homeTeam.toUpperCase()}: {balances?.home}
                            </Value>
                            <AlternateValue>
                                (${' '}
                                {(market?.resolved && market.finalResult - 1 == Position.HOME
                                    ? 1 * (balances?.home || 0)
                                    : (market?.positions[Position.HOME].sides[Side.SELL].odd || 0) *
                                      (balances?.home || 0)
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
                                {(market?.resolved && market.finalResult - 1 == Position.DRAW
                                    ? 1 * (balances?.draw || 0)
                                    : (market?.positions[Position.DRAW].sides[Side.SELL].odd || 0) *
                                      (balances?.draw || 0)
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
                                {(market?.resolved && market.finalResult - 1 == Position.AWAY
                                    ? 1 * (balances?.away || 0)
                                    : (market?.positions[Position.AWAY].sides[Side.SELL].odd || 0) *
                                      (balances?.away || 0)
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
