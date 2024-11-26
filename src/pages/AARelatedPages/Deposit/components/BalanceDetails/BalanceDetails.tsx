import { USD_SIGN } from 'constants/currency';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv, FlexDivEnd } from 'styles/common';
import { Coins, formatCurrency, formatCurrencyWithSign } from 'thales-utils';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals, isStableCurrency } from 'utils/collaterals';
import { useAccount, useChainId, useClient } from 'wagmi';

const BalanceDetails: React.FC = () => {
    const { t } = useTranslation();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });

    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const totalBalanceValue = useMemo(() => {
        let total = 0;
        try {
            if (exchangeRates && multipleCollateralBalances.data) {
                getCollaterals(networkId).forEach((token) => {
                    total += multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                });
            }

            return total ? total : 'N/A';
        } catch (e) {
            return 'N/A';
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId]);

    const getUSDForCollateral = useCallback(
        (token: Coins) =>
            (multipleCollateralBalances.data ? multipleCollateralBalances.data[token] : 0) *
            (isStableCurrency(token as Coins) ? 1 : exchangeRates?.[token] || 0),
        [multipleCollateralBalances, exchangeRates]
    );

    return (
        <BalanceWrapper>
            <SectionLabel>{t('my-portfolio.estimated-balance')}</SectionLabel>
            <TotalBalance>{formatCurrencyWithSign(USD_SIGN, totalBalanceValue)}</TotalBalance>
            <TokenBalancesWrapper>
                {getCollaterals(networkId)
                    .sort((a, b) => {
                        return getUSDForCollateral(b) - getUSDForCollateral(a);
                    })
                    .map((token, index) => {
                        const decimalsForTokenAmount = exchangeRates?.[token]
                            ? exchangeRates?.[token] > 1000
                                ? 4
                                : 2
                            : 2;

                        return (
                            <IndividualTokenBalanceWrapper key={`ind-token-${index}`}>
                                <Token>
                                    <TokenIcon className={`currency-icon currency-icon--${token.toLowerCase()}`} />
                                    {token}
                                </Token>
                                <RightTokenBalanceWrapper>
                                    <IndividualTokenBalance>
                                        {multipleCollateralBalances.data
                                            ? formatCurrency(
                                                  multipleCollateralBalances.data[token],
                                                  decimalsForTokenAmount
                                              )
                                            : 0}
                                    </IndividualTokenBalance>
                                    <IndividualTokenBalance>
                                        {!exchangeRates?.[token] && !isStableCurrency(token as Coins)
                                            ? '...'
                                            : ` (${formatCurrencyWithSign(
                                                  USD_SIGN,
                                                  getUSDForCollateral(token as Coins),
                                                  2
                                              )})`}
                                    </IndividualTokenBalance>
                                </RightTokenBalanceWrapper>
                            </IndividualTokenBalanceWrapper>
                        );
                    })}
            </TokenBalancesWrapper>
        </BalanceWrapper>
    );
};

const BalanceWrapper = styled(FlexDiv)`
    flex-direction: column;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
    border-radius: 5px;
    padding: 19px;
    margin-bottom: 20px;
    background-color: ${(props) => props.theme.connectWalletModal.totalBalanceBackground};
`;

const SectionLabel = styled.span`
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
    letter-spacing: 3px;
    margin-bottom: 13px;
`;

const TotalBalance = styled.span`
    font-size: 42px;
    font-weight: 600;
    width: 100%;
    border-bottom: 1px ${(props) => props.theme.borderColor.primary} solid;
    margin-bottom: 20px;
    padding-bottom: 20px;
`;

const TokenBalancesWrapper = styled(FlexDiv)`
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
`;

const IndividualTokenBalanceWrapper = styled(FlexDiv)`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    min-width: 150px;
    margin-right: 10px;
    @media (max-width: 575px) {
        margin-right: 10px;
    }
`;

const Token = styled(FlexDiv)`
    font-weight: 600;
    align-items: center;
    font-size: 12px;
`;

const TokenIcon = styled.i`
    font-size: 20px;
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.primary};
    font-weight: 400;
`;

const IndividualTokenBalance = styled.span`
    font-size: 12px;
    font-weight: 600;
    text-align: right;
`;

const RightTokenBalanceWrapper = styled(FlexDivEnd)`
    gap: 4px;
`;

export default BalanceDetails;
