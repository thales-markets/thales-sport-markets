import Button from 'components/Button';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { MarketData, MarketsParameters } from 'types/markets';
import { formatCurrencyWithKey, formatPercentage } from 'utils/formatters/number';
import { PAYMENT_CURRENCY, DEFAULT_CURRENCY_DECIMALS } from 'constants/currency';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { checkAllowance } from 'utils/network';
import { BigNumber, ethers } from 'ethers';
import networkConnector from 'utils/networkConnector';
import { MAX_GAS_LIMIT } from 'constants/network';
import ApprovalModal from 'components/ApprovalModal';
import marketContract from 'utils/contracts/exoticPositionalTicketMarketContract';
import usePaymentTokenBalanceQuery from 'queries/wallet/usePaymentTokenBalanceQuery';
import onboardConnector from 'utils/onboardConnector';
import useAccountMarketTicketDataQuery from 'queries/markets/useAccountMarketTicketDataQuery';
import { toast } from 'react-toastify';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { getRoi } from 'utils/markets';
import { Info, InfoContent, InfoLabel, MainInfo, PositionContainer, PositionLabel, Positions } from 'components/common';
import useMarketsParametersQuery from 'queries/markets/useMarketsParametersQuery';
import Tooltip from 'components/Tooltip';
import { refetchMarketData } from 'utils/queryConnector';

type PositioningPhaseTicketProps = {
    market: MarketData;
};

