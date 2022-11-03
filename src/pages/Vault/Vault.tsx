import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import BackToLink from 'pages/Markets/components/BackToLink';
import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import {
    Container,
    Title,
    SubmitButton,
    ButtonContainer,
    ValidationTooltip,
    InputLabel,
    InputContainer,
    Wrapper,
    TabContainer,
    Tab,
    Description,
    VaultFilledGraphicContainer,
    VaultFilledGraphicPercentage,
    VaultFilledText,
    RoundInfoWrapper,
    RoundInfoContainer,
    RoundInfoLabel,
    RoundInfo,
    LeftContainer,
    RightContainer,
    ContentInfoContainer,
    ContentInfo,
    BoldContent,
    WarningContentInfo,
    CloseRoundButton,
    LoaderContainer,
} from './styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import SPAAnchor from 'components/SPAAnchor';
import { Info } from 'pages/Markets/Home/Home';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { VaultTab } from 'constants/vault';
import NumericInput from 'components/fields/NumericInput';
import { getIsAppReady } from 'redux/modules/app';
import { UserVaultData, VaultData } from 'types/vault';
import useVaultDataQuery from 'queries/vault/useVaultDataQuery';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { PAYMENT_CURRENCY, USD_SIGN } from 'constants/currency';
import TimeRemaining from 'components/TimeRemaining';
import useUserVaultDataQuery from 'queries/vault/useUserVaultDataQuery';
import networkConnector from 'utils/networkConnector';
import { MAX_GAS_LIMIT } from 'constants/network';
import { toast } from 'react-toastify';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import ApprovalModal from 'components/ApprovalModal';
import { checkAllowance } from 'utils/network';
import { BigNumber, ethers } from 'ethers';
import useSUSDWalletBalance from 'queries/wallet/usesUSDWalletBalance';
import SimpleLoader from 'components/SimpleLoader';
import TradesHistory from './TradesHistory';
import PnL from './PnL';

