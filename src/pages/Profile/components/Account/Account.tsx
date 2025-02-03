import Button from 'components/Button';
import FundModal from 'components/FundOvertimeAccountModal';
import { USD_SIGN } from 'constants/currency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsBiconomy, setIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { Colors, FlexDivCentered, FlexDivSpaceBetween } from 'styles/common';
import { formatCurrencyWithKey, localStore } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals, mapMultiCollateralBalances } from 'utils/collaterals';
import { useChainId, useClient, useAccount } from 'wagmi';
import WithdrawModal from '../WithdrawModal';
import SwapModal from 'components/SwapModal/SwapModal';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';

const Account: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const [showFundModal, setShowFundModal] = useState<boolean>(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
    const [showSwapModal, setShowSwapModal] = useState<boolean>(false);

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

    const freeBetCollateralBalancesQuery = useFreeBetCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const freeBetCollateralBalances =
        freeBetCollateralBalancesQuery?.isSuccess && freeBetCollateralBalancesQuery.data
            ? freeBetCollateralBalancesQuery?.data
            : undefined;

    const balanceList = mapMultiCollateralBalances(freeBetCollateralBalances, exchangeRates, networkId);

    const totalBalanceValue = useMemo(() => {
        let total = 0;
        try {
            if (exchangeRates && multipleCollateralBalances.data && balanceList) {
                getCollaterals(networkId).forEach((token) => {
                    total += multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                });
                balanceList.forEach((data) => (total += data.balanceDollarValue));
            }

            return total ? formatCurrencyWithKey(USD_SIGN, total, 2) : 'N/A';
        } catch (e) {
            return 'N/A';
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId, balanceList]);

    return (
        <div>
            <Box>
                <Title>{t('profile.account-summary.title')}</Title>
                <FlexDivSpaceBetween>
                    <Label>{t('profile.account-summary.balance')}</Label>
                    <Value>{totalBalanceValue}</Value>
                </FlexDivSpaceBetween>
            </Box>
            <ButtonContainer>
                <Button
                    onClick={() => setShowFundModal(true)}
                    borderColor="none"
                    height="48px"
                    width="100%"
                    lineHeight="16px"
                    backgroundColor={Colors.BLUE}
                >
                    <Icon className="icon icon--wallet2" />
                    {t('profile.account-summary.deposit')}
                </Button>
                <Button
                    onClick={() => setShowSwapModal(true)}
                    borderColor="none"
                    height="48px"
                    width="100%"
                    lineHeight="16px"
                    backgroundColor={Colors.WHITE}
                >
                    <Icon className="icon icon--exchange" />
                    {t('profile.account-summary.swap')}
                </Button>
                <Button
                    onClick={() => setShowWithdrawModal(true)}
                    borderColor="none"
                    height="48px"
                    width="100%"
                    lineHeight="16px"
                    backgroundColor={Colors.YELLOW}
                >
                    <Icon className="icon icon--logged-in" />
                    {t('profile.account-summary.withdraw')}
                </Button>
            </ButtonContainer>
            <SkipText
                onClick={() => {
                    if (isBiconomy) {
                        dispatch(setIsBiconomy(false));
                        localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, false);
                    } else {
                        dispatch(setIsBiconomy(true));
                        localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, true);
                    }
                }}
            >
                {isBiconomy ? t('profile.account-summary.use-eoa') : t('profile.account-summary.use-smart')}
            </SkipText>
            {showFundModal && <FundModal onClose={() => setShowFundModal(false)} />}
            {showWithdrawModal && <WithdrawModal onClose={() => setShowWithdrawModal(false)} />}
            {showSwapModal && <SwapModal onClose={() => setShowSwapModal(false)} />}
        </div>
    );
};

const Box = styled.div`
    border-radius: 12px;
    width: 100%;
    background: ${(props) => props.theme.background.quinary};
    padding: 24px;
    padding-bottom: 37px;
`;

const Title = styled.p`
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
`;

const Label = styled.span`
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 16px;
    font-weight: 400;
`;
const Value = styled.span`
    color: #3fffff;
    font-size: 16px;
    font-weight: 600;
`;

const ButtonContainer = styled(FlexDivCentered)`
    margin-top: 14px;
    gap: 18px;
`;

const Icon = styled.i`
    text-transform: lowercase;
    margin-right: 4px;
`;

const SkipText = styled.p`
    color: ${(props) => props.theme.textColor.quaternary};
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    margin-top: 30px;
    cursor: pointer;
`;

export default Account;
