import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsSocialLogin, getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
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
} from './styled-components';
import { isParlayClaimable, isParlayOpen, isSportMarketExpired } from 'utils/markets';
import { getMaxGasLimitForNetwork } from 'utils/network';
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
import { executeEtherspotTransaction } from 'utils/etherspot';

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

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const isSocialLogin = useSelector((state: RootState) => getIsSocialLogin(state));

    const isSearchTextWalletAddress = searchText && ethers.utils.isAddress(searchText);

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

    const isLoading = parlayMarketsQuery.isLoading || accountMarketsQuery.isLoading;

    const claimAllRewards = async () => {
        const transactions: any = [];

        if (accountPositionsByStatus.claimable.length) {
            accountPositionsByStatus.claimable.forEach(async (position) => {
                transactions.push(
                    new Promise(async (resolve, reject) => {
                        const id = toast.loading(t('market.toast-message.transaction-pending'));

                        try {
                            const { signer, provider } = networkConnector;
                            const contract = new ethers.Contract(
                                position.market.address,
                                sportsMarketContract.abi,
                                provider
                            );

                            let txHash;
                            if (isSocialLogin) {
                                txHash = await executeEtherspotTransaction(networkId, contract, 'exerciseOptions');
                            } else if (signer) {
                                const contractWithSigner = contract.connect(signer);

                                const tx = await contractWithSigner.exerciseOptions({
                                    gasLimit: getMaxGasLimitForNetwork(networkId),
                                });
                                const txResult = await tx.wait();

                                if (txResult && txResult.transactionHash) {
                                    txHash = txResult.transactionHash;
                                }
                            }

                            if (txHash && txHash !== null) {
                                resolve(
                                    toast.update(
                                        id,
                                        getSuccessToastOptions(t('market.toast-message.claim-winnings-success'))
                                    )
                                );
                            } else {
                                reject(
                                    toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')))
                                );
                            }
                        } catch (e) {
                            reject(toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'))));
                            console.log(e);
                        }
                    })
                );
            });
        }

        if (parlayMarketsByStatus.claimable.length) {
            parlayMarketsByStatus.claimable.forEach(async (market) => {
                transactions.push(
                    new Promise(async (resolve, reject) => {
                        const id = toast.loading(t('market.toast-message.transaction-pending'));

                        try {
                            const { parlayMarketsAMMContract, signer } = networkConnector;

                            let txHash;
                            if (isSocialLogin) {
                                txHash = await executeEtherspotTransaction(
                                    networkId,
                                    parlayMarketsAMMContract,
                                    'exerciseParlay',
                                    [market.id]
                                );
                            } else if (signer && parlayMarketsAMMContract) {
                                const parlayMarketsAMMContractWithSigner = parlayMarketsAMMContract.connect(signer);

                                const tx = await parlayMarketsAMMContractWithSigner?.exerciseParlay(market.id, {
                                    gasLimit: getMaxGasLimitForNetwork(networkId),
                                });
                                const txResult = await tx.wait();

                                if (txResult && txResult.transactionHash) {
                                    txHash = txResult.transactionHash;
                                }
                            }

                            if (txHash && txHash !== null) {
                                resolve(
                                    toast.update(
                                        id,
                                        getSuccessToastOptions(t('market.toast-message.claim-winnings-success'))
                                    )
                                );
                            } else {
                                reject(
                                    toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')))
                                );
                            }
                        } catch (e) {
                            reject(toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'))));
                            console.log(e);
                        }
                    })
                );
            });
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
                                            backgroundColor={theme.button.background.quaternary}
                                            borderColor={theme.button.borderColor.secondary}
                                            padding={isMobile ? '2px 5px' : '3px 15px'}
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
