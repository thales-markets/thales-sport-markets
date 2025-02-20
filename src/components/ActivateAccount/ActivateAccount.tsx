import Zebra from 'assets/images/overtime-zebra.svg?react';
import Button from 'components/Button';
import FundModal from 'components/FundOvertimeAccountModal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { Colors } from 'styles/common';
import { localStore } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { activateOvertimeAccount } from 'utils/biconomy';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollaterals, mapMultiCollateralBalances } from 'utils/collaterals';
import { isSmallDevice } from 'utils/device';
import { getFundModalShown, setFundModalShown } from 'utils/fundModal';
import { Client } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';

const ActivateAccount: React.FC<any> = () => {
    const networkId = useChainId();
    const { t } = useTranslation();
    const theme = useTheme();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const client = useClient();
    const { data: walletClient } = useWalletClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const [showSuccessfulDepositModal, setShowSuccessfulDepositModal] = useState<boolean>(false);
    const [isMinimizedModal, setIsMinimized] = useState<boolean>(false);
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
        if (!walletAddress || exchangeRates === null || !multipleCollateralBalances.isSuccess) {
            return undefined;
        }
        let total = 0;
        try {
            if (exchangeRates && multipleCollateralBalances.data && balanceList) {
                let max = { value: 0, coin: '' };
                getCollaterals(networkId).forEach((token) => {
                    const balance =
                        multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                    if (balance > max.value) {
                        max = { value: balance, coin: token };
                    }
                    total += multipleCollateralBalances.data[token] * (exchangeRates[token] ? exchangeRates[token] : 1);
                });
                balanceList.forEach((data) => (total += data.balanceDollarValue));
                return { total, max };
            }
            return undefined;
        } catch (e) {
            return undefined;
        }
    }, [
        exchangeRates,
        multipleCollateralBalances.data,
        multipleCollateralBalances.isSuccess,
        networkId,
        walletAddress,
        balanceList,
    ]);

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
            } else if (getFundModalShown()) {
                setShowFundModal(true);
                setShowSuccessfulDepositModal(false);
                setFundModalShown(false);
            }
        }
    }, [totalBalanceValue, networkId, isConnected, isBiconomy]);

    return (
        <>
            {showSuccessfulDepositModal && (
                <Wrapper show={!isMinimizedModal}>
                    {!isMinimizedModal ? (
                        <>
                            <MinimizeIcon onClick={() => setIsMinimized(true)}> - </MinimizeIcon>
                            <StyledBalanceIcon />
                            <Header>{t('get-started.activate-account.deposit')}</Header>
                            <SubTitle>{t('get-started.activate-account.activate')}</SubTitle>
                            <Box>{t('get-started.activate-account.success')}</Box>
                            <ActivateButton
                                onClick={async () => {
                                    const toastId = toast.loading(t('market.toast-message.transaction-pending'));
                                    console.log('walletClient: ', walletClient);
                                    const txHash = await activateOvertimeAccount({ walletClient, networkId });
                                    console.log('pls: ', txHash);
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
                                    toast.update(
                                        toastId,
                                        getErrorToastOptions(t('common.errors.unknown-error-try-again'))
                                    );
                                }}
                            >
                                {t('get-started.activate-account.activate-my-account')}
                            </ActivateButton>
                        </>
                    ) : (
                        <>
                            <Button
                                backgroundColor={theme.button.background.quinary}
                                textColor={theme.button.textColor.primary}
                                borderColor={theme.button.borderColor.quinary}
                                additionalStyles={{
                                    borderRadius: '22px',
                                    fontWeight: '800',
                                    fontSize: '12px',
                                    padding: '9px 20px',
                                    width: isSmallDevice ? '100%' : '100px',
                                    height: '30px',
                                }}
                                onClick={() => setIsMinimized(false)}
                            >
                                Activate
                            </Button>
                        </>
                    )}
                </Wrapper>
            )}

            {showFundModal && <FundModal onClose={() => setShowFundModal(false)} />}
        </>
    );
};

const Wrapper = styled.div<{ show: boolean }>`
    position: absolute;
    top: 0;
    right: -4px;

    display: flex;
    flex-direction: column;
    align-items: center;

    background: ${Colors.GOLD};
    width: 480px;
    padding: 20px;
    border-radius: 16px;

    @media (max-width: 512px) {
        width: auto;
    }

    ${(props) =>
        props.show
            ? `
      
                 z-index: 1000;
               
    `
            : `
            width: 100px;
            height: 30px;
            padding: 0;
            transform: translateX(-390px);
            transition: height 0.1s ease-out, padding 0.1s ease-out, width 0.1s ease-out,  transform 0.1s ease-in-out;
            @media (max-width: 950px) {
                position: relative;
                transform: translateX(0);
                width: 100%;
                transition: none;
            }
   
    `}
`;

const MinimizeIcon = styled.p`
    position: absolute;
    top: 10px;
    left: 20px;
    font-size: 54px;
    line-height: 10px;
    color: black;
    cursor: pointer;
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