const Vault: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const [amount, setAmount] = useState<number | string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<VaultTab>(VaultTab.DEPOSIT);
    const [paymentTokenBalance, setPaymentTokenBalance] = useState<number | string>('');

    const tabContent: Array<{
        id: VaultTab;
        name: string;
    }> = useMemo(
        () => [
            {
                id: VaultTab.DEPOSIT,
                name: t(`vault.tabs.${VaultTab.DEPOSIT}`),
            },
            {
                id: VaultTab.WITHDRAW,
                name: t(`vault.tabs.${VaultTab.WITHDRAW}`),
            },
        ],
        [t]
    );

    const { openConnectModal } = useConnectModal();

    const paymentTokenBalanceQuery = useSUSDWalletBalance(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (paymentTokenBalanceQuery.isSuccess && paymentTokenBalanceQuery.data !== undefined) {
            setPaymentTokenBalance(Number(paymentTokenBalanceQuery.data));
        }
    }, [paymentTokenBalanceQuery.isSuccess, paymentTokenBalanceQuery.data]);

    const vaultDataQuery = useVaultDataQuery(networkId, {
        enabled: isAppReady,
    });
    const vaultData: VaultData | undefined = useMemo(() => {
        if (vaultDataQuery.isSuccess && vaultDataQuery.data) {
            return vaultDataQuery.data;
        }
        return undefined;
    }, [vaultDataQuery.isSuccess, vaultDataQuery.data]);

    const userVaultDataQuery = useUserVaultDataQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });
    const userVaultData: UserVaultData | undefined = useMemo(() => {
        if (userVaultDataQuery.isSuccess && userVaultDataQuery.data) {
            return userVaultDataQuery.data;
        }
        return undefined;
    }, [userVaultDataQuery.isSuccess, userVaultDataQuery.data]);

    const isAmountEntered = Number(amount) > 0;
    const insufficientBalance =
        (Number(paymentTokenBalance) < Number(amount) || Number(paymentTokenBalance) === 0) && isWalletConnected;
    const exceededVaultCap = vaultData && vaultData.availableAllocationNextRound < Number(amount);
    const isWithdrawalRequested = userVaultData && userVaultData.isWithdrawalRequested;
    const nothingToWithdraw = userVaultData && userVaultData.balanceCurrentRound === 0;
    const isMaximumAmountOfUsersReached =
        vaultData &&
        vaultData.usersCurrentlyInVault === vaultData.maxAllowedUsers &&
        userVaultData &&
        !userVaultData.hasDepositForCurrentRound &&
        !userVaultData.hasDepositForNextRound;
    const invalidAmount = vaultData && Number(vaultData.minDepositAmount) > Number(amount) && isAmountEntered;

    const isRequestWithdrawalButtonDisabled =
        !isWalletConnected ||
        isSubmitting ||
        nothingToWithdraw ||
        (userVaultData && userVaultData.hasDepositForNextRound);

    const isDepositButtonDisabled =
        !isWalletConnected ||
        !isAmountEntered ||
        insufficientBalance ||
        isSubmitting ||
        isWithdrawalRequested ||
        exceededVaultCap ||
        isMaximumAmountOfUsersReached ||
        invalidAmount;

    useEffect(() => {
        const { signer, sUSDContract, sportVaultContract } = networkConnector;
        if (signer && sUSDContract && sportVaultContract) {
            const addressToApprove = sportVaultContract.address;
            const sUSDContractWithSigner = sUSDContract.connect(signer);
            const getAllowance = async () => {
                try {
                    const parsedAmount = ethers.utils.parseEther(Number(amount).toString());
                    const allowance = await checkAllowance(
                        parsedAmount,
                        sUSDContractWithSigner,
                        walletAddress,
                        addressToApprove
                    );
                    setAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            };
            if (isWalletConnected) {
                getAllowance();
            }
        }
    }, [walletAddress, isWalletConnected, hasAllowance, amount, isAllowing]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { signer, sUSDContract, sportVaultContract } = networkConnector;
        if (signer && sUSDContract && sportVaultContract) {
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            setIsAllowing(true);

            try {
                const addressToApprove = sportVaultContract.address;
                const sUSDContractWithSigner = sUSDContract.connect(signer);

                const tx = (await sUSDContractWithSigner.approve(addressToApprove, approveAmount, {
                    gasLimit: MAX_GAS_LIMIT,
                })) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(
                        id,
                        getSuccessToastOptions(t('market.toast-messsage.approve-success', { token: PAYMENT_CURRENCY }))
                    );
                    setIsAllowing(false);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsAllowing(false);
            }
        }
    };

    const handleDeposit = async () => {
        const { sportVaultContract, signer } = networkConnector;
        if (sportVaultContract && signer) {
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            setIsSubmitting(true);
            try {
                const sportVaultContractWithSigner = sportVaultContract.connect(signer);
                const parsedAmount = ethers.utils.parseEther(Number(amount).toString());

                const tx = await sportVaultContractWithSigner.deposit(parsedAmount, {
                    gasLimit: MAX_GAS_LIMIT,
                });
                const txResult = await tx.wait();

                if (txResult && txResult.events) {
                    toast.update(id, getSuccessToastOptions(t('vault.button.deposit-confirmation-message')));
                    setAmount('');
                    setIsSubmitting(false);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    const handleWithdrawalRequest = async () => {
        const { sportVaultContract, signer } = networkConnector;
        if (sportVaultContract && signer) {
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            setIsSubmitting(true);
            try {
                const sportVaultContractWithSigner = sportVaultContract.connect(signer);

                const tx = await sportVaultContractWithSigner.withdrawalRequest({
                    gasLimit: MAX_GAS_LIMIT,
                });
                const txResult = await tx.wait();

                if (txResult && txResult.events) {
                    toast.update(id, getSuccessToastOptions(t('vault.button.request-withdrawal-confirmation-message')));
                    setAmount('');
                    setIsSubmitting(false);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    const closeRound = async () => {
        const { sportVaultContract, signer } = networkConnector;
        if (sportVaultContract && signer) {
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            setIsSubmitting(true);
            try {
                const sportVaultContractWithSigner = sportVaultContract.connect(signer);

                const tx = await sportVaultContractWithSigner.closeRound({
                    gasLimit: MAX_GAS_LIMIT,
                });
                const txResult = await tx.wait();

                if (txResult && txResult.events) {
                    toast.update(id, getSuccessToastOptions(t('vault.button.close-round-confirmation-message')));
                    setIsSubmitting(false);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    const getDepositSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <SubmitButton onClick={() => openConnectModal?.()}>
                    {t('common.wallet.connect-your-wallet')}
                </SubmitButton>
            );
        }
        if (insufficientBalance) {
            return <SubmitButton disabled={true}>{t(`common.errors.insufficient-balance`)}</SubmitButton>;
        }
        if (!isAmountEntered) {
            return <SubmitButton disabled={true}>{t(`common.errors.enter-amount`)}</SubmitButton>;
        }
        if (!hasAllowance) {
            return (
                <SubmitButton disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                    {!isAllowing
                        ? t('common.enable-wallet-access.approve-label', { currencyKey: PAYMENT_CURRENCY })
                        : t('common.enable-wallet-access.approve-progress-label', {
                              currencyKey: PAYMENT_CURRENCY,
                          })}
                </SubmitButton>
            );
        }
        return (
            <SubmitButton disabled={isDepositButtonDisabled} onClick={handleDeposit}>
                {!isSubmitting ? t('vault.button.deposit-label') : t('vault.button.deposit-progress-label')}
            </SubmitButton>
        );
    };

    const getWithdrawSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <SubmitButton onClick={() => openConnectModal?.()}>
                    {t('common.wallet.connect-your-wallet')}
                </SubmitButton>
            );
        }
        return (
            <SubmitButton disabled={isRequestWithdrawalButtonDisabled} onClick={handleWithdrawalRequest}>
                {t('vault.button.request-withdrawal-label')}
            </SubmitButton>
        );
    };

    return (
        <Wrapper>
            <Info>
                <Trans
                    i18nKey="rewards.op-rewards-banner-message"
                    components={{
                        bold: <SPAAnchor href={buildHref(ROUTES.Rewards)} />,
                    }}
                />
            </Info>
            <BackToLink link={buildHref(ROUTES.Markets.Home)} text={t('market.back-to-markets')} />
            <Title>{t('vault.title')}</Title>
            <Container>
                <LeftContainer>
                    {vaultData && (
                        <>
                            <RoundInfoWrapper>
                                {vaultData.vaultStarted ? (
                                    <>
                                        <RoundInfoContainer>
                                            <RoundInfoLabel>{t('vault.round-allocation-label')}:</RoundInfoLabel>
                                            <RoundInfo>
                                                {formatCurrencyWithSign(USD_SIGN, vaultData.allocationCurrentRound)}
                                            </RoundInfo>
                                        </RoundInfoContainer>
                                        <RoundInfoContainer>
                                            <RoundInfoLabel>{t('vault.round-end-label')}:</RoundInfoLabel>
                                            <RoundInfo>
                                                {vaultData.isRoundEnded ? (
                                                    t('vault.round-ended-label')
                                                ) : (
                                                    <TimeRemaining
                                                        end={vaultData.roundEndTime}
                                                        fontSize={20}
                                                        showFullCounter
                                                    />
                                                )}{' '}
                                                {vaultData.canCloseCurrentRound && (
                                                    <CloseRoundButton disabled={isSubmitting} onClick={closeRound}>
                                                        {t('vault.button.close-round-label')}
                                                    </CloseRoundButton>
                                                )}
                                            </RoundInfo>
                                        </RoundInfoContainer>
                                    </>
                                ) : (
                                    <RoundInfoContainer>
                                        <RoundInfo>{t('vault.vault-not-started-message')}</RoundInfo>
                                    </RoundInfoContainer>
                                )}
                            </RoundInfoWrapper>
                        </>
                    )}
                    <Description>
                        <Trans
                            i18nKey="vault.description"
                            components={{
                                p: <p />,
                            }}
                        />
                    </Description>
                    <PnL />
                </LeftContainer>
                <RightContainer>
                    {!vaultData ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : (
                        <>
                            {userVaultData && (
                                <ContentInfoContainer>
                                    {vaultData.vaultStarted && (
                                        <ContentInfo>
                                            <Trans
                                                i18nKey="vault.your-round-allocation-label"
                                                components={{
                                                    bold: <BoldContent />,
                                                }}
                                                values={{
                                                    amount: formatCurrencyWithSign(
                                                        USD_SIGN,
                                                        userVaultData.balanceCurrentRound
                                                    ),
                                                }}
                                            />
                                        </ContentInfo>
                                    )}
                                    <ContentInfo>
                                        <Trans
                                            i18nKey="vault.your-next-round-allocation-label"
                                            components={{
                                                bold: <BoldContent />,
                                            }}
                                            values={{
                                                amount: formatCurrencyWithSign(
                                                    USD_SIGN,
                                                    userVaultData.balanceNextRound
                                                ),
                                            }}
                                        />
                                    </ContentInfo>
                                    {isWithdrawalRequested && (
                                        <WarningContentInfo>
                                            <Trans
                                                i18nKey="vault.withdrawal-request-label"
                                                components={{
                                                    bold: <BoldContent />,
                                                }}
                                                values={{
                                                    amount: formatCurrencyWithSign(
                                                        USD_SIGN,
                                                        userVaultData.balanceCurrentRound
                                                    ),
                                                }}
                                            />
                                        </WarningContentInfo>
                                    )}
                                </ContentInfoContainer>
                            )}
                            <TabContainer>
                                {tabContent.map((tab, index) => (
                                    <Tab
                                        isActive={tab.id === selectedTab}
                                        key={index}
                                        index={index}
                                        onClick={() => {
                                            setSelectedTab(tab.id);
                                        }}
                                        className={`${tab.id === selectedTab ? 'selected' : ''}`}
                                    >
                                        {tab.name}
                                    </Tab>
                                ))}
                            </TabContainer>
                            {selectedTab === VaultTab.DEPOSIT && (
                                <>
                                    <ContentInfo>{t('vault.deposit-message')}</ContentInfo>
                                    {isWithdrawalRequested && (
                                        <WarningContentInfo>
                                            <Trans i18nKey="vault.deposit-withdrawal-warning" />
                                        </WarningContentInfo>
                                    )}
                                    {isMaximumAmountOfUsersReached && (
                                        <WarningContentInfo>
                                            <Trans i18nKey="vault.deposit-max-amount-of-users-warning" />
                                        </WarningContentInfo>
                                    )}
                                    <InputContainer>
                                        <InputLabel>{t('vault.deposit-amount-label')}:</InputLabel>
                                        <ValidationTooltip
                                            open={insufficientBalance || exceededVaultCap || invalidAmount}
                                            title={
                                                t(
                                                    `${
                                                        insufficientBalance
                                                            ? 'common.errors.insufficient-balance'
                                                            : exceededVaultCap
                                                            ? 'vault.deposit-vault-cap-error'
                                                            : 'vault.deposit-min-amount-error'
                                                    }`,
                                                    {
                                                        amount: formatCurrencyWithSign(
                                                            USD_SIGN,
                                                            vaultData.minDepositAmount
                                                        ),
                                                    }
                                                ) as string
                                            }
                                        >
                                            <NumericInput
                                                value={amount}
                                                disabled={
                                                    isSubmitting ||
                                                    isWithdrawalRequested ||
                                                    isMaximumAmountOfUsersReached
                                                }
                                                onChange={(_, value) => setAmount(value)}
                                                placeholder={t('vault.deposit-amount-placeholder')}
                                                currencyLabel={PAYMENT_CURRENCY}
                                            />
                                        </ValidationTooltip>
                                    </InputContainer>
                                    {vaultData && (
                                        <>
                                            {!vaultData.isRoundEnded && (
                                                <ContentInfo>
                                                    <Trans
                                                        i18nKey="vault.next-round-start-label"
                                                        components={{
                                                            counter: (
                                                                <TimeRemaining
                                                                    end={vaultData.roundEndTime}
                                                                    fontSize={18}
                                                                    showFullCounter
                                                                />
                                                            ),
                                                        }}
                                                    />
                                                </ContentInfo>
                                            )}
                                            <VaultFilledText>
                                                <Trans
                                                    i18nKey="vault.vault-filled-label"
                                                    values={{
                                                        amount: formatCurrencyWithSign(
                                                            USD_SIGN,
                                                            vaultData.allocationNextRound
                                                        ),
                                                        max: formatCurrencyWithSign(
                                                            USD_SIGN,
                                                            vaultData.maxAllowedDeposit
                                                        ),
                                                    }}
                                                />
                                            </VaultFilledText>
                                            <VaultFilledGraphicContainer>
                                                <VaultFilledGraphicPercentage
                                                    width={vaultData.allocationNextRoundPercentage}
                                                ></VaultFilledGraphicPercentage>
                                            </VaultFilledGraphicContainer>
                                        </>
                                    )}
                                    <ButtonContainer>{getDepositSubmitButton()}</ButtonContainer>
                                </>
                            )}
                            {selectedTab === VaultTab.WITHDRAW && (
                                <>
                                    {vaultData && userVaultData && !userVaultData.isWithdrawalRequested && (
                                        <>
                                            {nothingToWithdraw ? (
                                                <ContentInfo>
                                                    <Trans i18nKey="vault.nothing-to-withdraw-label" />
                                                </ContentInfo>
                                            ) : (
                                                <>
                                                    {userVaultData.hasDepositForNextRound ? (
                                                        <WarningContentInfo>
                                                            <Trans i18nKey="vault.withdrawal-deposit-warning" />
                                                        </WarningContentInfo>
                                                    ) : (
                                                        <>
                                                            <ContentInfo>
                                                                <Trans
                                                                    i18nKey="vault.available-to-withdraw-label"
                                                                    components={{
                                                                        bold: <BoldContent />,
                                                                    }}
                                                                    values={{
                                                                        amount: formatCurrencyWithSign(
                                                                            USD_SIGN,
                                                                            userVaultData.balanceCurrentRound
                                                                        ),
                                                                    }}
                                                                />
                                                            </ContentInfo>
                                                            <ContentInfo>
                                                                <Trans i18nKey="vault.withdrawal-message" />
                                                            </ContentInfo>
                                                        </>
                                                    )}
                                                    {!vaultData.isRoundEnded && (
                                                        <ContentInfo>
                                                            <Trans
                                                                i18nKey="vault.withdraw-round-end-label"
                                                                components={{
                                                                    counter: (
                                                                        <TimeRemaining
                                                                            end={vaultData.roundEndTime}
                                                                            fontSize={18}
                                                                            showFullCounter
                                                                        />
                                                                    ),
                                                                }}
                                                            />
                                                        </ContentInfo>
                                                    )}
                                                </>
                                            )}
                                            <ButtonContainer>{getWithdrawSubmitButton()}</ButtonContainer>
                                        </>
                                    )}
                                    {vaultData && userVaultData && userVaultData.isWithdrawalRequested && (
                                        <>
                                            <ContentInfo>
                                                <Trans
                                                    i18nKey="vault.withdrawal-requested-message"
                                                    components={{
                                                        bold: <BoldContent />,
                                                    }}
                                                    values={{
                                                        amount: formatCurrencyWithSign(
                                                            USD_SIGN,
                                                            userVaultData.balanceCurrentRound
                                                        ),
                                                    }}
                                                />
                                            </ContentInfo>
                                            {!vaultData.isRoundEnded && (
                                                <ContentInfo>
                                                    <Trans
                                                        i18nKey="vault.withdraw-round-end-label"
                                                        components={{
                                                            counter: (
                                                                <TimeRemaining
                                                                    end={vaultData.roundEndTime}
                                                                    fontSize={18}
                                                                    showFullCounter
                                                                />
                                                            ),
                                                        }}
                                                    />
                                                </ContentInfo>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </RightContainer>
            </Container>
            <TradesHistory />
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={amount}
                    tokenSymbol={PAYMENT_CURRENCY}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </Wrapper>
    );
};

export default Vault;
