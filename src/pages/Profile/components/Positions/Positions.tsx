import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAA, getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { Trans, useTranslation } from 'react-i18next';
import { useParlayMarketsQuery } from 'queries/markets/useParlayMarketsQuery';
import useAccountMarketsQuery, { AccountPositionProfile } from 'queries/markets/useAccountMarketsQuery';
import { ParlayMarket } from 'types/markets';
import {
    Arrow,
    CategoryContainer,
    CategoryDisclaimer,
    CategoryIcon,
    CategoryLabel,
    Container,
    EmptyContainer,
    EmptySubtitle,
    EmptyTitle,
    ListContainer,
    ClaimAllContainer,
    additionalClaimButtonStyleMobile,
    additionalClaimButtonStyle,
} from './styled-components';
import { isParlayClaimable, isParlayOpen, isSportMarketExpired } from 'utils/markets';
import networkConnector from 'utils/networkConnector';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import ParlayPosition from './components/ParlayPosition';
import SimpleLoader from 'components/SimpleLoader';
import { LoaderContainer } from 'pages/Markets/Home/Home';
import SinglePosition from './components/SinglePosition';
import useMarketDurationQuery from 'queries/markets/useMarketDurationQuery';
import { ReactComponent as OvertimeTicket } from 'assets/images/parlay-empty.svg';
import { FlexDivCentered } from 'styles/common';
import ShareTicketModal, {
    ShareTicketModalProps,
} from 'pages/Markets/Home/Parlay/components/ShareTicketModal/ShareTicketModal';
import { ethers } from 'ethers';
import Button from 'components/Button';
import { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';
import { getIsMobile } from 'redux/modules/app';
import { getCollateral, getCollateralAddress, getDefaultCollateral } from 'utils/collaterals';
import { ZERO_ADDRESS } from 'constants/network';
import { getParlayPayment } from 'redux/modules/parlay';
import { checkAllowance, getIsMultiCollateralSupported } from 'utils/network';
import { coinParser } from 'utils/formatters/ethers';
import { executeBiconomyTransaction } from 'utils/biconomy';

const Positions: React.FC<{ searchText?: string }> = ({ searchText }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const [openClaimable, setClaimableState] = useState<boolean>(true);
    const [openOpenPositions, setOpenState] = useState<boolean>(true);
    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketData, setShareTicketData] = useState<ShareTicketModalProps>({
        markets: [],
        multiSingle: false,
        totalQuote: 0,
        paid: 0,
        payout: 0,
        onClose: () => {},
    });
    const [hasAllowance, setHasAllowance] = useState(false);

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isAA = useSelector((state: RootState) => getIsAA(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const parlayPayment = useSelector(getParlayPayment);
    const selectedCollateralIndex = parlayPayment.selectedCollateralIndex;

    const isSearchTextWalletAddress = searchText && ethers.utils.isAddress(searchText);

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

    const parlayMarketsQuery = useParlayMarketsQuery(
        isSearchTextWalletAddress ? searchText : walletAddress,
        networkId,
        undefined,
        undefined,
        {
            enabled: isWalletConnected,
        }
    );

    const accountMarketsQuery = useAccountMarketsQuery(
        isSearchTextWalletAddress ? searchText : walletAddress,
        networkId,
        {
            enabled: isWalletConnected,
        }
    );

    const marketDurationQuery = useMarketDurationQuery(networkId);

    const parlayMarkets = parlayMarketsQuery.isSuccess && parlayMarketsQuery.data ? parlayMarketsQuery.data : null;
    const accountPositions =
        accountMarketsQuery.isSuccess && accountMarketsQuery.data ? accountMarketsQuery.data : null;

    const marketDuration =
        marketDurationQuery.isSuccess && marketDurationQuery.data ? Math.floor(marketDurationQuery.data) : 30;

    const accountPositionsByStatus = useMemo(() => {
        const data = {
            open: [] as AccountPositionProfile[],
            claimable: [] as AccountPositionProfile[],
        };
        if (accountPositions) {
            accountPositions.forEach((market) => {
                if (market.open) {
                    data.open.push(market);
                }
                if (market.claimable) {
                    if (!isSportMarketExpired(market.market)) {
                        data.claimable.push(market);
                    }
                }
            });
        }

        if (searchText && !ethers.utils.isAddress(searchText)) {
            data.open = data.open.filter((item) => {
                if (
                    item.market.homeTeam.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.market.awayTeam.toLowerCase().includes(searchText.toLowerCase())
                )
                    return item;
            });
            data.claimable = data.claimable.filter((item) => {
                if (
                    item.market.homeTeam.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.market.awayTeam.toLowerCase().includes(searchText.toLowerCase())
                )
                    return item;
            });
        }
        return data;
    }, [accountPositions, searchText]);

    const parlayMarketsByStatus = useMemo(() => {
        const data = {
            open: [] as ParlayMarket[],
            claimable: [] as ParlayMarket[],
        };
        if (parlayMarkets) {
            parlayMarkets.forEach((parlayMarket) => {
                const openMarkets = parlayMarket.sportMarkets.filter(
                    (market) => !market.isCanceled && !market.isResolved
                );
                if (!openMarkets?.length && !parlayMarket.claimed) {
                    if (isParlayClaimable(parlayMarket)) data.claimable.push(parlayMarket);
                }
                const resolvedOrCanceledMarkets = parlayMarket.sportMarkets.filter(
                    (sportMarket) => sportMarket.isResolved || sportMarket.isCanceled
                );

                if (resolvedOrCanceledMarkets.length !== parlayMarket.sportMarkets.length)
                    if (isParlayOpen(parlayMarket)) data.open.push(parlayMarket);
            });
        }

        if (searchText && !ethers.utils.isAddress(searchText)) {
            data.open = data.open.filter((item) => {
                const itemWithSearchText = item.sportMarkets.find(
                    (item) =>
                        item.homeTeam.includes(searchText.toLowerCase()) ||
                        item.awayTeam.includes(searchText.toLowerCase())
                );
                if (itemWithSearchText) return item;
            });
            data.claimable = data.claimable.filter((item) => {
                const itemWithSearchText = item.sportMarkets.find(
                    (item) =>
                        item.homeTeam.includes(searchText.toLowerCase()) ||
                        item.awayTeam.includes(searchText.toLowerCase())
                );
                if (itemWithSearchText) return item;
            });
        }
        return data;
    }, [parlayMarkets, searchText]);

    const totalParlayClaimableAmount = useMemo(
        () => parlayMarketsByStatus.claimable.reduce((partialSum, market) => partialSum + market.totalAmount, 0),
        [parlayMarketsByStatus.claimable]
    );

    useEffect(() => {
        const { parlayMarketsAMMContract, sUSDContract, signer } = networkConnector;
        if (parlayMarketsAMMContract && signer && sUSDContract) {
            const collateralContractWithSigner = sUSDContract?.connect(signer);
            const addressToApprove = parlayMarketsAMMContract.address;

            const getAllowance = async () => {
                try {
                    const parsedAmount = coinParser(Number(totalParlayClaimableAmount).toString(), networkId);
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
            if (
                isWalletConnected &&
                isMultiCollateralSupported &&
                !isDefaultCollateral &&
                Number(totalParlayClaimableAmount) > 0
            ) {
                getAllowance();
            } else {
                setHasAllowance(true);
            }
        }
    }, [
        walletAddress,
        isWalletConnected,
        hasAllowance,
        selectedCollateralIndex,
        networkId,
        selectedCollateral,
        isEth,
        isMultiCollateralSupported,
        totalParlayClaimableAmount,
        isDefaultCollateral,
    ]);

    const isLoading = parlayMarketsQuery.isLoading || accountMarketsQuery.isLoading;

    const claimAllRewards = async () => {
        const { signer, parlayMarketsAMMContract, sportsAMMContract } = networkConnector;
        if (signer) {
            const transactions: any = [];

            if (accountPositionsByStatus.claimable.length) {
                if (sportsAMMContract) {
                    accountPositionsByStatus.claimable.forEach(async (position) => {
                        transactions.push(
                            new Promise(async (resolve, reject) => {
                                const contract = new ethers.Contract(
                                    position.market.address,
                                    sportsMarketContract.abi,
                                    signer
                                );
                                contract.connect(signer);
                                const sportsAMMContractWithSigner = sportsAMMContract.connect(signer);

                                const id = toast.loading(t('market.toast-message.transaction-pending'));
                                try {
                                    let txResult;
                                    if (isAA) {
                                        txResult = isDefaultCollateral
                                            ? await executeBiconomyTransaction(
                                                  collateralAddress,
                                                  contract,
                                                  'exerciseOptions'
                                              )
                                            : await executeBiconomyTransaction(
                                                  collateralAddress,
                                                  sportsAMMContractWithSigner,
                                                  'exerciseWithOfframp',
                                                  [position.market.address, collateralAddress, isEth]
                                              );
                                    } else {
                                        const tx = isDefaultCollateral
                                            ? await contract.exerciseOptions()
                                            : await sportsAMMContractWithSigner.exerciseWithOfframp(
                                                  position.market.address,
                                                  collateralAddress,
                                                  isEth
                                              );
                                        txResult = await tx.wait();
                                    }

                                    if (txResult && txResult.transactionHash) {
                                        resolve(
                                            toast.update(
                                                id,
                                                getSuccessToastOptions(t('market.toast-message.claim-winnings-success'))
                                            )
                                        );
                                    } else {
                                        reject(
                                            toast.update(
                                                id,
                                                getErrorToastOptions(t('common.errors.unknown-error-try-again'))
                                            )
                                        );
                                    }
                                } catch (e) {
                                    reject(
                                        toast.update(
                                            id,
                                            getErrorToastOptions(t('common.errors.unknown-error-try-again'))
                                        )
                                    );
                                    console.log(e);
                                }
                            })
                        );
                    });
                }
            }

            if (parlayMarketsByStatus.claimable.length) {
                if (parlayMarketsAMMContract) {
                    parlayMarketsByStatus.claimable.forEach(async (market) => {
                        transactions.push(
                            new Promise(async (resolve, reject) => {
                                const id = toast.loading(t('market.toast-message.transaction-pending'));

                                try {
                                    const parlayMarketsAMMContractWithSigner = parlayMarketsAMMContract.connect(signer);

                                    const tx = isDefaultCollateral
                                        ? await parlayMarketsAMMContractWithSigner?.exerciseParlay(market.id)
                                        : await parlayMarketsAMMContractWithSigner?.exerciseParlayWithOfframp(
                                              market.id,
                                              collateralAddress,
                                              isEth
                                          );
                                    const txResult = await tx.wait();

                                    if (txResult && txResult.transactionHash) {
                                        resolve(
                                            toast.update(
                                                id,
                                                getSuccessToastOptions(t('market.toast-message.claim-winnings-success'))
                                            )
                                        );
                                    } else {
                                        reject(
                                            toast.update(
                                                id,
                                                getErrorToastOptions(t('common.errors.unknown-error-try-again'))
                                            )
                                        );
                                    }
                                } catch (e) {
                                    reject(
                                        toast.update(
                                            id,
                                            getErrorToastOptions(t('common.errors.unknown-error-try-again'))
                                        )
                                    );
                                    console.log(e);
                                }
                            })
                        );
                    });
                }
            }

            Promise.all(transactions).catch((e) => console.log(e));
        }
    };

    return (
        <Container>
            <CategoryContainer onClick={() => setClaimableState(!openClaimable)}>
                <FlexDivCentered>
                    <CategoryIcon className="icon icon--claimable-flag" />
                    <CategoryLabel>{t('profile.categories.claimable')}</CategoryLabel>
                    <Arrow className={openClaimable ? 'icon icon--arrow-up' : 'icon icon--arrow-down'} />
                </FlexDivCentered>
                <CategoryDisclaimer>
                    <Trans i18nKey="profile.winnings-are-forfeit" values={{ amount: marketDuration }} />
                </CategoryDisclaimer>
            </CategoryContainer>
            {openClaimable && (
                <ListContainer>
                    {isLoading ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : (
                        <>
                            {parlayMarketsByStatus.claimable.length || accountPositionsByStatus.claimable.length ? (
                                <>
                                    <ClaimAllContainer>
                                        <Button
                                            onClick={(e: any) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                claimAllRewards();
                                            }}
                                            disabled={!hasAllowance}
                                            backgroundColor={theme.button.background.quaternary}
                                            borderColor={theme.button.borderColor.secondary}
                                            additionalStyles={
                                                isMobile ? additionalClaimButtonStyleMobile : additionalClaimButtonStyle
                                            }
                                            padding="2px 5px"
                                            fontSize={isMobile ? '9px' : undefined}
                                            height={isMobile ? '19px' : undefined}
                                        >
                                            {t('profile.card.claim-all')}
                                        </Button>
                                    </ClaimAllContainer>
                                    {accountPositionsByStatus.claimable.map((singleMarket, index) => {
                                        return (
                                            <SinglePosition
                                                position={singleMarket}
                                                key={`s-${index}`}
                                                setShareTicketModalData={setShareTicketData}
                                                setShowShareTicketModal={setShowShareTicketModal}
                                            />
                                        );
                                    })}
                                    {parlayMarketsByStatus.claimable.map((parlayMarket, index) => {
                                        return (
                                            <ParlayPosition
                                                parlayMarket={parlayMarket}
                                                key={index}
                                                setShareTicketModalData={setShareTicketData}
                                                setShowShareTicketModal={setShowShareTicketModal}
                                            />
                                        );
                                    })}
                                </>
                            ) : (
                                <EmptyContainer>
                                    <EmptyTitle>{t('profile.messages.no-claimable')}</EmptyTitle>
                                    <OvertimeTicket />
                                    <EmptySubtitle>{t('profile.messages.ticket-subtitle')}</EmptySubtitle>
                                </EmptyContainer>
                            )}
                        </>
                    )}
                </ListContainer>
            )}
            <CategoryContainer onClick={() => setOpenState(!openOpenPositions)}>
                <FlexDivCentered>
                    <CategoryIcon className="icon icon--logo" />
                    <CategoryLabel>{t('profile.categories.open')}</CategoryLabel>
                    <Arrow className={openOpenPositions ? 'icon icon--arrow-up' : 'icon icon--arrow-down'} />
                </FlexDivCentered>
            </CategoryContainer>
            {openOpenPositions && (
                <ListContainer>
                    {parlayMarketsQuery.isLoading ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : (
                        <>
                            {parlayMarketsByStatus.open.length || accountPositionsByStatus.open.length ? (
                                <>
                                    {accountPositionsByStatus.open.map((singleMarket, index) => {
                                        return <SinglePosition position={singleMarket} key={`s-${index}`} />;
                                    })}
                                    {parlayMarketsByStatus.open.map((parlayMarket, index) => {
                                        return <ParlayPosition parlayMarket={parlayMarket} key={index} />;
                                    })}
                                </>
                            ) : (
                                <EmptyContainer>
                                    <EmptyTitle>{t('profile.messages.no-open')}</EmptyTitle>
                                    <OvertimeTicket />
                                    <EmptySubtitle>{t('profile.messages.ticket-subtitle')}</EmptySubtitle>
                                </EmptyContainer>
                            )}
                        </>
                    )}
                </ListContainer>
            )}
            {showShareTicketModal && (
                <ShareTicketModal
                    markets={shareTicketData.markets}
                    multiSingle={false}
                    totalQuote={shareTicketData.totalQuote}
                    paid={shareTicketData.paid}
                    payout={shareTicketData.payout}
                    onClose={shareTicketData.onClose}
                />
            )}
        </Container>
    );
};

export default Positions;
