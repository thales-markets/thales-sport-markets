import PositionSymbol from 'components/PositionSymbol';
import useMarketBalancesQuery from 'queries/markets/useMarketBalancesQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { Balances, MarketData, PositionType } from 'types/markets';
import { convertPositionNameToPosition, convertPositionNameToPositionType, getSymbolText } from 'utils/markets';
import { Label, PositionItemContainer, Wrapper } from './styled-components';

type PositionInfoPropsType = {
    market: MarketData;
};

const PositionInfo: React.FC<PositionInfoPropsType> = ({ market }) => {
    const { t } = useTranslation();
    const [balances, setBalances] = useState<Balances | undefined>(undefined);

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const marketBalancesQuery = useMarketBalancesQuery(market.address, walletAddress, {
        enabled: !!market.address && isWalletConnected,
    });

    useEffect(() => {
        if (marketBalancesQuery.isSuccess && marketBalancesQuery.data) {
            setBalances(marketBalancesQuery.data);
        }
    }, [marketBalancesQuery.isSuccess, marketBalancesQuery.data]);

    const balancesObjectKeys = Object.keys(balances ? balances : {});
    const showPositionInfo = balances && (balances.home > 0 || balances.draw > 0 || balances.away > 0);

    return showPositionInfo ? (
        <Wrapper>
            <>
                <Label>{t('common.wallet.wallet-info')}:</Label>
                {balancesObjectKeys &&
                    balancesObjectKeys.map((item, index) => {
                        if (balances && balances[item as PositionType] && balances[item as PositionType] > 0) {
                            return (
                                <PositionItemContainer key={index}>
                                    <PositionSymbol
                                        type={convertPositionNameToPosition(item)}
                                        symbolText={getSymbolText(
                                            convertPositionNameToPositionType(item),
                                            market.betType
                                        )}
                                    />
                                </PositionItemContainer>
                            );
                        }
                    })}
            </>
        </Wrapper>
    ) : (
        <></>
    );
};

export default PositionInfo;
