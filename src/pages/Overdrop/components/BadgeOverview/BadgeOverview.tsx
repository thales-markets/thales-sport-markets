import ArbitrumLogo from 'assets/images/arb-logo.svg?react';
import OptimsimLogo from 'assets/images/op-logo.svg?react';
import Button from 'components/Button';
import Progress from 'components/Progress';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { OVERDROP_LEVELS, OVERDROP_REWARDS_COLLATERALS } from 'constants/overdrop';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { ContractType } from 'enums/contract';
import useOpAndArbPriceQuery from 'queries/overdrop/useOpAndArbPriceQuery';
import useUserDataQuery from 'queries/overdrop/useUserDataQuery';
import useUserRewardsQuery from 'queries/overdrop/useUserRewardsQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSwipeable } from 'react-swipeable';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getIsBiconomy, setIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { formatCurrency, formatCurrencyWithKey, formatCurrencyWithSign, localStore } from 'thales-utils';
import { OverdropUserData, UserRewards } from 'types/overdrop';
import { ThemeInterface } from 'types/ui';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';
import {
    areOverdropRewardsAvailableForNetwork,
    formatPoints,
    getCurrentLevelByPoints,
    getNextOverRewardLevel,
    getProgressLevel,
} from 'utils/overdrop';
import { Client } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import SmallBadge from '../SmallBadge';

const HIDE_FREE_BET_LEVEL = true;

