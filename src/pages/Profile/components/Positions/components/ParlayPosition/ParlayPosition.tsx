import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { USD_SIGN } from 'constants/currency';
import { ShareTicketModalProps } from 'pages/Markets/Home/Parlay/components/ShareTicketModal/ShareTicketModal';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { ParlayMarket, ParlaysMarket } from 'types/markets';
import { getEtherscanTxLink, formatCurrencyWithSign, truncateAddress, coinParser } from 'thales-utils';
import {
    convertPositionNameToPosition,
    convertPositionNameToPositionType,
    formatMarketOdds,
    isParlayClaimable,
    syncPositionsAndMarketsPerContractOrderInParlay,
} from 'utils/markets';
import networkConnector from 'utils/networkConnector';
import { refetchAfterClaim } from 'utils/queryConnector';
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
import {
    extractCombinedMarketsFromParlayMarketType,
    removeCombinedMarketsFromParlayMarketType,
} from 'utils/combinedMarkets';
import ParlayCombinedItem from './components/ParlayCombinedItem';
import { Position } from 'enums/markets';
import Button from 'components/Button/Button';
import { ThemeInterface } from 'types/ui';
import { useTheme } from 'styled-components';
import CollateralSelector from 'components/CollateralSelector';
import { getParlayPayment } from 'redux/modules/parlay';
import { checkAllowance, getIsMultiCollateralSupported } from 'utils/network';
import { getCollateral, getCollateralAddress, getCollaterals, getDefaultCollateral } from 'utils/collaterals';
import { ZERO_ADDRESS } from 'constants/network';
import ApprovalModal from 'components/ApprovalModal';
import { BigNumber, ethers } from 'ethers';
import { APPROVAL_BUFFER } from 'constants/markets';
import Tooltip from 'components/Tooltip';
import { CollateralSelectorContainer } from '../SinglePosition/styled-components';

type ParlayPosition = {
    parlayMarket: ParlayMarket;
    setShareTicketModalData?: (shareTicketData: ShareTicketModalProps) => void;
    setShowShareTicketModal?: (show: boolean) => void;
};

