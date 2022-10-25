import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import BackToLink from 'pages/Markets/components/BackToLink';
import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import {
    Container,
    QuizContainer,
    Title,
    SubmitButton,
    ButtonContainer,
    ValidationTooltip,
    LoaderContainer,
    InputLabel,
    InputContainer,
    Wrapper,
    TabContainer,
    Tab,
    Copy,
    Description,
    TimeRemainingGraphicContainer,
    TimeRemainingGraphicPercentage,
    TimeRemainingText,
} from './styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import SPAAnchor from 'components/SPAAnchor';
import SimpleLoader from 'components/SimpleLoader';
import { Info } from 'pages/Markets/Home/Home';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { VaultTab } from 'constants/vault';
import NumericInput from 'components/fields/NumericInput';
import { getIsAppReady } from 'redux/modules/app';
import { UserVaultData, VaultData } from 'types/vault';
import useVaultDataQuery from 'queries/vault/useVaultDataQuery';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { USD_SIGN } from 'constants/currency';
import TimeRemaining from 'components/TimeRemaining';
import useUserVaultDataQuery from 'queries/vault/useUserVaultDataQuery';

const Vault: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const [amount, setAmount] = useState<number | string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [selectedTab, setSelectedTab] = useState<VaultTab>(VaultTab.DEPOSIT);

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

    console.log(walletAddress);

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

    const handleStartQuiz = async () => {
        setIsSubmitting(true);
        try {
            setIsSubmitting(false);
        } catch (e) {
            console.log(e);
        }
        setIsSubmitting(false);
    };

    const getSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <SubmitButton onClick={() => openConnectModal?.()}>
                    {t('common.wallet.connect-your-wallet')}
                </SubmitButton>
            );
        }

        return (
            <SubmitButton disabled={isSubmitting} onClick={handleStartQuiz}>
                {'Deposit'}
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
            <Container>
                <QuizContainer>
                    <Title>{t('vault.title')}</Title>
                    {vaultData && (
                        <Copy>
                            <Description>{`Max deposit amount: ${formatCurrencyWithSign(
                                USD_SIGN,
                                vaultData.maxAllowedDeposit
                            )}`}</Description>
                            <Description>{`Current round: ${vaultData.round}`}</Description>
                            <Description>{`Vault started: ${vaultData.vaultStarted}`}</Description>
                        </Copy>
                    )}
                </QuizContainer>
                <QuizContainer>
                    {isSubmitting ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : (
                        <>
                            {userVaultData && (
                                <Copy>
                                    <Description>{`Deposit current round: ${formatCurrencyWithSign(
                                        USD_SIGN,
                                        userVaultData.balanceCurrentRound
                                    )}`}</Description>
                                    <Description>{`Deposit next round: ${formatCurrencyWithSign(
                                        USD_SIGN,
                                        userVaultData.balanceNextRound
                                    )}`}</Description>
                                    <Description>{`Deposit total: ${formatCurrencyWithSign(
                                        USD_SIGN,
                                        userVaultData.balanceTotal
                                    )}`}</Description>
                                </Copy>
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
                                    {vaultData && (
                                        <Copy>
                                            <Description>{`Deposit funds into vault for round: ${
                                                vaultData.round + 1
                                            }`}</Description>
                                        </Copy>
                                    )}
                                    <InputContainer>
                                        <InputLabel>{t('vault.deposit-amount-label')}:</InputLabel>
                                        <ValidationTooltip
                                            open={false}
                                            title={t('quiz.twitter-handle-validation') as string}
                                        >
                                            <NumericInput
                                                value={amount}
                                                disabled={isSubmitting}
                                                onChange={(_, value) => setAmount(value)}
                                                placeholder="Enter amount"
                                            />
                                        </ValidationTooltip>
                                    </InputContainer>
                                    {vaultData && (
                                        <>
                                            <Description>
                                                Next round starts in:
                                                <TimeRemaining
                                                    end={vaultData.roundEndTime * 1000}
                                                    fontSize={18}
                                                    showFullCounter
                                                />
                                            </Description>
                                            <TimeRemainingText>
                                                {`Vault filled: ${formatCurrencyWithSign(
                                                    USD_SIGN,
                                                    vaultData.allocationNextRound
                                                )} / ${formatCurrencyWithSign(USD_SIGN, vaultData.maxAllowedDeposit)}`}
                                            </TimeRemainingText>
                                            <TimeRemainingGraphicContainer>
                                                <TimeRemainingGraphicPercentage
                                                    width={vaultData.allocationNextRoundPercentage}
                                                ></TimeRemainingGraphicPercentage>
                                            </TimeRemainingGraphicContainer>
                                        </>
                                    )}
                                    <ButtonContainer>{getSubmitButton()}</ButtonContainer>
                                </>
                            )}
                            {selectedTab === VaultTab.WITHDRAW && (
                                <>
                                    {userVaultData && !userVaultData.isWithdrawalRequested && (
                                        <Copy>
                                            <Description>{`Available to withdraw: ${formatCurrencyWithSign(
                                                USD_SIGN,
                                                userVaultData.balanceCurrentRound
                                            )}`}</Description>
                                        </Copy>
                                    )}
                                    {userVaultData && userVaultData.isWithdrawalRequested && (
                                        <Copy>
                                            <Description>{`You sent request to withdraw ${formatCurrencyWithSign(
                                                USD_SIGN,
                                                userVaultData.balanceCurrentRound
                                            )}. You can withdraw your funds at the end of the round.`}</Description>
                                        </Copy>
                                    )}
                                    {vaultData && (
                                        <Description>
                                            The round ends in:
                                            <TimeRemaining
                                                end={vaultData.roundEndTime * 1000}
                                                fontSize={18}
                                                showFullCounter
                                            />
                                        </Description>
                                    )}
                                    <ButtonContainer>{getSubmitButton()}</ButtonContainer>
                                </>
                            )}
                        </>
                    )}
                </QuizContainer>
            </Container>
        </Wrapper>
    );
};

export default Vault;