const PositioningPhaseTicket: React.FC<PositioningPhaseTicketProps> = ({ market }) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const [hasAllowance, setAllowance] = useState<boolean>(false);
    const [isAllowing, setIsAllowing] = useState<boolean>(false);
    const [isBidding, setIsBidding] = useState<boolean>(false);
    const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
    const [isCanceling, setIsCanceling] = useState<boolean>(false);
    const [openApprovalModal, setOpenApprovalModal] = useState<boolean>(false);
    const [paymentTokenBalance, setPaymentTokenBalance] = useState<number | string>('');
    const [selectedPosition, setSelectedPosition] = useState<number>(0);
    // we need two positionOnContract, one is set on success, the second one only from query
    const [currentPositionOnContract, setCurrentPositionOnContract] = useState<number>(0);
    const [positionOnContract, setPositionOnContract] = useState<number>(0);
    const [winningAmount, setWinningAmount] = useState<number>(0);
    const [canWithdraw, setCanWithdraw] = useState<boolean>(false);
    const [marketsParameters, setMarketsParameters] = useState<MarketsParameters | undefined>(undefined);

    const accountMarketDataQuery = useAccountMarketTicketDataQuery(market.address, walletAddress, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (accountMarketDataQuery.isSuccess && accountMarketDataQuery.data) {
            setCurrentPositionOnContract(accountMarketDataQuery.data.position);
            setPositionOnContract(accountMarketDataQuery.data.position);
            setWinningAmount(accountMarketDataQuery.data.winningAmount);
            setSelectedPosition(accountMarketDataQuery.data.position);
            setCanWithdraw(accountMarketDataQuery.data.canWithdraw);
        }
    }, [accountMarketDataQuery.isSuccess, accountMarketDataQuery.data]);

    const paymentTokenBalanceQuery = usePaymentTokenBalanceQuery(walletAddress, networkId, {
        enabled: isAppReady && isWalletConnected,
    });

    useEffect(() => {
        if (paymentTokenBalanceQuery.isSuccess && paymentTokenBalanceQuery.data !== undefined) {
            setPaymentTokenBalance(paymentTokenBalanceQuery.data);
        }
    }, [paymentTokenBalanceQuery.isSuccess, paymentTokenBalanceQuery.data]);

    const marketsParametersQuery = useMarketsParametersQuery(networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (marketsParametersQuery.isSuccess && marketsParametersQuery.data) {
            setMarketsParameters(marketsParametersQuery.data);
        }
    }, [marketsParametersQuery.isSuccess, marketsParametersQuery.data]);

    const creatorPercentage = marketsParameters ? marketsParameters.creatorPercentage : 0;
    const resolverPercentage = marketsParameters ? marketsParameters.resolverPercentage : 0;
    const safeBoxPercentage = marketsParameters ? marketsParameters.safeBoxPercentage : 0;
    const bidPercentage = creatorPercentage + resolverPercentage + safeBoxPercentage;
    const withdrawalPercentage = marketsParameters ? marketsParameters.withdrawalPercentage : 0;

    const showTicketInfo = market.canUsersPlacePosition;
    const showTicketBid = showTicketInfo && currentPositionOnContract === 0;
    const showTicketChangePosition = showTicketInfo && currentPositionOnContract !== selectedPosition;
    const showTicketWithdraw = showTicketInfo && canWithdraw && currentPositionOnContract > 0;
    const showCancel = market.canCreatorCancelMarket && walletAddress.toLowerCase() === market.creator.toLowerCase();

    const insufficientBalance =
        Number(paymentTokenBalance) < Number(market.ticketPrice) || Number(paymentTokenBalance) === 0;
    const isPositionSelected = selectedPosition > 0;

    const isBidButtonDisabled =
        isBidding ||
        isWithdrawing ||
        isCanceling ||
        !isWalletConnected ||
        !hasAllowance ||
        insufficientBalance ||
        !isPositionSelected;
    const isChangePositionButtonDisabled =
        isBidding || isWithdrawing || isCanceling || !isWalletConnected || !isPositionSelected;
    const isWithdrawButtonDisabled = isBidding || isWithdrawing || isCanceling || !isWalletConnected;
    const isCancelButtonDisabled = isBidding || isWithdrawing || isCanceling || !isWalletConnected;

    useEffect(() => {
        const { paymentTokenContract, thalesBondsContract, signer } = networkConnector;
        if (paymentTokenContract && thalesBondsContract && signer) {
            const paymentTokenContractWithSigner = paymentTokenContract.connect(signer);
            const addressToApprove = thalesBondsContract.address;
            const getAllowance = async () => {
                try {
                    const parsedTicketPrice = ethers.utils.parseEther(Number(market.ticketPrice).toString());
                    const allowance = await checkAllowance(
                        parsedTicketPrice,
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
    }, [walletAddress, isWalletConnected, hasAllowance, market.ticketPrice, isAllowing, isBidding, isWithdrawing]);

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

    const handleBid = async () => {
        const { signer } = networkConnector;
        if (signer) {
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            setIsBidding(true);

            try {
                const marketContractWithSigner = new ethers.Contract(market.address, marketContract.abi, signer);

                const tx = await marketContractWithSigner.takeAPosition(selectedPosition);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    refetchMarketData(market.address, walletAddress);
                    toast.update(
                        id,
                        getSuccessToastOptions(
                            t(
                                `market.toast-messsage.${
                                    showTicketBid ? 'ticket-bid-success' : 'change-position-success'
                                }`
                            )
                        )
                    );
                    setIsBidding(false);
                    setCurrentPositionOnContract(selectedPosition);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsBidding(false);
            }
        }
    };

    const handleWithdraw = async () => {
        const { signer } = networkConnector;
        if (signer) {
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            setIsWithdrawing(true);

            try {
                const marketContractWithSigner = new ethers.Contract(market.address, marketContract.abi, signer);

                const tx = await marketContractWithSigner.withdraw();
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    refetchMarketData(market.address, walletAddress);
                    toast.update(id, getSuccessToastOptions(t('market.toast-messsage.withdraw-success')));
                    setIsWithdrawing(false);
                    setCurrentPositionOnContract(0);
                    setSelectedPosition(0);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsWithdrawing(false);
            }
        }
    };

    const handleCancel = async () => {
        const { marketManagerContract, signer } = networkConnector;
        if (marketManagerContract && signer) {
            const id = toast.loading(t('market.toast-messsage.transaction-pending'));
            setIsCanceling(true);

            try {
                const marketManagerContractWithSigner = marketManagerContract.connect(signer);

                const tx = await marketManagerContractWithSigner.cancelMarket(market.address);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    refetchMarketData(market.address, walletAddress);
                    toast.update(id, getSuccessToastOptions(t('market.toast-messsage.cancel-market-success')));
                    setIsCanceling(false);
                }
            } catch (e) {
                console.log(e);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsCanceling(false);
            }
        }
    };

    const getButtons = () => {
        if (!isWalletConnected) {
            return (
                <MarketButton type="secondary" onClick={() => onboardConnector.connectWallet()}>
                    {t('common.wallet.connect-your-wallet')}
                </MarketButton>
            );
        }
        if (insufficientBalance && showTicketBid) {
            return (
                <MarketButton type="secondary" disabled={true}>
                    {t(`common.errors.insufficient-balance`)}
                </MarketButton>
            );
        }
        if (!isPositionSelected) {
            return (
                <MarketButton type="secondary" disabled={true}>
                    {t(`common.errors.select-position`)}
                </MarketButton>
            );
        }
        if (!hasAllowance && showTicketBid) {
            return (
                <MarketButton type="secondary" disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                    {!isAllowing
                        ? t('common.enable-wallet-access.approve-label', { currencyKey: PAYMENT_CURRENCY })
                        : t('common.enable-wallet-access.approve-progress-label', {
                              currencyKey: PAYMENT_CURRENCY,
                          })}
                </MarketButton>
            );
        }
        if (showTicketBid) {
            return (
                <MarketButton type="secondary" disabled={isBidButtonDisabled} onClick={handleBid}>
                    {!isBidding ? t('market.button.bid-label') : t('market.button.bid-progress-label')}
                </MarketButton>
            );
        }
        return (
            <>
                {showTicketChangePosition && (
                    <MarketButton type="secondary" disabled={isChangePositionButtonDisabled} onClick={handleBid}>
                        {!isBidding
                            ? t('market.button.change-position-label')
                            : t('market.button.change-position-progress-label')}
                    </MarketButton>
                )}
                {showTicketWithdraw && (
                    <MarketButton type="secondary" disabled={isWithdrawButtonDisabled} onClick={handleWithdraw}>
                        {!isWithdrawing
                            ? t('market.button.withdraw-label')
                            : t('market.button.withdraw-progress-label')}
                    </MarketButton>
                )}
            </>
        );
    };

    return (
        <>
            <Positions>
                {market.positions.map((position: string, index: number) => (
                    <PositionContainer
                        key={position}
                        className={`${isBidding || isWithdrawing ? 'disabled' : ''} ${
                            index + 1 === selectedPosition ? 'selected' : ''
                        }`}
                        onClick={() => setSelectedPosition(index + 1)}
                    >
                        <PositionLabel>{position}</PositionLabel>
                        <Info>
                            <InfoLabel>{t('market.pool-size-label')}:</InfoLabel>
                            <InfoContent>
                                {formatCurrencyWithKey(
                                    PAYMENT_CURRENCY,
                                    market.poolSizePerPosition[index],
                                    DEFAULT_CURRENCY_DECIMALS,
                                    true
                                )}
                            </InfoContent>
                        </Info>
                        <Info>
                            <InfoLabel>{t('market.roi-label')}:</InfoLabel>
                            <InfoContent>
                                {formatPercentage(
                                    getRoi(
                                        market.ticketPrice,
                                        positionOnContract === 0
                                            ? market.fixedMarketData
                                                ? market.fixedMarketData.winningAmountsNewUser[index]
                                                : 0
                                            : positionOnContract === index + 1
                                            ? winningAmount
                                            : market.fixedMarketData
                                            ? market.fixedMarketData.winningAmountsNoPosition[index]
                                            : 0,
                                        true
                                    )
                                )}
                            </InfoContent>
                            <Tooltip overlay={<RoiOverlayContainer>{t('market.roi-tooltip')}</RoiOverlayContainer>} />
                        </Info>
                    </PositionContainer>
                ))}
            </Positions>
            {showTicketInfo && (
                <>
                    <MainInfo>
                        {t('market.ticket-price-label')}:{' '}
                        {formatCurrencyWithKey(PAYMENT_CURRENCY, market.ticketPrice, DEFAULT_CURRENCY_DECIMALS, true)}
                    </MainInfo>
                    <Info>
                        <InfoLabel>{t('market.bid-fee-label')}:</InfoLabel>
                        <InfoContent>{bidPercentage}%</InfoContent>
                        <Tooltip
                            overlay={
                                <FeesOverlayContainer>
                                    <Trans
                                        i18nKey="market.bid-fee-tooltip"
                                        components={[<div key="1" />, <span key="2" />]}
                                        values={{
                                            bidPercentage,
                                            creatorPercentage,
                                            resolverPercentage,
                                            safeBoxPercentage,
                                        }}
                                    />
                                </FeesOverlayContainer>
                            }
                        />
                    </Info>
                    {market.isWithdrawalAllowed ? (
                        <Info>
                            <InfoLabel>{t('market.withdrawal-fee-label')}:</InfoLabel>
                            <InfoContent>{withdrawalPercentage}%</InfoContent>
                            <Tooltip
                                overlay={
                                    <FeesOverlayContainer>
                                        <Trans
                                            i18nKey="market.withdrawal-fee-tooltip"
                                            components={[<div key="1" />, <span key="2" />]}
                                            values={{
                                                withdrawalPercentage,
                                                creatorPercentage: withdrawalPercentage / 2,
                                                safeBoxPercentage: withdrawalPercentage / 2,
                                            }}
                                        />
                                    </FeesOverlayContainer>
                                }
                            />
                        </Info>
                    ) : (
                        <Info>{t('market.withdrawal-not-allowed')}</Info>
                    )}
                </>
            )}
            <ButtonContainer>
                {getButtons()}
                {showCancel && (
                    <MarketButton type="secondary" disabled={isCancelButtonDisabled} onClick={handleCancel}>
                        {!isCanceling
                            ? t('market.button.cancel-market-label')
                            : t('market.button.cancel-progress-label')}
                    </MarketButton>
                )}
            </ButtonContainer>
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={market.ticketPrice}
                    tokenSymbol={PAYMENT_CURRENCY}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </>
    );
};

const ButtonContainer = styled(FlexDivColumn)`
    margin-top: 40px;
    margin-bottom: 40px;
    align-items: center;
`;

const MarketButton = styled(Button)`
    :not(button:last-of-type) {
        margin-bottom: 10px;
    }
`;

const FeesOverlayContainer = styled(FlexDivColumn)`
    text-align: start;
    div {
        margin-bottom: 5px;
    }
    span {
        :last-of-type {
            margin-bottom: 5px;
        }
    }
`;

const RoiOverlayContainer = styled(FlexDivColumn)`
    text-align: justify;
`;

export default PositioningPhaseTicket;
