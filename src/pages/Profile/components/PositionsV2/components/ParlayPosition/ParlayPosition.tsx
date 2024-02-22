import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button/Button';
import CollateralSelector from 'components/CollateralSelector';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { USD_SIGN } from 'constants/currency';
import { APPROVAL_BUFFER } from 'constants/markets';
import { ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import { ShareTicketModalProps } from 'pages/Markets/Home/Parlay/components/ShareTicketModal/ShareTicketModal';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getParlayPayment } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import {
    getIsAA,
    getIsConnectedViaParticle,
    getIsWalletConnected,
    getNetworkId,
    getWalletAddress,
} from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { useTheme } from 'styled-components';
import { coinParser, formatCurrencyWithSign, getEtherscanTxLink, truncateAddress } from 'thales-utils';
import { Ticket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { executeBiconomyTransaction } from 'utils/biconomy';
import { getCollateral, getCollateralAddress, getCollaterals, getDefaultCollateral } from 'utils/collaterals';
import { checkAllowance, getIsMultiCollateralSupported } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { formatParlayOdds } from 'utils/parlay';
import { CollateralSelectorContainer } from '../../../Positions/components/SinglePosition/styled-components';
import {
    ClaimContainer,
    ClaimLabel,
    ClaimValue,
    ExternalLink,
    ExternalLinkArrow,
    ExternalLinkContainer,
    Label,
    PayoutLabel,
    additionalClaimButtonStyle,
    additionalClaimButtonStyleMobile,
} from '../../styled-components';
import ParlayItem from './components/ParlayItem';
import {
    ArrowIcon,
    CollapsableContainer,
    CollapseFooterContainer,
    Container,
    Divider,
    InfoContainer,
    InfoContainerColumn,
    OverviewContainer,
    ParlayDetailContainer,
    ProfitContainer,
    TicketId,
    TicketIdContainer,
    TotalQuoteContainer,
    Value,
    WinLabel,
    WinValue,
} from './styled-components';

type ParlayPosition = {
    ticket: Ticket;
    setShareTicketModalData?: (shareTicketData: ShareTicketModalProps) => void;
    setShowShareTicketModal?: (show: boolean) => void;
};

const ParlayPosition: React.FC<ParlayPosition> = ({ ticket, setShareTicketModalData, setShowShareTicketModal }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isAA = useSelector((state: RootState) => getIsAA(state));
    const isParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const parlayPayment = useSelector(getParlayPayment);
    const selectedCollateralIndex = parlayPayment.selectedCollateralIndex;

    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [hasAllowance, setHasAllowance] = useState(false);
    const [isAllowing, setIsAllowing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openApprovalModal, setOpenApprovalModal] = useState(false);

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const collateralAddress = useMemo(() => getCollateralAddress(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);

    const isDefaultCollateral = selectedCollateral === defaultCollateral;
    const isEth = collateralAddress === ZERO_ADDRESS;

    const isClaimable = ticket.isUserTheWinner && !ticket.isResolved;

    const NUMBER_OF_GAMES = ticket.sportMarkets.length;

    useEffect(() => {
        const { parlayMarketsAMMContract, sUSDContract, signer } = networkConnector;
        if (parlayMarketsAMMContract && signer && sUSDContract) {
            const collateralContractWithSigner = sUSDContract?.connect(signer);
            const addressToApprove = parlayMarketsAMMContract.address;

            const getAllowance = async () => {
                try {
                    const parsedAmount = coinParser(Number(ticket.payout).toString(), networkId);
                    const allowance = await checkAllowance(
                        parsedAmount,
                        collateralContractWithSigner,
                        walletAddress,
                        addressToApprove
                    );
                    setHasAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
            };
            if (isWalletConnected && isClaimable && isMultiCollateralSupported && !isDefaultCollateral) {
                getAllowance();
            }
        }
    }, [
        walletAddress,
        isWalletConnected,
        hasAllowance,
        isAllowing,
        selectedCollateralIndex,
        networkId,
        selectedCollateral,
        isEth,
        isClaimable,
        isMultiCollateralSupported,
        ticket.payout,
        isDefaultCollateral,
    ]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { parlayMarketsAMMContract, sUSDContract, signer } = networkConnector;
        if (parlayMarketsAMMContract && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                let txResult;
                const collateralContractWithSigner = sUSDContract?.connect(signer);
                const addressToApprove = parlayMarketsAMMContract.address;

                if (isAA) {
                    txResult = await executeBiconomyTransaction(
                        collateralAddress,
                        collateralContractWithSigner,
                        'approve',
                        [addressToApprove, approveAmount]
                    );
                } else {
                    const tx = (await collateralContractWithSigner?.approve(
                        addressToApprove,
                        approveAmount
                    )) as ethers.ContractTransaction;
                    setOpenApprovalModal(false);
                    txResult = await tx.wait();
                }

                if (txResult && txResult.transactionHash) {
                    setIsAllowing(false);
                    claimParlay(ticket.id);
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.approve-success')));
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
                setIsAllowing(false);
            }
        }
    };

    const claimParlay = async (parlayAddress: string) => {
        const id = toast.loading(t('market.toast-message.transaction-pending'));
        const { parlayMarketsAMMContract, signer } = networkConnector;
        if (signer && parlayMarketsAMMContract) {
            setIsSubmitting(true);
            try {
                let txResult;
                const parlayMarketsAMMContractWithSigner = parlayMarketsAMMContract.connect(signer);
                if (isAA) {
                    txResult = isDefaultCollateral
                        ? await executeBiconomyTransaction(
                              collateralAddress,
                              parlayMarketsAMMContractWithSigner,
                              'exerciseParlay',
                              [parlayAddress]
                          )
                        : await executeBiconomyTransaction(
                              collateralAddress,
                              parlayMarketsAMMContractWithSigner,
                              'exerciseParlayWithOfframp',
                              [parlayAddress, collateralAddress, isEth]
                          );
                } else {
                    const tx = isDefaultCollateral
                        ? await parlayMarketsAMMContractWithSigner?.exerciseParlay(parlayAddress)
                        : await parlayMarketsAMMContractWithSigner?.exerciseParlayWithOfframp(
                              parlayAddress,
                              collateralAddress,
                              isEth
                          );
                    txResult = await tx.wait();
                }

                if (txResult && txResult.transactionHash) {
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.claim-winnings-success')));
                    if (setShareTicketModalData && setShowShareTicketModal) {
                        // setShareTicketModalData(shareParlayData);
                        setShowShareTicketModal(true);
                    }
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
            }
            setIsSubmitting(false);
        }
    };

    // const shareParlayData = {
    //     markets: ticket.sportMarkets.map((market: TicketMarket) => {
    //         return {
    //             ...market,
    //             odds: market.odds.map((odd) => (market.isCanceled ? 1 : odd)),
    //             winning: isClaimable,
    //         } as TicketMarket;
    //     }),
    //     multiSingle: false,
    //     totalQuote: getParlayQuote(ticket.buyInAmount, ticket.payout),
    //     paid: ticket.buyInAmount,
    //     payout: ticket.payout,
    //     onClose: () => {
    //         refetchAfterClaim(walletAddress, networkId);
    //         setShowShareTicketModal ? setShowShareTicketModal(false) : null;
    //     },
    // };

    const getClaimButton = (isMobile: boolean) => (
        <Button
            disabled={isSubmitting || isAllowing}
            backgroundColor={theme.button.background.quaternary}
            borderColor={theme.button.borderColor.secondary}
            additionalStyles={isMobile ? additionalClaimButtonStyleMobile : additionalClaimButtonStyle}
            padding="2px 5px"
            fontSize={isMobile ? '9px' : hasAllowance || isDefaultCollateral ? '15px' : '10px'}
            height={isMobile ? '19px' : undefined}
            lineHeight={hasAllowance || isDefaultCollateral ? undefined : '10px'}
            onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                hasAllowance || isDefaultCollateral
                    ? claimParlay(ticket.id)
                    : isParticle
                    ? handleAllowance(ethers.constants.MaxUint256)
                    : setOpenApprovalModal(true);
            }}
        >
            {hasAllowance || isDefaultCollateral
                ? isSubmitting
                    ? t('profile.card.claim-progress')
                    : t('profile.card.claim')
                : isAllowing
                ? t('common.enable-wallet-access.approve-progress')
                : t('common.enable-wallet-access.approve-swap', {
                      currencyKey: selectedCollateral,
                      defaultCurrency: defaultCollateral,
                  })}
        </Button>
    );

    const getButton = (isMobile: boolean) => {
        return hasAllowance || isDefaultCollateral ? (
            getClaimButton(isMobile)
        ) : (
            <Tooltip
                overlay={t('profile.card.approve-swap-tooltip', {
                    currencyKey: selectedCollateral,
                    defaultCurrency: defaultCollateral,
                })}
                component={<div>{getClaimButton(isMobile)}</div>}
            />
        );
    };

    return (
        <Container>
            <OverviewContainer onClick={() => setShowDetails(!showDetails)}>
                <ArrowIcon className={showDetails ? 'icon icon--arrow-up' : 'icon icon--arrow-down'} />
                <TicketIdContainer>
                    <Label>{t('profile.card.ticket-id')}:</Label>
                    <TicketId>{truncateAddress(ticket.id)}</TicketId>
                </TicketIdContainer>
                <InfoContainer>
                    <Label>{t('profile.card.number-of-games')}:</Label>
                    <Value>{NUMBER_OF_GAMES}</Value>
                </InfoContainer>
                <InfoContainerColumn>
                    <Label>{t('profile.card.ticket-paid')}:</Label>
                    <Value>{formatCurrencyWithSign(USD_SIGN, ticket.buyInAmount)}</Value>
                </InfoContainerColumn>
                {isMobile && !isClaimable && (
                    <InfoContainerColumn>
                        <WinLabel>{t('profile.card.to-win')}:</WinLabel>
                        <WinValue>{formatCurrencyWithSign(USD_SIGN, ticket.payout)}</WinValue>
                    </InfoContainerColumn>
                )}
                {!isMobile && (
                    <>
                        <InfoContainerColumn>
                            {isClaimable ? (
                                <ClaimLabel>{t('profile.card.to-claim')}:</ClaimLabel>
                            ) : (
                                <WinLabel>{t('profile.card.to-win')}:</WinLabel>
                            )}
                            {isClaimable ? (
                                <ClaimValue>{formatCurrencyWithSign(USD_SIGN, ticket.payout)}</ClaimValue>
                            ) : (
                                <WinValue>{formatCurrencyWithSign(USD_SIGN, ticket.payout)}</WinValue>
                            )}
                        </InfoContainerColumn>
                        {isClaimable && isMultiCollateralSupported && (
                            <InfoContainerColumn
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <PayoutLabel>{t('profile.card.payout-in')}:</PayoutLabel>
                                <CollateralSelector
                                    collateralArray={getCollaterals(networkId)}
                                    selectedItem={selectedCollateralIndex}
                                    onChangeCollateral={() => {}}
                                />
                            </InfoContainerColumn>
                        )}
                    </>
                )}
                {isMobile && isClaimable && (
                    <ClaimContainer>
                        <ClaimValue>{formatCurrencyWithSign(USD_SIGN, ticket.payout)}</ClaimValue>
                        {getButton(isMobile)}
                        {isMultiCollateralSupported && (
                            <CollateralSelectorContainer>
                                <PayoutLabel>{t('profile.card.payout-in')}:</PayoutLabel>
                                <CollateralSelector
                                    collateralArray={getCollaterals(networkId)}
                                    selectedItem={selectedCollateralIndex}
                                    onChangeCollateral={() => {}}
                                />
                            </CollateralSelectorContainer>
                        )}
                    </ClaimContainer>
                )}
                {isClaimable && !isMobile && getButton(isMobile)}
                {!isClaimable && (
                    <ExternalLink href={getEtherscanTxLink(networkId, ticket.txHash)} target={'_blank'}>
                        <ExternalLinkContainer>
                            <ExternalLinkArrow style={{ right: '7px' }} />
                        </ExternalLinkContainer>
                    </ExternalLink>
                )}
            </OverviewContainer>
            <CollapsableContainer show={showDetails}>
                <Divider />
                <ParlayDetailContainer>
                    {ticket.sportMarkets.map((market, index) => {
                        return <ParlayItem market={market} key={index} />;
                    })}
                </ParlayDetailContainer>
                <CollapseFooterContainer>
                    <TotalQuoteContainer>
                        <Label>{t('profile.card.total-quote')}:</Label>
                        <Value>{formatParlayOdds(selectedOddsType, ticket.buyInAmount, ticket.payout)}</Value>
                    </TotalQuoteContainer>
                    <ProfitContainer>
                        {isClaimable ? (
                            <ClaimLabel>{t('profile.card.to-claim')}:</ClaimLabel>
                        ) : (
                            <WinLabel>{t('profile.card.to-win')}:</WinLabel>
                        )}
                        {isClaimable ? (
                            <ClaimValue>{formatCurrencyWithSign(USD_SIGN, ticket.payout)}</ClaimValue>
                        ) : (
                            <WinValue>{formatCurrencyWithSign(USD_SIGN, ticket.payout)}</WinValue>
                        )}
                    </ProfitContainer>
                </CollapseFooterContainer>
            </CollapsableContainer>
            {openApprovalModal && (
                <ApprovalModal
                    // ADDING 1% TO ENSURE TRANSACTIONS PASSES DUE TO CALCULATION DEVIATIONS
                    defaultAmount={Number(ticket.payout) * (1 + APPROVAL_BUFFER)}
                    tokenSymbol={defaultCollateral}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </Container>
    );
};

export default ParlayPosition;