const BadgeOverview: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector(getIsMobile);
    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();
    const { address, isConnected } = useAccount();
    const isBiconomy = useSelector(getIsBiconomy);

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [numberOfCards, setNumberOfCards] = useState<number>(isMobile ? 3 : 6);
    const [isClaiming, setIsClaiming] = useState<boolean>(false);

    useEffect(() => {
        isMobile ? setNumberOfCards(4) : setNumberOfCards(6);
    }, [isMobile]);

    const userDataQuery = useUserDataQuery(address as string, {
        enabled: isConnected,
    });

    const priceQuery = useOpAndArbPriceQuery();

    const exchangeRates = priceQuery.isSuccess && priceQuery.data ? priceQuery.data : null;

    const userData: OverdropUserData | undefined =
        userDataQuery?.isSuccess && userDataQuery?.data ? userDataQuery.data : undefined;

    const levelItem = userData ? getCurrentLevelByPoints(userData.points) : OVERDROP_LEVELS[0];
    const nextOverRewardLevel = getNextOverRewardLevel(userData?.points);

    const areRewardsAvailable = useMemo(() => areOverdropRewardsAvailableForNetwork(networkId), [networkId]);

    const userRewardsQuery = useUserRewardsQuery(
        address as string,
        { networkId, client },
        {
            enabled: isConnected && areRewardsAvailable,
        }
    );

    const userRewards: UserRewards | undefined = useMemo(() => {
        if (userRewardsQuery.data && userRewardsQuery.isSuccess) {
            return userRewardsQuery.data;
        }

        return undefined;
    }, [userRewardsQuery.data, userRewardsQuery.isSuccess]);

    const isClaimButtonDisabled = isClaiming || userRewards?.hasClaimed;
    const switchToEoa = isBiconomy && !userRewards?.hasClaimed;

    useEffect(() => {
        if (levelItem) {
            if (levelItem.level > OVERDROP_LEVELS.length - numberOfCards) {
                setCurrentStep(OVERDROP_LEVELS.length - numberOfCards);
            } else if (levelItem.level > numberOfCards) {
                setCurrentStep(levelItem.level - (isMobile ? 1 : 2));
            } else {
                setCurrentStep(levelItem.level - 2 > 0 ? levelItem.level - (isMobile ? 1 : 2) : 0);
            }
        }
    }, [levelItem, numberOfCards, isMobile]);

    const handleOnNext = () => {
        if (currentStep + 1 + numberOfCards == OVERDROP_LEVELS.length + 1) return;
        setCurrentStep(currentStep + 1);
    };

    const handleOnPrevious = () => {
        if (currentStep - 1 <= -1) return;
        setCurrentStep(currentStep - 1);
    };

    const handlers = useSwipeable({
        onSwipedRight: () => handleOnPrevious(),
        onSwipedLeft: () => handleOnNext(),
    });

    const progressLevel = getProgressLevel(
        userData?.points ?? 0,
        0,
        nextOverRewardLevel?.minimumPoints ?? OVERDROP_LEVELS[1].minimumPoints
    );

    const claimRewards = async () => {
        const overdropRewardsContractWithSigner = getContractInstance(ContractType.OVERDROP_REWARDS, {
            client: walletClient.data,
            networkId,
        }) as ViemContract;

        if (overdropRewardsContractWithSigner && userRewards) {
            const toastId = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                setIsClaiming(true);

                const txHash = await overdropRewardsContractWithSigner.write.claimRewards([
                    userRewards.rawAmount,
                    userRewards.proof,
                ]);

                const txReceipt = await waitForTransactionReceipt(client as Client, {
                    hash: txHash,
                });
                if (txReceipt.status === 'success') {
                    toast.update(
                        toastId,
                        getSuccessToastOptions(
                            t('overdrop.overdrop-home.claim-confirmation-message', {
                                collateral: OVERDROP_REWARDS_COLLATERALS[networkId],
                            })
                        )
                    );
                    userRewardsQuery.refetch();
                }
            } catch (e) {
                toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
                setIsClaiming(false);
            }
        }
    };

    return (
        <Wrapper>
            <BadgeWrapper {...handlers}>
                <Arrow className={'icon-homepage icon--arrow-left'} onClick={() => handleOnPrevious()} />
                {OVERDROP_LEVELS.slice(currentStep, currentStep + numberOfCards).map((item, index) => {
                    return (
                        <SmallBadge
                            key={index}
                            level={item.level}
                            requiredPointsForLevel={item.minimumPoints}
                            levelName={item.levelName}
                            reached={levelItem ? item.level <= levelItem.level : false}
                        />
                    );
                })}
                <Arrow className={'icon-homepage icon--arrow-right'} onClick={() => handleOnNext()} />
            </BadgeWrapper>
            <RewardsWrapper>
                <ItemContainer>
                    <RewardsLabel>{t('overdrop.overdrop-home.your-rewards')}</RewardsLabel>
                    <TotalRewardsWrapper>
                        <TotalLabel>Total value</TotalLabel>
                        <RewardValue>
                            {exchangeRates && userData
                                ? `${formatCurrencyWithSign(
                                      '$',
                                      exchangeRates.op * userData.rewards.op + exchangeRates.arb * userData.rewards.arb,
                                      2
                                  )}`
                                : 'N/A'}
                        </RewardValue>
                    </TotalRewardsWrapper>
                </ItemContainer>
                <OpArbRewardsWrapper>
                    <OptimsimLogo />
                    <RewardValue>
                        {formatCurrencyWithKey(CRYPTO_CURRENCY_MAP.OP, userData?.rewards?.op ? userData.rewards.op : 0)}
                    </RewardValue>
                    <RewardSubValue>
                        {exchangeRates && userData
                            ? `≈ ${formatCurrencyWithSign('$', exchangeRates.op * userData.rewards.op, 2)}`
                            : 'N/A'}
                    </RewardSubValue>
                </OpArbRewardsWrapper>
                <OpArbRewardsWrapper>
                    <ArbitrumLogo />
                    <RewardValue>
                        {formatCurrencyWithKey(
                            CRYPTO_CURRENCY_MAP.ARB,
                            userData?.rewards?.arb ? userData.rewards.arb : 0
                        )}
                    </RewardValue>
                    <RewardSubValue>
                        {exchangeRates && userData
                            ? `≈ ${formatCurrencyWithSign('$', exchangeRates.arb * userData.rewards.arb, 2)}`
                            : 'N/A'}
                    </RewardSubValue>
                </OpArbRewardsWrapper>
                <ClaimContainer>
                    {areRewardsAvailable && userRewards && userRewards.hasRewards && (
                        <>
                            <ButtonContainer>
                                <Button
                                    backgroundColor={theme.button.textColor.tertiary}
                                    borderColor={theme.button.textColor.tertiary}
                                    height="24px"
                                    margin="0px 0px 5px 0px"
                                    padding={switchToEoa ? '2px 10px' : '2px 15px'}
                                    fontSize={switchToEoa ? '10px' : '13px'}
                                    lineHeight={switchToEoa ? '10px' : '16px'}
                                    width="100%"
                                    onClick={() => {
                                        if (switchToEoa) {
                                            dispatch(setIsBiconomy(false));
                                            localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, false);
                                        } else {
                                            claimRewards();
                                        }
                                    }}
                                    disabled={isClaimButtonDisabled}
                                >
                                    {switchToEoa
                                        ? t('overdrop.overdrop-home.switch-to-eoa')
                                        : t('overdrop.overdrop-home.claim-rewards', {
                                              amount: formatCurrency(userRewards.amount),
                                              collateral: OVERDROP_REWARDS_COLLATERALS[networkId],
                                          })}
                                </Button>
                                {switchToEoa && (
                                    <Tooltip
                                        overlay={t('overdrop.overdrop-home.claim-rewards-tooltip')}
                                        marginLeft={5}
                                    />
                                )}
                            </ButtonContainer>
                            {userRewards.hasClaimed && (
                                <ClaimedMessage>
                                    {t('overdrop.overdrop-home.claimed-message', {
                                        collateral: OVERDROP_REWARDS_COLLATERALS[networkId],
                                    })}
                                </ClaimedMessage>
                            )}
                        </>
                    )}
                    <Disclaimer>{t('overdrop.overdrop-home.claim-disclaimer')}</Disclaimer>
                </ClaimContainer>
            </RewardsWrapper>
            <DetailsWrapper>
                {levelItem.level !== OVERDROP_LEVELS.length - 1 && !HIDE_FREE_BET_LEVEL && (
                    <ItemContainer>
                        <Label>{t('overdrop.overdrop-home.next-over-rewards-at')}</Label>
                        <ValueWrapper>
                            <ValueSecondary>
                                {nextOverRewardLevel
                                    ? `${formatPoints(nextOverRewardLevel?.minimumPoints)} @ LVL ${
                                          nextOverRewardLevel?.level
                                      }  (${formatCurrencyWithKey(
                                          CRYPTO_CURRENCY_MAP.OVER,
                                          nextOverRewardLevel?.voucherAmount ?? 0,
                                          0,
                                          true
                                      )})`
                                    : ''}
                            </ValueSecondary>
                        </ValueWrapper>

                        <ProgressContainer>
                            <Progress
                                progress={isNaN(progressLevel) ? 0 : progressLevel}
                                width="100%"
                                height="18px"
                                textBelow={`${formatPoints(userData?.points ?? 0)} / ${formatPoints(
                                    nextOverRewardLevel?.minimumPoints ?? OVERDROP_LEVELS[1].minimumPoints
                                )}`}
                            />
                        </ProgressContainer>
                        <Disclaimer>{t('overdrop.leveling-tree.payout-disclaimer')}</Disclaimer>
                    </ItemContainer>
                )}
            </DetailsWrapper>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivColumn)`
    align-items: center;
    justify-content: space-around;
    flex-grow: 4;
    @media (max-width: 767px) {
        margin-top: 10px;
    }
`;

