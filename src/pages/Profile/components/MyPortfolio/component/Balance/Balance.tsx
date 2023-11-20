import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId, getWalletAddress, getIsWalletConnected } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { getCollaterals } from 'utils/collaterals';
import { formatCurrency } from 'utils/formatters/number';

const Balance: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    return (
        <Wrapper>
            <Heading>{t('my-portfolio.estimated-balance')}</Heading>
            <BalanceAmount>{'$ 304.76'}</BalanceAmount>
            <hr />
            {getCollaterals(networkId, true).map((token, index) => {
                return (
                    <CollateralItem key={index}>
                        <CollateralName>
                            <TokenIcon className={`currency-icon currency-icon--${token.toLowerCase()}`} />
                            {token}
                        </CollateralName>
                        <TokenBalance>
                            {multipleCollateralBalances.data
                                ? formatCurrency(multipleCollateralBalances.data[token])
                                : 0}
                        </TokenBalance>
                        <Deposit>{'Deposit'}</Deposit>
                        <Withdraw>{'Withdraw'}</Withdraw>
                    </CollateralItem>
                );
            })}
        </Wrapper>
    );
};

const Wrapper = styled(FlexDiv)`
    flex-direction: column;
    width: 100%;
    background-color: ${(props) => props.theme.oddsContainerBackground.secondary};
    padding: 20px 27px;
    margin-top: 10px;
`;

const Heading = styled.h2`
    font-weight: 700;
    font-size: 12px;
    text-transform: capitalize;
    letter-spacing: 3.5px;
`;

const BalanceAmount = styled.span`
    font-size: 32px;
    font-weight: 700;
    line-height: 33.54px;
    margin: 5px 0px;
`;

const CollateralItem = styled(FlexDiv)`
    flex-direction: row;
    width: 100%;
    border-bottom: 1px ${(props) => props.theme.borderColor.primary} dotted;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0px;
`;

const CollateralName = styled(FlexDiv)`
    font-size: 12px;
    letter-spacing: 3.5px;
    align-items: center;
    width: 25%;
    justify-content: flex-start;
`;

const TokenIcon = styled.i`
    font-size: 20px;
    margin-right: 12px;
`;

const TokenBalance = styled(FlexDiv)`
    font-size: 12px;
    font-weight: 700;
    width: 25%;
    text-align: right;
`;

const Deposit = styled.span`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
`;

const Withdraw = styled(Deposit)`
    color: ${(props) => props.theme.textColor.primary};
`;

export default Balance;
