import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import SimpleLoader from 'components/SimpleLoader';
import TimeRemaining from 'components/TimeRemaining';
import Toggle from 'components/Toggle/Toggle';
import Tooltip from 'components/Tooltip';
import NumericInput from 'components/fields/NumericInput';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { USD_SIGN } from 'constants/currency';
import ROUTES from 'constants/routes';
import { DEPRECATED_VAULTS, VAULT_MAP, isParlayVault } from 'constants/vault';
import { VaultTab } from 'enums/vault';
import { BigNumber, ethers } from 'ethers';
import BackToLink from 'pages/Markets/components/BackToLink';
import { NewBadge } from 'pages/Vaults/VaultOverview/styled-components';
import useUserVaultDataQuery from 'queries/vault/useUserVaultDataQuery';
import useVaultDataQuery from 'queries/vault/useVaultDataQuery';
import useSUSDWalletBalance from 'queries/wallet/usesUSDWalletBalance';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import {
    getIsWalletConnected,
    getNetworkId,
    getWalletAddress,
    setWalletConnectModalVisibility,
} from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { useTheme } from 'styled-components';
import { coinParser, formatCurrency, formatCurrencyWithSign, formatPercentage } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { UserVaultData, VaultData } from 'types/vault';
import { getDefaultCollateral } from 'utils/collaterals';
import vaultContract from 'utils/contracts/sportVaultContract';
import { checkAllowance } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { refetchVaultData } from 'utils/queryConnector';
import { buildHref, navigateTo } from 'utils/routes';
import PnL from './PnL';
import Transactions from './Transactions';
import {
    BoldContent,
    ButtonContainer,
    Container,
    ContentInfo,
    ContentInfoContainer,
    DeprecatedContainer,
    Description,
    InputContainer,
    LeftContainer,
    LeftLoaderContainer,
    RightContainer,
    RightLoaderContainer,
    RoundAllocation,
    RoundAllocationContainer,
    RoundAllocationLabel,
    RoundAllocationWrapper,
    RoundEnd,
    RoundEndContainer,
    RoundEndLabel,
    RoundInfo,
    RoundInfoContainer,
    RoundInfoWrapper,
    Title,
    TitleVaultIcon,
    ToggleContainer,
    UsersInVaultText,
    VaultFilledGraphicContainer,
    VaultFilledGraphicPercentage,
    VaultFilledText,
    WarningContentInfo,
    Wrapper,
} from './styled-components';

type VaultProps = RouteComponentProps<{
    vaultId: string;
}>;

