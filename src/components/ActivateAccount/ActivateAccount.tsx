import styled from 'styled-components';
import { Colors } from 'styles/common';
import Zebra from 'assets/images/overtime-zebra.svg?react';
import { activateOvertimeAccount } from 'utils/biconomy';
import { useAccount, useChainId, useClient } from 'wagmi';
import { useEffect, useMemo, useState } from 'react';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import biconomyConnector from 'utils/biconomyWallet';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { getCollateralAddress, getCollateralIndex, getCollaterals } from 'utils/collaterals';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { Coins, localStore } from 'thales-utils';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { waitForTransactionReceipt } from 'viem/actions';
import { Client } from 'viem';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import FundModal from 'components/FundOvertimeAccountModal';
import { RootState } from 'types/redux';
import { Rates } from 'types/collateral';

const ActivateAccount: React.FC<any> = () => {
    const networkId = useChainId();
    const { t } = useTranslation();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const [showSuccessfulDepositModal, setShowSuccessfulDepositModal] = useState<boolean>(false);
    const [showFundModal, setShowFundModal] = useState<boolean>(false);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        walletAddress,
        { networkId, client },
        {
            enabled: isBiconomy,
            refetchInterval: 3000,
        }
    );

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const totalBalanceValue = useMemo(() => {
        let total = 0;
        try {
            if (exchangeRates && multipleCollateralBalances.data) {
                let max = { value: 0, coin: '' };
                getCollaterals(networkId).forEach((token) => {
                    const balance =
                        multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                    if (balance > max.value) {
                        max = { value: balance, coin: token };
                    }
                    total += multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                });
                return { total, max };
            }
            return undefined;
        } catch (e) {
            return undefined;
        }
    }, [exchangeRates, multipleCollateralBalances.data, networkId]);

    useEffect(() => {
        if (isConnected && isBiconomy) {
            if (totalBalanceValue?.total === undefined) {
                return;
            }
            if (totalBalanceValue && totalBalanceValue?.total > 3) {
                setShowFundModal(false);

                const storedMapString: any = localStore.get(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId]);

                if (storedMapString) {
                    const retrievedMap = new Map(JSON.parse(storedMapString));
                    const sessionData = retrievedMap.get(biconomyConnector.address) as any;
                    if (sessionData) {
                        const dateUntilValid = new Date(Number(sessionData.validUntil) * 1000);
                        const nowDate = new Date();
                        if (Number(nowDate) > Number(dateUntilValid)) {
                            setShowSuccessfulDepositModal(true);
                        } else {
                            setShowSuccessfulDepositModal(false);
                        }
                    } else {
                        setShowSuccessfulDepositModal(true);
                    }
                } else {
                    setShowSuccessfulDepositModal(true);
                }
            } else {
                setShowFundModal(true);
                setShowSuccessfulDepositModal(false);
            }
        }
    }, [totalBalanceValue, networkId, isConnected, isBiconomy]);

    return (
        <div>
            {showSuccessfulDepositModal && (
                <Wrapper>
                    <StyledBalanceIcon />
                    <Header>{t('get-started.activate-account.deposit')}</Header>
                    <SubTitle>{t('get-started.activate-account.activate')}</SubTitle>
                    <Box>{t('get-started.activate-account.success')}</Box>
                    <ActivateButton
                        onClick={async () => {
                            const toastId = toast.loading(t('market.toast-message.transaction-pending'));
                            const txHash = await activateOvertimeAccount({
                                networkId,
                                collateralAddress: getCollateralAddress(
                                    networkId,
                                    getCollateralIndex(networkId, totalBalanceValue?.max.coin as Coins)
                                ),
                            });
                            if (txHash) {
                                const txReceipt = await waitForTransactionReceipt(client as Client, {
                                    hash: txHash,
                                });

                                if (txReceipt.status === 'success') {
                                    toast.update(
                                        toastId,
                                        getSuccessToastOptions(t('market.toast-message.approve-success'))
                                    );
                                    setShowSuccessfulDepositModal(false);
                                    return;
                                }
                            }
                            toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                        }}
                    >
                        {t('get-started.activate-account.activate-my-account')}
                    </ActivateButton>
                </Wrapper>
            )}

            {showFundModal && <FundModal onClose={() => setShowFundModal(false)} />}
        </div>
    );
};

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 0;
    right: -4px;
    background: ${Colors.GOLD};
    width: 480px;
    padding: 20px;
    border-radius: 16px;
    z-index: 1000;
`;

const StyledBalanceIcon = styled(Zebra)`
    text-align: center;
    height: 55px;
    width: 255px;
    path {
        fill: ${(props) => props.theme.textColor.senary};
    }
`;

const Header = styled.h2`
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 24px;
    line-height: 24px;
    font-weight: 600;
    margin-top: 13px;
    margin-bottom: 3px;
`;

const SubTitle = styled.p`
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
`;

const Box = styled.div`
    border-radius: 12px;
    border: 1px solid ${(props) => props.theme.overdrop.textColor.quaternary};
    padding: 16px 10px;
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    font-size: 14px;
    font-weight: 400;
    line-height: normal;
    text-align: left;
    margin-top: 25px;
    margin-bottom: 24px;
`;

const ActivateButton = styled.div`
    border-radius: 12px;
    background: ${(props) => props.theme.textColor.primary};
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    height: 56px;
    padding: 18px;
    width: 100%;
    cursor: pointer;
`;

export default ActivateAccount;