const ParlayPosition: React.FC<ParlayPosition> = ({
    parlayMarket,
    setShareTicketModalData,
    setShowShareTicketModal,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
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

    const isClaimable = isParlayClaimable(parlayMarket);

    const parlay = syncPositionsAndMarketsPerContractOrderInParlay(parlayMarket);

    const combinedMarkets = extractCombinedMarketsFromParlayMarketType(parlay);
    const parlayWithoutCombinedMarkets = removeCombinedMarketsFromParlayMarketType(parlay);

    const NUMBER_OF_GAMES = parlayMarket.sportMarkets.length - combinedMarkets.length;

    useEffect(() => {
        const { parlayMarketsAMMContract, sUSDContract, signer } = networkConnector;
        if (parlayMarketsAMMContract && signer && sUSDContract) {
            const collateralContractWithSigner = sUSDContract?.connect(signer);
            const addressToApprove = parlayMarketsAMMContract.address;

            const getAllowance = async () => {
                try {
                    const parsedAmount = coinParser(Number(parlayMarket.totalAmount).toString(), networkId);
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
        parlayMarket.totalAmount,
        isDefaultCollateral,
    ]);

    const handleAllowance = async (approveAmount: BigNumber) => {
        const { parlayMarketsAMMContract, sUSDContract, signer } = networkConnector;
        if (parlayMarketsAMMContract && signer) {
            setIsAllowing(true);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                const collateralContractWithSigner = sUSDContract?.connect(signer);
                const addressToApprove = parlayMarketsAMMContract.address;

                const tx = (await collateralContractWithSigner?.approve(
                    addressToApprove,
                    approveAmount
                )) as ethers.ContractTransaction;
                setOpenApprovalModal(false);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    setIsAllowing(false);
                    claimParlay(parlayMarket.id);
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
                const parlayMarketsAMMContractWithSigner = parlayMarketsAMMContract.connect(signer);

                const tx = isDefaultCollateral
                    ? await parlayMarketsAMMContractWithSigner?.exerciseParlay(parlayAddress)
                    : await parlayMarketsAMMContractWithSigner?.exerciseParlayWithOfframp(
                          parlayAddress,
                          collateralAddress,
                          isEth
                      );
                const txResult = await tx.wait();

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
        markets: parlayMarket.sportMarketsFromContract.map((address, index) => {
            const sportMarket = parlayMarket.sportMarkets.find(
                (market) => market.address.toLowerCase() == address.toLowerCase()
            );
            const position = parlayMarket.positions.find((position) => position.market.address == sportMarket?.address);

            return {
                ...sportMarket,
                ...(convertPositionNameToPositionType(position?.side ? position?.side : '') == Position.HOME && {
                    homeOdds: sportMarket?.isCanceled ? 1 : parlayMarket.marketQuotes[index],
                }),
                ...(convertPositionNameToPositionType(position?.side ? position?.side : '') == Position.AWAY && {
                    awayOdds: sportMarket?.isCanceled ? 1 : parlayMarket.marketQuotes[index],
                }),
                ...(convertPositionNameToPositionType(position?.side ? position?.side : '') == Position.DRAW && {
                    drawOdds: sportMarket?.isCanceled ? 1 : parlayMarket.marketQuotes[index],
                }),
                position: convertPositionNameToPosition(position?.side ? position?.side : ''),
                winning: isParlayClaimable(parlayMarket),
            } as ParlaysMarket;
        }),
        multiSingle: false,
        totalQuote: parlayMarket.totalQuote,
        paid: parlayMarket.sUSDPaid,
        payout: parlayMarket.totalAmount,
        onClose: () => {
            refetchAfterClaim(walletAddress, networkId);
            setShowShareTicketModal ? setShowShareTicketModal(false) : null;
        },
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
                hasAllowance || isDefaultCollateral ? claimParlay(parlayMarket.id) : setOpenApprovalModal(true);
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
                    <TicketId>{truncateAddress(parlayMarket.id)}</TicketId>
                </TicketIdContainer>
                <InfoContainer>
                    <Label>{t('profile.card.number-of-games')}:</Label>
                    <Value>{NUMBER_OF_GAMES}</Value>
                </InfoContainer>
                <InfoContainerColumn>
                    <Label>{t('profile.card.ticket-paid')}:</Label>
                    <Value>{formatCurrencyWithSign(USD_SIGN, parlayMarket.sUSDPaid)}</Value>
                </InfoContainerColumn>
                {isMobile && !isClaimable && (
                    <InfoContainerColumn>
                        <WinLabel>{t('profile.card.to-win')}:</WinLabel>
                        <WinValue>{formatCurrencyWithSign(USD_SIGN, parlayMarket.totalAmount)}</WinValue>
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
                                <ClaimValue>{formatCurrencyWithSign(USD_SIGN, parlayMarket.totalAmount)}</ClaimValue>
                            ) : (
                                <WinValue>{formatCurrencyWithSign(USD_SIGN, parlayMarket.totalAmount)}</WinValue>
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
                        <ClaimValue>{formatCurrencyWithSign(USD_SIGN, parlayMarket.totalAmount)}</ClaimValue>
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
                    <ExternalLink href={getEtherscanTxLink(networkId, parlayMarket.txHash)} target={'_blank'}>
                        <ExternalLinkContainer>
                            <ExternalLinkArrow style={{ right: '7px' }} />
                        </ExternalLinkContainer>
                    </ExternalLink>
                )}
            </OverviewContainer>
            <CollapsableContainer show={showDetails}>
                <Divider />
                <ParlayDetailContainer>
                    {combinedMarkets &&
                        combinedMarkets.map((combinedMarket, index) => {
                            return (
                                <ParlayCombinedItem
                                    combinedMarket={combinedMarket}
                                    key={`${index}-combined-item-${combinedMarket.markets[0].address}-${combinedMarket.markets[1].address}`}
                                />
                            );
                        })}
                    {parlayWithoutCombinedMarkets &&
                        parlayWithoutCombinedMarkets.sportMarkets.map((market, index) => {
                            return (
                                <ParlayItem
                                    market={market}
                                    position={parlayWithoutCombinedMarkets.positions[index]}
                                    quote={
                                        parlayWithoutCombinedMarkets.marketQuotes
                                            ? parlayWithoutCombinedMarkets.marketQuotes[index]
                                            : 0
                                    }
                                    key={index}
                                />
                            );
                        })}
                </ParlayDetailContainer>
                <CollapseFooterContainer>
                    <TotalQuoteContainer>
                        <Label>{t('profile.card.total-quote')}:</Label>
                        <Value>{formatMarketOdds(selectedOddsType, parlayMarket.totalQuote)}</Value>
                    </TotalQuoteContainer>
                    <ProfitContainer>
                        {isClaimable ? (
                            <ClaimLabel>{t('profile.card.to-claim')}:</ClaimLabel>
                        ) : (
                            <WinLabel>{t('profile.card.to-win')}:</WinLabel>
                        )}
                        {isClaimable ? (
                            <ClaimValue>{formatCurrencyWithSign(USD_SIGN, parlayMarket.totalAmount)}</ClaimValue>
                        ) : (
                            <WinValue>{formatCurrencyWithSign(USD_SIGN, parlayMarket.totalAmount)}</WinValue>
                        )}
                    </ProfitContainer>
                </CollapseFooterContainer>
            </CollapsableContainer>
            {openApprovalModal && (
                <ApprovalModal
                    // ADDING 1% TO ENSURE TRANSACTIONS PASSES DUE TO CALCULATION DEVIATIONS
                    defaultAmount={Number(parlayMarket.totalAmount) * (1 + APPROVAL_BUFFER)}
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
