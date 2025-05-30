import Button from 'components/Button';
import FundModal from 'components/FundOvertimeAccountModal';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import localforage from 'localforage';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useFreeBetCollateralBalanceQuery from 'queries/wallet/useFreeBetCollateralBalanceQuery';
import useMultipleCollateralBalanceQuery from 'queries/wallet/useMultipleCollateralBalanceQuery';
import queryString from 'query-string';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivRow } from 'styles/common';
import { Coins } from 'thales-utils';
import { Rates } from 'types/collateral';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import {
    getCollateralAddress,
    getCollateralIndex,
    getCollaterals,
    mapMultiCollateralBalances,
} from 'utils/collaterals';
import { isSmallDevice } from 'utils/device';
import { getFreeBetModalShown } from 'utils/freeBet';
import { getFundModalShown, setFundModalShown } from 'utils/fundModal';
import { activateOvertimeAccount } from 'utils/smartAccount/biconomy/session';
import smartAccountConnector from 'utils/smartAccount/smartAccountConnector';
import { Client } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient } from 'wagmi';

const ActivateAccount: React.FC<any> = () => {
    const networkId = useChainId();
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const client = useClient();
    const { address, isConnected } = useAccount();
    const smartAddress = smartAccountConnector.biconomyAddress;
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const queryParams: { freeBet?: string } = queryString.parse(location.search);

    const [showActivateAccount, setShowActivateAccount] = useState<boolean>(false);
    const [isMinimizedModal, setIsMinimized] = useState<boolean>(true);
    const [showFundModal, setShowFundModal] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (isConnected && isBiconomy && !queryParams.freeBet) {
            if (totalBalanceValue?.total === undefined || getFreeBetModalShown()) {
                return;
            }
            if (totalBalanceValue && totalBalanceValue?.total > 3) {
                setShowFundModal(false);

                localforage.getItem(LOCAL_STORAGE_KEYS.SESSION_P_KEY[networkId]).then((retrievedMap: any) => {
                    if (retrievedMap) {
                        const sessionData = retrievedMap.get(smartAddress) as any;
                        if (sessionData) {
                            setShowActivateAccount(false);
                        } else {
                            setShowActivateAccount(true);
                        }
                    } else {
                        setShowActivateAccount(true);
                    }
                });
            } else if (getFundModalShown()) {
                setShowFundModal(true);
                setShowActivateAccount(false);
                setFundModalShown(false);
            }
        }
    }, [totalBalanceValue, networkId, isConnected, isBiconomy, smartAddress, queryParams.freeBet]);

    return (
        <>
            {showActivateAccount && (
                <Container show={!isMinimizedModal}>
                    <Wrapper show={!isMinimizedModal}>
                        {!isMinimizedModal ? (
                            <>
                                <FlexDivRow>{<CloseIcon onClick={() => setIsMinimized(true)} />}</FlexDivRow>
                                <LogoIcon className="icon icon--overtime" />
                                <SubTitle>{t('get-started.activate-account.activate')}</SubTitle>
                                <Box>{t('get-started.activate-account.success')}</Box>
                                <ActivateButton
                                    onClick={async () => {
                                        setIsSubmitting(true);
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
                                                hash: txHash as any,
                                            });

                                            if (txReceipt.status === 'success') {
                                                toast.update(
                                                    toastId,
                                                    getSuccessToastOptions(t('market.toast-message.approve-success'))
                                                );
                                                setShowActivateAccount(false);
                                                setIsSubmitting(false);
                                                return;
                                            }
                                        }
                                        toast.update(
                                            toastId,
                                            getErrorToastOptions(t('common.errors.unknown-error-try-again'))
                                        );
                                        setIsSubmitting(false);
                                    }}
                                >
                                    {isSubmitting
                                        ? t('get-started.activate-account.activate-progress')
                                        : t('get-started.activate-account.activate-my-account')}
                                </ActivateButton>
                            </>
                        ) : (
                            <>
                                <Button
                                    backgroundColor={theme.button.background.quinary}
                                    textColor={theme.button.textColor.primary}
                                    borderColor={theme.button.borderColor.quinary}
                                    additionalStyles={{
                                        borderRadius: '8px',
                                        fontWeight: '800',
                                        fontSize: '12px',
                                        padding: '9px 20px',
                                        width: isSmallDevice ? '100%' : '100px',
                                        height: '30px',
                                        zIndex: 100,
                                    }}
                                    onClick={() => setIsMinimized(false)}
                                >
                                    {t('get-started.activate-account.action')}
                                </Button>
                            </>
                        )}
                    </Wrapper>
                </Container>
            )}
            {showFundModal && (
                <Container>
                    <FundModal onClose={() => setShowFundModal(false)} />
                </Container>
            )}
        </>
    );
};

const Container = styled.div<{ show?: boolean }>`
    position: relative;
    width: 100px;
    height: 30px;
    margin-left: 5px;

    @media (max-width: 512px) {
        width: 100%;
        height: unset;
        margin-left: 0;
        z-index: ${(props) => (props.show ? 100 : 9)};
    }
`;

const Wrapper = styled.div<{ show: boolean }>`
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;

    background: ${(props) => props.theme.button.background.quinary};
    width: 480px;
    padding: 20px;
    border-radius: 8px;

    @media (max-width: 512px) {
        width: auto;
    }

    ${(props) =>
        props.show
            ? `
      
                    z-index: 1000;
                    position: absolute;
                    top: 0;
                    right: 0;
               
    `
            : `
            width: 100px;
            height: 30px;
            padding: 0;
         
   
            @media (max-width: 950px) {
                position: relative;
                transform: translateX(0);
                width: 100%;
                transition: none;
                margin-top: 10px;
            }
   
    `}
`;

const SubTitle = styled.p`
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
    @media (max-width: 575px) {
        font-size: 14px;
    }
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
    @media (max-width: 575px) {
        width: 100%;
        padding: 10px;
    }
`;

const ActivateButton = styled.div`
    border-radius: 8px;
    background: ${(props) => props.theme.textColor.primary};
    color: ${(props) => props.theme.overdrop.textColor.quaternary};
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    height: 44px;
    padding: 14px;
    width: 100%;
    user-select: none;
    cursor: pointer;
    text-transform: uppercase;
`;

const LogoIcon = styled.i`
    font-size: 250px;
    line-height: 56px;
    color: ${(props) => props.theme.textColor.senary};
    @media (max-width: 575px) {
        font-size: 200px;
        line-height: 48px;
    }
`;

const CloseIcon = styled.i.attrs({ className: 'icon icon--close' })`
    color: ${(props) => props.theme.textColor.senary};
    font-size: 14px;
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
`;

export default ActivateAccount;
