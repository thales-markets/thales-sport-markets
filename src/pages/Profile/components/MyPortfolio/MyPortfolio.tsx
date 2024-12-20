import SPAAnchor from 'components/SPAAnchor';
import { USD_SIGN } from 'constants/currency';
import i18n from 'i18n';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { formatCurrency, formatCurrencyWithSign } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals } from 'utils/collaterals';
import { buildDepositOrWithdrawLink } from 'utils/routes';
import { useAccount, useChainId, useClient } from 'wagmi';

const MyPortfolio: React.FC = () => {
    const { t } = useTranslation();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const language = i18n.language;

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

    return (
        <Wrapper>
            <Heading>{t('my-portfolio.estimated-balance')}</Heading>
            <BalanceAmount>{formatCurrencyWithSign(USD_SIGN, totalBalanceValue)}</BalanceAmount>
            <Divider />
            {getCollaterals(networkId).map((token, index) => {
                const decimalsForTokenAmount = exchangeRates?.[token] ? (exchangeRates?.[token] > 1000 ? 4 : 2) : 2;

                return (
                    <CollateralItem key={index}>
                        <CollateralName>
                            <TokenIcon className={`currency-icon currency-icon--${token.toLowerCase()}`} />
                            {token}
                        </CollateralName>
                        <TokenBalance>
                            {multipleCollateralBalances.data
                                ? formatCurrency(multipleCollateralBalances.data[token], decimalsForTokenAmount)
                                : 0}{' '}
                            {token}
                            {exchangeRates && multipleCollateralBalances.data && !isMobile
                                ? ` ( $ ${formatCurrency(
                                      multipleCollateralBalances.data[token] * exchangeRates[token]
                                  )})`
                                : ``}
                        </TokenBalance>
                        <SPAAnchor href={buildDepositOrWithdrawLink(language, 'deposit', index)}>
                            <Deposit>{t('my-portfolio.deposit')}</Deposit>
                        </SPAAnchor>
                        <SPAAnchor href={buildDepositOrWithdrawLink(language, 'withdraw', index)}>
                            <Withdraw>{t('my-portfolio.withdraw')}</Withdraw>
                        </SPAAnchor>
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
`;

const Divider = styled.hr`
    width: 100%;
    border-bottom: 2px ${(props) => props.theme.borderColor.primary} solid;
`;

const Heading = styled.h2`
    font-weight: 600;
    font-size: 12px;
    text-transform: capitalize;
    letter-spacing: 3.5px;
`;

const BalanceAmount = styled.span`
    font-size: 32px;
    font-weight: 600;
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
    width: 20%;
    justify-content: flex-start;
    @media (max-width: 575px) {
        font-size: 10px;
    }
`;

const TokenIcon = styled.i`
    font-size: 20px;
    margin-right: 12px;
`;

const TokenBalance = styled(FlexDiv)`
    font-size: 12px;
    font-weight: 600;
    width: 25%;
    text-align: right;
    justify-content: flex-end;
    @media (max-width: 575px) {
        font-size: 10px;
    }
`;

const Deposit = styled.span`
    color: ${(props) => props.theme.christmasTheme.textColor.primary};
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 600;
    cursor: pointer;
    @media (max-width: 575px) {
        font-size: 10px;
    }
`;

const Withdraw = styled(Deposit)`
    color: ${(props) => props.theme.textColor.primary};
`;

export default MyPortfolio;
