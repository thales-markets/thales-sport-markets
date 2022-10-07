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
import { useTranslation } from 'react-i18next';
import { RootState } from '../../../../redux/rootReducer';
import { getIsWalletConnected, getWalletAddress } from '../../../../redux/modules/wallet';
import { Balances, MarketData, Odds } from '../../../../types/markets';
import { Position, Side } from '../../../../constants/options';
import { ODDS_COLOR } from '../../../../constants/ui';
import { ReactComponent as WalletIcon } from 'assets/images/wallet-icon.svg';
import { FlexDivCentered } from '../../../../styles/common';
import useMarketCancellationOddsQuery from 'queries/markets/useMarketCancellationOddsQuery';
import { getIsApexTopGame } from 'utils/markets';

type WalletInfoProps = {
    market: MarketData | undefined;
};

const WalletInfo: React.FC<WalletInfoProps> = ({ market }) => {
    const { t } = useTranslation();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const [balances, setBalances] = useState<Balances | undefined>(undefined);
    const [oddsOnCancellation, setOddsOnCancellation] = useState<Odds | undefined>(undefined);
    const marketCancellationOddsQuery = useMarketCancellationOddsQuery(market?.address || '', {
        enabled: market?.cancelled,
    });
    const marketBalancesQuery = useMarketBalancesQuery(market?.address || '', walletAddress, {
        enabled: !!market?.address && isWalletConnected,
    });

    useEffect(() => {
        if (marketBalancesQuery.isSuccess && marketBalancesQuery.data) {
            setBalances(marketBalancesQuery.data);
        }
    }, [marketBalancesQuery.isSuccess, marketBalancesQuery.data]);

    useEffect(() => {
        if (marketCancellationOddsQuery.isSuccess && marketCancellationOddsQuery.data) {
            setOddsOnCancellation(marketCancellationOddsQuery.data);
        }
    }, [marketCancellationOddsQuery.isSuccess, marketCancellationOddsQuery.data]);

    const isApexTopGame = !!market && getIsApexTopGame(market.isApex, market.betType);

    return (
        <WalletInfoContainer hasBalances={!!balances?.home || !!balances?.away || !!balances?.draw}>
            <TokenInfo>
                <FlexDivCentered>
                    <WalletIcon />
                    <Title>{t('markets.market-details.wallet-info.title')}:</Title>
                </FlexDivCentered>
                <ValueContainer>
                    {!!balances?.home && (
                        <FlexDivCentered>
                            {!isApexTopGame && <Token color={ODDS_COLOR.HOME}>1</Token>}
                            <Value color={isApexTopGame ? ODDS_COLOR.HOME : undefined} marginRight={4}>
                                {isApexTopGame ? t('common.yes') : market?.homeTeam}:
                            </Value>
                            <Value>{balances?.home}</Value>
                            <AlternateValue>
                                (${' '}
                                {(market?.resolved && !market?.cancelled && market.finalResult - 1 == Position.HOME
                                    ? 1 * (balances?.home || 0)
                                    : market?.cancelled
                                    ? (oddsOnCancellation?.home || 0) * (balances?.home || 0)
                                    : (market?.positions[Position.HOME].sides[Side.SELL].odd || 0) *
                                      (balances?.home || 0)
                                ).toFixed(2)}
                                )
                            </AlternateValue>
                        </FlexDivCentered>
                    )}
                    {!!balances?.draw && (
                        <FlexDivCentered>
                            <Token color={ODDS_COLOR.DRAW}>X</Token>
                            <Value>
                                {t('markets.market-card.draw')}: {balances?.draw}
                            </Value>
                            <AlternateValue>
                                (${' '}
                                {(market?.resolved && !market?.cancelled && market.finalResult - 1 == Position.DRAW
                                    ? 1 * (balances?.draw || 0)
                                    : market?.cancelled
                                    ? (oddsOnCancellation?.draw || 0) * (balances?.draw || 0)
                                    : (market?.positions[Position.DRAW].sides[Side.SELL].odd || 0) *
                                      (balances?.draw || 0)
                                ).toFixed(2)}
                                )
                            </AlternateValue>
                        </FlexDivCentered>
                    )}
                    {!!balances?.away && (
                        <FlexDivCentered>
                            {!isApexTopGame && <Token color={ODDS_COLOR.AWAY}>2</Token>}
                            <Value color={isApexTopGame ? ODDS_COLOR.AWAY : undefined} marginRight={4}>
                                {isApexTopGame ? t('common.no') : market?.awayTeam}:
                            </Value>
                            <Value>{balances?.away}</Value>
                            <AlternateValue>
                                (${' '}
                                {(market?.resolved && !market?.cancelled && market.finalResult - 1 == Position.AWAY
                                    ? 1 * (balances?.away || 0)
                                    : market?.cancelled
                                    ? (oddsOnCancellation?.away || 0) * (balances?.away || 0)
                                    : (market?.positions[Position.AWAY].sides[Side.SELL].odd || 0) *
                                      (balances?.away || 0)
                                ).toFixed(2)}
                                )
                            </AlternateValue>
                        </FlexDivCentered>
                    )}
                </ValueContainer>
            </TokenInfo>
        </WalletInfoContainer>
    );
};

export default WalletInfo;