const Vault: React.FC<VaultProps> = (props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const theme: ThemeInterface = useTheme();
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
    const [lastValidVaultData, setLastValidVaultData] = useState<VaultData | undefined>(undefined);
    const [lastValidUserVaultData, setLastValidUserVaultData] = useState<UserVaultData | undefined>(undefined);

    const { params } = props.match;
    const vaultId = params && params.vaultId && !!VAULT_MAP[params.vaultId] ? params.vaultId : '';
    const vaultAddress = !!vaultId ? VAULT_MAP[vaultId].addresses[networkId] : undefined;

    useEffect(() => {
        if (!vaultAddress) {
            navigateTo(ROUTES.Vaults);
        }
    }, [vaultAddress]);

    const paymentTokenBalanceQuery = useSUSDWalletBalance(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (paymentTokenBalanceQuery.isSuccess && paymentTokenBalanceQuery.data !== undefined) {
            setPaymentTokenBalance(Number(paymentTokenBalanceQuery.data));
        }
    }, [paymentTokenBalanceQuery.isSuccess, paymentTokenBalanceQuery.data]);

    const vaultDataQuery = useVaultDataQuery(vaultAddress, networkId, {
        enabled: isAppReady && !!vaultAddress,
    });

    useEffect(() => {
        if (vaultDataQuery.isSuccess && vaultDataQuery.data) {
            setLastValidVaultData(vaultDataQuery.data);
        }
    }, [vaultDataQuery.isSuccess, vaultDataQuery.data]);

    const vaultData: VaultData | undefined = useMemo(() => {
        if (vaultDataQuery.isSuccess && vaultDataQuery.data) {
            return vaultDataQuery.data;
        }
        return lastValidVaultData;
    }, [vaultDataQuery.isSuccess, vaultDataQuery.data, lastValidVaultData]);

    const userVaultDataQuery = useUserVaultDataQuery(vaultAddress, walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected && !!vaultAddress,
    });

    useEffect(() => {
        if (userVaultDataQuery.isSuccess && userVaultDataQuery.data) {
            setLastValidUserVaultData(userVaultDataQuery.data);
        }
    }, [userVaultDataQuery.isSuccess, userVaultDataQuery.data]);

    const userVaultData: UserVaultData | undefined = useMemo(() => {
        if (userVaultDataQuery.isSuccess && userVaultDataQuery.data) {
            return userVaultDataQuery.data;
        }
        return lastValidUserVaultData;
    }, [userVaultDataQuery.isSuccess, userVaultDataQuery.data, lastValidUserVaultData]);

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
    const vaultPaused = vaultData && vaultData.paused;
    const isVaultCapReached = vaultData && vaultData.allocationNextRoundPercentage >= 100;

    const isRequestWithdrawalButtonDisabled =
        !isWalletConnected ||
        isSubmitting ||
        nothingToWithdraw ||
        (userVaultData && userVaultData.hasDepositForNextRound) ||
        vaultPaused;

    const isDepositButtonDisabled =
        !isWalletConnected ||
        !isAmountEntered ||
        insufficientBalance ||
        isSubmitting ||
        isWithdrawalRequested ||
        exceededVaultCap ||
        isMaximumAmountOfUsersReached ||
        invalidAmount ||
        vaultPaused ||
        isVaultCapReached;

    const isDepositAmountInputDisabled =
        isSubmitting || isWithdrawalRequested || isMaximumAmountOfUsersReached || vaultPaused || isVaultCapReached;

    useEffect(() => {
        const { signer, sUSDContract } = networkConnector;
        if (signer && sUSDContract) {
            const sUSDContractWithSigner = sUSDContract.connect(signer);
            const getAllowance = async () => {
                try {
                    const parsedAmount = coinParser(Number(amount).toString(), networkId);
                    const allowance = await checkAllowance(
                        parsedAmount,
                        sUSDContractWithSigner,
                        walletAddress,
                        vaultAddress
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
    }, [walletAddress, isWalletConnected, hasAllowance, amount, isAllowing, vaultAddress, networkId]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { signer, sUSDContract } = networkConnector;
        if (signer && sUSDContract) {
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsAllowing(true);

            try {
                const sUSDContractWithSigner = sUSDContract.connect(signer);

                const tx = (await sUSDContractWithSigner.approve(
                    vaultAddress,
                    approveAmount
                )) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(
                        id,
                        getSuccessToastOptions(
                            t('market.toast-message.approve-success', {
                                token: getDefaultCollateral(networkId),
                            })
                        )
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
        const { signer } = networkConnector;
        if (signer) {
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsSubmitting(true);
            try {
                const sportVaultContractWithSigner = new ethers.Contract(vaultAddress, vaultContract.abi, signer);

                const parsedAmount = coinParser(Number(amount).toString(), networkId);

                const tx = await sportVaultContractWithSigner.deposit(parsedAmount);
                const txResult = await tx.wait();

                if (txResult && txResult.events) {
                    toast.update(id, getSuccessToastOptions(t('vault.button.deposit-confirmation-message')));
                    setAmount('');
                    setIsSubmitting(false);
                    refetchVaultData(vaultAddress, walletAddress, networkId);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    const handleWithdrawalRequest = async () => {
        const { signer } = networkConnector;
        if (signer) {
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsSubmitting(true);
            try {
                const sportVaultContractWithSigner = new ethers.Contract(vaultAddress, vaultContract.abi, signer);

                const tx = await sportVaultContractWithSigner.withdrawalRequest();
                const txResult = await tx.wait();

                if (txResult && txResult.events) {
                    toast.update(id, getSuccessToastOptions(t('vault.button.request-withdrawal-confirmation-message')));
                    setAmount('');
                    setIsSubmitting(false);
                    refetchVaultData(vaultAddress, walletAddress, networkId);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    const closeRound = async () => {
        const { signer } = networkConnector;
        if (signer) {
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            setIsSubmitting(true);
            try {
                const sportVaultContractWithSigner = new ethers.Contract(vaultAddress, vaultContract.abi, signer);

                const tx = await sportVaultContractWithSigner.closeRound();
                const txResult = await tx.wait();

                if (txResult && txResult.events) {
                    toast.update(id, getSuccessToastOptions(t('vault.button.close-round-confirmation-message')));
                    setIsSubmitting(false);
                    refetchVaultData(vaultAddress, walletAddress, networkId);
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
                <Button
                    onClick={() =>
                        dispatch(
                            setWalletConnectModalVisibility({
                                visibility: true,
                            })
                        )
                    }
                >
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }

        if (insufficientBalance) {
            return <Button disabled={true}>{t(`common.errors.insufficient-balance`)}</Button>;
        }
        if (!isAmountEntered) {
            return <Button disabled={true}>{t(`common.errors.enter-amount`)}</Button>;
        }
        if (!hasAllowance) {
            return (
                <Button disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                    {!isAllowing
                        ? t('common.enable-wallet-access.approve-label', {
                              currencyKey: getDefaultCollateral(networkId),
                          })
                        : t('common.enable-wallet-access.approve-progress-label', {
                              currencyKey: getDefaultCollateral(networkId),
                          })}
                </Button>
            );
        }
        return (
            <Button disabled={isDepositButtonDisabled} onClick={handleDeposit}>
                {!isSubmitting ? t('vault.button.deposit-label') : t('vault.button.deposit-progress-label')}
            </Button>
        );
    };

    const getWithdrawButton = () => {
        if (!isWalletConnected) {
            return (
                <Button
                    onClick={() =>
                        dispatch(
                            setWalletConnectModalVisibility({
                                visibility: true,
                            })
                        )
                    }
                >
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }
        return (
            <Button disabled={isRequestWithdrawalButtonDisabled} onClick={handleWithdrawalRequest}>
                {t('vault.button.request-withdrawal-label')}
            </Button>
        );
    };

    return (
        <Wrapper>
            <BackToLink link={buildHref(ROUTES.Vaults)} text={t('vault.back-to-vaults')} />
            {vaultData && (
                <>
                    <RoundInfoWrapper>
                        {vaultData.paused ? (
                            <RoundInfoContainer>
                                <RoundInfo>{t('vault.vault-paused-message')}</RoundInfo>
                            </RoundInfoContainer>
                        ) : vaultData.vaultStarted ? (
                            <>
                                <RoundEndContainer>
                                    <RoundEndLabel>{t('vault.round-end-label')}:</RoundEndLabel>
                                    <RoundEnd>
                                        {vaultData.isRoundEnded ? (
                                            t('vault.round-ended-label')
                                        ) : (
                                            <TimeRemaining end={vaultData.roundEndTime} fontSize={20} showFullCounter />
                                        )}{' '}
                                        {vaultData.canCloseCurrentRound && (
                                            <Button
                                                disabled={isSubmitting}
                                                onClick={closeRound}
                                                fontSize="12px"
                                                margin="5px 0 0 0"
                                                height="24px"
                                                backgroundColor={theme.button.background.quaternary}
                                                borderColor={theme.button.borderColor.secondary}
                                            >
                                                {t('vault.button.close-round-label')}
                                            </Button>
                                        )}
                                    </RoundEnd>
                                </RoundEndContainer>
                                <RoundAllocationWrapper>
                                    <RoundAllocationContainer>
                                        <RoundAllocationLabel>
                                            {t('vault.round-allocation-label')}:
                                        </RoundAllocationLabel>
                                        <RoundAllocation>
                                            {formatCurrencyWithSign(USD_SIGN, vaultData.allocationCurrentRound)}
                                        </RoundAllocation>
                                    </RoundAllocationContainer>
                                    <RoundAllocationContainer>
                                        <RoundAllocationLabel>{t('vault.spent-trading-label')}:</RoundAllocationLabel>
                                        <RoundAllocation>
                                            {formatCurrencyWithSign(USD_SIGN, vaultData.allocationSpentInARound)}
                                        </RoundAllocation>
                                    </RoundAllocationContainer>
                                    <RoundAllocationContainer>
                                        <RoundAllocationLabel>
                                            {t('vault.available-trading-label')}:
                                        </RoundAllocationLabel>
                                        <RoundAllocation>
                                            {formatCurrencyWithSign(USD_SIGN, vaultData.availableAllocationInARound)}
                                        </RoundAllocation>
                                    </RoundAllocationContainer>
                                </RoundAllocationWrapper>
                            </>
                        ) : (
                            <RoundInfoContainer>
                                <RoundInfo>{t('vault.vault-not-started-message')}</RoundInfo>
                            </RoundInfoContainer>
                        )}
                    </RoundInfoWrapper>
                </>
            )}
            {DEPRECATED_VAULTS.includes(vaultId) && (
                <DeprecatedContainer>{t(`vault.deprecated-info`)}</DeprecatedContainer>
            )}
            <Container>
                <LeftContainer>
                    <Title>
                        <TitleVaultIcon className={`icon icon--${vaultId}`} />
                        {t(`vault.${vaultId}.title`)}
                        {vaultData && vaultData.round === 1 && <NewBadge>NEW</NewBadge>}
                    </Title>
                    {!vaultData ? (
                        <LeftLoaderContainer>
                            <SimpleLoader />
                        </LeftLoaderContainer>
                    ) : (
                        <>
                            <Description>
                                <Trans
                                    i18nKey={`vault.${vaultId}.description`}
                                    components={{
                                        p: <p />,
                                    }}
                                    values={{
                                        odds: formatPercentage(
                                            vaultId === 'upsettoor-vault'
                                                ? vaultData.priceUpperLimit
                                                : vaultData.priceLowerLimit,
                                            0
                                        ),
                                        discount: formatPercentage(Math.abs(vaultData.skewImpactLimit), 0),
                                    }}
                                />
                                <Trans
                                    i18nKey={`vault.gamified-staking-message`}
                                    components={{
                                        p: <p />,
                                    }}
                                />
                                <Trans
                                    i18nKey={
                                        isParlayVault(vaultAddress, networkId)
                                            ? `vault.variables-parlay`
                                            : `vault.variables`
                                    }
                                    components={{
                                        p: <p />,
                                        ul: <ul />,
                                        li: <li />,
                                    }}
                                    values={{
                                        utilizationRate: formatPercentage(vaultData.utilizationRate, 0),
                                        priceLowerLimit: formatCurrencyWithSign(USD_SIGN, vaultData.priceLowerLimit, 2),
                                        priceUpperLimit: formatCurrencyWithSign(USD_SIGN, vaultData.priceUpperLimit, 2),
                                        skewImpactLimit: formatCurrency(vaultData.skewImpactLimit),
                                        allocationLimitsPerMarketPerRound: formatPercentage(
                                            vaultData.allocationLimitsPerMarketPerRound
                                        ),
                                        maxAllowedDeposit: formatCurrencyWithSign(
                                            USD_SIGN,
                                            vaultData.maxAllowedDeposit,
                                            0
                                        ),
                                        maxAllowedUsers: vaultData.maxAllowedUsers,
                                        minTradeAmount: vaultData.minTradeAmount,
                                        minDepositAmount: formatCurrencyWithSign(
                                            USD_SIGN,
                                            vaultData.minDepositAmount,
                                            0
                                        ),
                                        roundLength: 7, // vaultData.roundLength,
                                    }}
                                />
                            </Description>
                        </>
                    )}
                </LeftContainer>
                <RightContainer>
                    {!vaultData ? (
                        <RightLoaderContainer>
                            <SimpleLoader />
                        </RightLoaderContainer>
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
                                                amount: formatCurrencyWithSign(USD_SIGN, userVaultData.balanceTotal),
                                            }}
                                        />
                                        {userVaultData.balanceCurrentRound > 0 && !isWithdrawalRequested && (
                                            <Tooltip
                                                overlay={t(`vault.estimated-amount-tooltip`)}
                                                iconFontSize={18}
                                                marginLeft={2}
                                                top={-2}
                                            />
                                        )}
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
                                            <Tooltip
                                                overlay={t(`vault.estimated-amount-tooltip`)}
                                                iconFontSize={18}
                                                marginLeft={2}
                                                top={-2}
                                            />
                                        </WarningContentInfo>
                                    )}
                                </ContentInfoContainer>
                            )}
                            <ToggleContainer>
                                <Toggle
                                    label={{
                                        firstLabel: t(`vault.tabs.${VaultTab.DEPOSIT}`),
                                        secondLabel: t(`vault.tabs.${VaultTab.WITHDRAW}`),
                                        fontSize: '18px',
                                    }}
                                    active={selectedTab === VaultTab.WITHDRAW}
                                    dotSize="18px"
                                    dotBackground={theme.background.secondary}
                                    dotBorder={`3px solid ${theme.borderColor.quaternary}`}
                                    handleClick={() => {
                                        setSelectedTab(
                                            selectedTab === VaultTab.DEPOSIT ? VaultTab.WITHDRAW : VaultTab.DEPOSIT
                                        );
                                    }}
                                />
                            </ToggleContainer>
                            {selectedTab === VaultTab.DEPOSIT && (
                                <>
                                    <ContentInfo>{t('vault.deposit-message')}</ContentInfo>
                                    {isWithdrawalRequested && (
                                        <WarningContentInfo>
                                            <Trans i18nKey="vault.deposit-withdrawal-warning" />
                                        </WarningContentInfo>
                                    )}
                                    {isVaultCapReached && (
                                        <WarningContentInfo>
                                            <Trans i18nKey="vault.deposit-vault-cap-reached-warning" />
                                        </WarningContentInfo>
                                    )}
                                    {isMaximumAmountOfUsersReached && (
                                        <WarningContentInfo>
                                            <Trans i18nKey="vault.deposit-max-amount-of-users-warning" />
                                        </WarningContentInfo>
                                    )}
                                    <InputContainer>
                                        <NumericInput
                                            value={amount}
                                            label={t('vault.deposit-amount-label')}
                                            disabled={isDepositAmountInputDisabled}
                                            onChange={(_, value) => setAmount(value)}
                                            placeholder={t('vault.deposit-amount-placeholder')}
                                            currencyLabel={getDefaultCollateral(networkId)}
                                            showValidation={insufficientBalance || exceededVaultCap || invalidAmount}
                                            validationMessage={t(
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
                                            )}
                                            validationPlacement="bottom"
                                        />
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
                                            <UsersInVaultText>
                                                <Trans
                                                    i18nKey="vault.users-in-vault-label"
                                                    values={{
                                                        number: vaultData.usersCurrentlyInVault,
                                                        max: vaultData.maxAllowedUsers,
                                                    }}
                                                />
                                            </UsersInVaultText>
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
                                    {((vaultData && userVaultData && !isWithdrawalRequested) || !isWalletConnected) && (
                                        <>
                                            {nothingToWithdraw || !isWalletConnected ? (
                                                <>
                                                    <ContentInfo>
                                                        <Trans i18nKey="vault.nothing-to-withdraw-label" />
                                                    </ContentInfo>
                                                    {userVaultData && userVaultData.balanceNextRound > 0 && (
                                                        <ContentInfo>
                                                            <Trans i18nKey="vault.first-deposit-withdrawal-message" />
                                                        </ContentInfo>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {userVaultData && (
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
                                                                        <Tooltip
                                                                            overlay={t(
                                                                                `vault.estimated-amount-tooltip`
                                                                            )}
                                                                            iconFontSize={18}
                                                                            marginLeft={2}
                                                                            top={-2}
                                                                        />
                                                                    </ContentInfo>
                                                                    <ContentInfo>
                                                                        <Trans i18nKey="vault.withdrawal-message" />
                                                                    </ContentInfo>
                                                                </>
                                                            )}
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
                                            <ButtonContainer>{getWithdrawButton()}</ButtonContainer>
                                        </>
                                    )}
                                    {vaultData && userVaultData && userVaultData.isWithdrawalRequested && (
                                        <>
                                            <ContentInfo>
                                                <Trans
                                                    i18nKey="vault.withdrawal-requested-message"
                                                    components={{
                                                        bold: <BoldContent />,
                                                        tooltip: (
                                                            <Tooltip
                                                                overlay={t(`vault.estimated-amount-tooltip`)}
                                                                iconFontSize={18}
                                                                marginLeft={2}
                                                                top={-2}
                                                            />
                                                        ),
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
            {vaultData && <PnL vaultAddress={vaultAddress} lifetimePnl={vaultData.lifetimePnl} />}
            {vaultData && (
                <Transactions
                    vaultAddress={vaultAddress}
                    currentRound={vaultData.round}
                    currentRoundDeposit={vaultData.allocationCurrentRound}
                />
            )}
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={amount}
                    tokenSymbol={getDefaultCollateral(networkId)}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </Wrapper>
    );
};

export default Vault;