const BadgeWrapper = styled(FlexDivRow)`
    align-items: center;
    justify-content: space-between;
`;

const DetailsWrapper = styled(FlexDivRow)`
    width: 100%;
    @media (max-width: 767px) {
        flex-direction: column;
        margin-left: 0px;
        padding: 0px 10px;
    }
`;

const RewardsWrapper = styled(FlexDivRow)`
    margin-top: 20px;
    border: 1px solid ${(props) => props.theme.overdrop.textColor.primary};
    background: ${(props) => props.theme.overdrop.background.active};
    padding: 20px;
    border-radius: 8px;
    width: 100%;
    gap: 15px;
    @media (max-width: 767px) {
        padding: 5px 15px 15px 15px;
        flex-direction: column;
        gap: 10px;
    }
`;

const TotalRewardsWrapper = styled(FlexDivColumnCentered)`
    padding: 10px;
    border: 1px solid ${(props) => props.theme.overdrop.textColor.primary};
    background: ${(props) => props.theme.overdrop.background.quinary};
    border-radius: 6px;
    justify-content: center;
    text-align: center;
    width: 100%;
`;

const OpArbRewardsWrapper = styled(FlexDivColumnCentered)`
    padding: 5px 5px;
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    border-radius: 6px;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 8px;
`;

const RewardSubValue = styled.span`
    color: ${(props) => props.theme.textColor.quinary};
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    line-height: 100%;
`;

const TotalLabel = styled.span`
    font-size: 9px;
    font-weight: 400;
    letter-spacing: 0.45px;
    margin-bottom: 7px;
`;

const RewardValue = styled.span`
    color: ${(props) => props.theme.overdrop.textColor.primary};
    font-size: 16px;
    font-weight: 800;
    line-height: 100%;
`;

const ItemContainer = styled(FlexDivColumn)`
    max-width: 50%;
    align-items: center;
    justify-content: center;
    gap: 4px;
    @media (max-width: 767px) {
        min-width: 100%;
        margin-top: 10px;
    }
    text-align: center;
`;

const ClaimContainer = styled(ItemContainer)`
    justify-content: space-around;
`;

const ValueWrapper = styled(FlexDivRow)``;

const Label = styled.span`
    font-size: 13px;
    font-weight: 700;
    line-height: 110%;
    margin-bottom: 5px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    white-space: pre;
`;

const RewardsLabel = styled(Label)`
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;
    letter-spacing: 0.3px;
    color: ${(props) => props.theme.textColor.quaternary};
`;

const ValueSecondary = styled(Label)`
    font-weight: 600;
    color: ${(props) => props.theme.textColor.septenary};
`;

const Arrow = styled.i`
    color: ${(props) => props.theme.button.background.senary};
    font-size: 18px;
    cursor: pointer;
`;

const ProgressContainer = styled(FlexDiv)`
    min-width: 100%;
`;

const Disclaimer = styled.p`
    font-size: 9px;
    font-weight: 400;
    line-height: 10px;
`;

const ClaimedMessage = styled.span`
    font-size: 10px;
    color: ${(props) => props.theme.warning.textColor.primary};
    width: 100%;
    margin-bottom: 5px;
    text-align: center;
`;

const ButtonContainer = styled(FlexDivRow)`
    width: 100%;
    align-items: center;
`;

export default BadgeOverview;
