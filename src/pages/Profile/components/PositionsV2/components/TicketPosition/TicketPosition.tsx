import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button/Button';
import CollateralSelector from 'components/CollateralSelector';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { APPROVAL_BUFFER } from 'constants/markets';
import { ZERO_ADDRESS } from 'constants/network';
import { BigNumber, ethers } from 'ethers';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
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
import { coinParser, formatCurrencyWithKey, getEtherscanAddressLink, truncateAddress } from 'thales-utils';
import { Ticket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { executeBiconomyTransaction } from 'utils/biconomy';
import { getCollateral, getCollateralAddress, getCollaterals, getDefaultCollateral } from 'utils/collaterals';
import { checkAllowance, getIsMultiCollateralSupported } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { getTicketPayment } from '../../../../../../redux/modules/ticket';
import { refetchAfterClaim } from '../../../../../../utils/queryConnector';
import { formatTicketOdds, getTicketMarketOdd } from '../../../../../../utils/tickets';
import { ShareTicketModalProps } from '../../../../../Markets/Home/Parlay/components/ShareTicketModalV2/ShareTicketModalV2';
import { CollateralSelectorContainer } from '../../../Positions/components/SinglePosition/styled-components';
import {
    ClaimContainer,
    ClaimLabel,
    ClaimValue,
    ExternalLink,
    PayoutLabel,
    additionalClaimButtonStyle,
    additionalClaimButtonStyleMobile,
} from '../../styled-components';
import TicketItem from './components/TicketItem';
import {
    ArrowIcon,
    CollapsableContainer,
    CollapseFooterContainer,
    Container,
    InfoContainerColumn,
    Label,
    NumberOfGamesContainer,
    OverviewContainer,
    ProfitContainer,
    TicketIdContainer,
    TicketMarketsContainer,
    TotalQuoteContainer,
    Value,
    WinLabel,
    WinValue,
} from './styled-components';

type TicketPositionProps = {
    ticket: Ticket;
    setShareTicketModalData?: (shareTicketData: ShareTicketModalProps) => void;
    setShowShareTicketModal?: (show: boolean) => void;
};

const TicketPosition: React.FC<TicketPositionProps> = ({
    ticket,
    setShareTicketModalData,
    setShowShareTicketModal,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isAA = useSelector((state: RootState) => getIsAA(state));
    const isParticle = useSelector((state: RootState) => getIsConnectedViaParticle(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const ticketPayment = useSelector(getTicketPayment);
    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;

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

    const isClaimable = ticket.isClaimable;

    useEffect(() => {
        const { sportsAMMV2Contract, sUSDContract, signer } = networkConnector;
        if (sportsAMMV2Contract && signer && sUSDContract) {
            const collateralContractWithSigner = sUSDContract?.connect(signer);
            const addressToApprove = sportsAMMV2Contract.address;

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
        const { sportsAMMV2Contract, sUSDContract, signer } = networkConnector;
        if (sportsAMMV2Contract && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                let txResult;
                const collateralContractWithSigner = sUSDContract?.connect(signer);
                const addressToApprove = sportsAMMV2Contract.address;

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
                    claimTicket(ticket.id);
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.approve-success')));
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
                setIsAllowing(false);
            }
        }
    };

    const claimTicket = async (parlayAddress: string) => {
        const id = toast.loading(t('market.toast-message.transaction-pending'));
        const { sportsAMMV2Contract, signer } = networkConnector;
        if (signer && sportsAMMV2Contract) {
            setIsSubmitting(true);
            try {
                let txResult;
                const sportsAMMV2ContractWithSigner = sportsAMMV2Contract.connect(signer);
                if (isAA) {
                    txResult = isDefaultCollateral
                        ? await executeBiconomyTransaction(
                              collateralAddress,
                              sportsAMMV2ContractWithSigner,
                              'exerciseTicket',
                              [parlayAddress]
                          )
                        : await executeBiconomyTransaction(
                              collateralAddress,
                              sportsAMMV2ContractWithSigner,
                              'exerciseTicketWithOfframp',
                              [parlayAddress, collateralAddress, isEth]
                          );
                } else {
                    const tx = isDefaultCollateral
                        ? await sportsAMMV2ContractWithSigner?.exerciseTicket(parlayAddress)
                        : await sportsAMMV2ContractWithSigner?.exerciseTicketWithOfframp(
                              parlayAddress,
                              collateralAddress,
                              isEth
                          );
                    txResult = await tx.wait();
                }

                if (txResult && txResult.transactionHash) {
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.claim-winnings-success')));
                    if (setShareTicketModalData && setShowShareTicketModal) {
                        setShareTicketModalData(shareParlayData);
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

    const shareParlayData = {
        markets: ticket.sportMarkets.map((sportMarket) => {
            return {
                ...sportMarket,
                odd: getTicketMarketOdd(sportMarket),
            };
        }),
        paid: ticket.buyInAmount,
        payout: ticket.payout,
        multiSingle: false,
        onClose: () => {
            refetchAfterClaim(walletAddress, networkId);
            setShowShareTicketModal ? setShowShareTicketModal(false) : null;
        },
        isTicketLost: ticket.isLost,
        isTicketResolved: !ticket.isOpen,
    };

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
                    ? claimTicket(ticket.id)
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
                <ExternalLink href={getEtherscanAddressLink(networkId, ticket.id)} target={'_blank'}>
                    <TicketIdContainer>
                        <Label>{t('profile.card.ticket-id')}:</Label>
                        <Value>{truncateAddress(ticket.id)}</Value>
                    </TicketIdContainer>
                </ExternalLink>
                <NumberOfGamesContainer>
                    <Label>{t('profile.card.number-of-games')}:</Label>
                    <Value>{ticket.numOfMarkets}</Value>
                </NumberOfGamesContainer>
                <InfoContainerColumn>
                    <Label>{t('profile.card.ticket-paid')}:</Label>
                    <Value>{formatCurrencyWithKey(ticket.collateral, ticket.buyInAmount)}</Value>
                </InfoContainerColumn>
                {isMobile && !isClaimable && (
                    <InfoContainerColumn>
                        <WinLabel>{t('profile.card.to-win')}:</WinLabel>
                        <WinValue>{formatCurrencyWithKey(ticket.collateral, ticket.payout)}</WinValue>
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
                                <ClaimValue>{formatCurrencyWithKey(ticket.collateral, ticket.payout)}</ClaimValue>
                            ) : (
                                <WinValue>{formatCurrencyWithKey(ticket.collateral, ticket.payout)}</WinValue>
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
                        <ClaimValue>{formatCurrencyWithKey(ticket.collateral, ticket.payout)}</ClaimValue>
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
                <ArrowIcon className={showDetails ? 'icon icon--arrow-up' : 'icon icon--arrow-down'} />
            </OverviewContainer>
            <CollapsableContainer show={showDetails}>
                <TicketMarketsContainer>
                    {ticket.sportMarkets.map((market, index) => {
                        return <TicketItem market={market} key={index} />;
                    })}
                </TicketMarketsContainer>
                <CollapseFooterContainer>
                    <TotalQuoteContainer>
                        <Label>{t('profile.card.total-quote')}:</Label>
                        <Value>{formatTicketOdds(selectedOddsType, ticket.buyInAmount, ticket.payout)}</Value>
                    </TotalQuoteContainer>
                    <ProfitContainer>
                        {isClaimable ? (
                            <ClaimLabel>{t('profile.card.to-claim')}:</ClaimLabel>
                        ) : (
                            <WinLabel>{t('profile.card.to-win')}:</WinLabel>
                        )}
                        {isClaimable ? (
                            <ClaimValue>{formatCurrencyWithKey(ticket.collateral, ticket.payout)}</ClaimValue>
                        ) : (
                            <WinValue>{formatCurrencyWithKey(ticket.collateral, ticket.payout)}</WinValue>
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

export default TicketPosition;
