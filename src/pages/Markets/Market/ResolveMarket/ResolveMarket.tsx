import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import Button from 'components/Button';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { getIsAppReady } from 'redux/modules/app';
import { MarketData, MarketsParameters } from 'types/markets';
import useMarketsParametersQuery from 'queries/markets/useMarketsParametersQuery';
import networkConnector from 'utils/networkConnector';
import { BigNumber, ethers } from 'ethers';
import { checkAllowance } from 'utils/network';
import onboardConnector from 'utils/onboardConnector';
import { DEFAULT_CURRENCY_DECIMALS, PAYMENT_CURRENCY } from 'constants/currency';
import ApprovalModal from 'components/ApprovalModal';
import usePaymentTokenBalanceQuery from 'queries/wallet/usePaymentTokenBalanceQuery';
import { MAX_GAS_LIMIT } from 'constants/network';
import RadioButton from 'components/fields/RadioButton';
import { toast } from 'react-toastify';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import { BondInfo } from 'components/common';
import { refetchMarketData } from 'utils/queryConnector';

type ResolveMarketProps = {
    market: MarketData;
};

const ResolveMarket: React.FC<ResolveMarketProps> = ({ market }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [outcomePosition, setOutcomePosition] = useState<number>(-1);
    const [paymentTokenBalance, setPaymentTokenBalance] = useState<number | string>('');
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [marketsParameters, setMarketsParameters] = useState<MarketsParameters | undefined>(undefined);

    const outcomePositions = [...market.positions, t('common.cancel')];

    const marketsParametersQuery = useMarketsParametersQuery(networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (marketsParametersQuery.isSuccess && marketsParametersQuery.data) {
            setMarketsParameters(marketsParametersQuery.data);
        }
    }, [marketsParametersQuery.isSuccess, marketsParametersQuery.data]);

    const paymentTokenBalanceQuery = usePaymentTokenBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (paymentTokenBalanceQuery.isSuccess && paymentTokenBalanceQuery.data !== undefined) {
            setPaymentTokenBalance(Number(paymentTokenBalanceQuery.data));
        }
    }, [paymentTokenBalanceQuery.isSuccess, paymentTokenBalanceQuery.data]);

    const fixedBondAmount = market.fixedBondAmount;
    const resolverPercentage = marketsParameters ? marketsParameters.resolverPercentage : 0;

    const isOutcomePositionSelected = outcomePosition >= 0;
    const insufficientBalance =
        Number(paymentTokenBalance) < Number(fixedBondAmount) || Number(paymentTokenBalance) === 0;
    const isResolverBondDeposited = market.creator === walletAddress && market.creatorBond > 0;

    const isButtonDisabled =
        isSubmitting ||
        !isWalletConnected ||
        !isOutcomePositionSelected ||
        ((!hasAllowance || insufficientBalance) && !isResolverBondDeposited);

    useEffect(() => {
        const { paymentTokenContract, thalesBondsContract, signer } = networkConnector;
        if (paymentTokenContract && thalesBondsContract && signer) {
            const paymentTokenContractWithSigner = paymentTokenContract.connect(signer);
            const addressToApprove = thalesBondsContract.address;
            const getAllowance = async () => {
                try {
                    const parsedAmount = ethers.utils.parseEther(Number(fixedBondAmount).toString());
                    const allowance = await checkAllowance(
                        parsedAmount,
                        paymentTokenContractWithSigner,
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
    }, [walletAddress, isWalletConnected, hasAllowance, fixedBondAmount, isAllowing]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { paymentTokenContract, thalesBondsContract, signer } = networkConnector;
        if (paymentTokenContract && thalesBondsContract && signer) {
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            setIsAllowing(true);

            try {
                const paymentTokenContractWithSigner = paymentTokenContract.connect(signer);
                const addressToApprove = thalesBondsContract.address;

                const tx = (await paymentTokenContractWithSigner.approve(addressToApprove, approveAmount, {
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

    const handleSubmit = async () => {
        const { marketManagerContract, signer } = networkConnector;
        if (marketManagerContract && signer) {
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            setIsSubmitting(true);

            try {
                const marketManagerContractWithSigner = marketManagerContract.connect(signer);

                const tx = await marketManagerContractWithSigner.resolveMarket(market.address, outcomePosition);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    refetchMarketData(market.address, walletAddress);
                    toast.update(id, getSuccessToastOptions(t('market.toast-messsage.resolve-market-success')));
                    setIsSubmitting(false);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsSubmitting(false);
            }
        }
    };

    const getSubmitButton = () => {
        if (!isWalletConnected) {
            return (
                <MarketButton onClick={() => onboardConnector.connectWallet()}>
                    {t('common.wallet.connect-your-wallet')}
                </MarketButton>
            );
        }
        if (insufficientBalance && !isResolverBondDeposited) {
            return <MarketButton disabled={true}>{t(`common.errors.insufficient-balance`)}</MarketButton>;
        }
        if (!isOutcomePositionSelected) {
            return <MarketButton disabled={true}>{t(`common.errors.select-position`)}</MarketButton>;
        }
        if (!hasAllowance && !isResolverBondDeposited) {
            return (
                <MarketButton disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                    {!isAllowing
                        ? t('common.enable-wallet-access.approve-label', { currencyKey: PAYMENT_CURRENCY })
                        : t('common.enable-wallet-access.approve-progress-label', {
                              currencyKey: PAYMENT_CURRENCY,
                          })}
                </MarketButton>
            );
        }
        return (
            <MarketButton disabled={isButtonDisabled} onClick={handleSubmit}>
                {!isSubmitting
                    ? t('market.button.resolve-market-label')
                    : t('market.button.resolve-market-progress-label')}
            </MarketButton>
        );
    };

    return (
        <Container>
            <Title>{t('market.resolve-market.title')}:</Title>
            <Positions>
                {outcomePositions.map((position: string, index: number) => {
                    const positionIndex = (index + 1) % outcomePositions.length;
                    return (
                        <RadioButton
                            checked={positionIndex === outcomePosition}
                            value={positionIndex}
                            onChange={() => setOutcomePosition(positionIndex)}
                            label={position}
                            disabled={isSubmitting}
                            key={position}
                            tooltip={positionIndex === 0 ? t('market.resolve-market.cancel-tooltip') : undefined}
                        />
                    );
                })}
            </Positions>
            <ButtonContainer>
                <BondInfo>
                    <Trans
                        i18nKey={
                            isResolverBondDeposited
                                ? 'market.resolve-market.creator-bond-info'
                                : 'market.resolve-market.bond-info'
                        }
                        components={[
                            <ul key="1">
                                <li key="0" />
                            </ul>,
                        ]}
                        values={{
                            amount: formatCurrencyWithKey(
                                PAYMENT_CURRENCY,
                                fixedBondAmount,
                                DEFAULT_CURRENCY_DECIMALS,
                                true
                            ),
                            resolverPercentage,
                        }}
                    />
                </BondInfo>
                {getSubmitButton()}
            </ButtonContainer>
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={fixedBondAmount}
                    tokenSymbol={PAYMENT_CURRENCY}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    margin-top: 40px;
    align-items: center;
    border: 2px solid ${(props) => props.theme.borderColor.primary};
    border-radius: 25px;
    flex: initial;
    padding: 30px 20px 40px 20px;
    width: 100%;
`;

const Title = styled(FlexDivColumn)`
    align-items: center;
    font-style: normal;
    font-weight: bold;
    font-size: 25px;
    line-height: 100%;
    text-align: center;
    margin-bottom: 35px;
`;

const Positions = styled(FlexDivColumn)`
    label {
        align-self: start;
    }
`;

const MarketButton = styled(Button)``;

const ButtonContainer = styled(FlexDivColumn)`
    margin: 40px 0 0 0;
    align-items: center;
`;

export default ResolveMarket;
