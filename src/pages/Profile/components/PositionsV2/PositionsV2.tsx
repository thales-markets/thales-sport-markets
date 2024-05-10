import { ReactComponent as OvertimeTicket } from 'assets/images/parlay-empty.svg';
import Button from 'components/Button';
import SimpleLoader from 'components/SimpleLoader';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ZERO_ADDRESS } from 'constants/network';
import { ethers } from 'ethers';
import { LoaderContainer } from 'pages/Markets/Home/HomeV2';
import useMarketDurationQuery from 'queries/markets/useMarketDurationQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getTicketPayment } from 'redux/modules/ticket';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { coinParser } from 'thales-utils';
import { Ticket } from 'types/markets';
import { getCollateral, getCollateralAddress, getDefaultCollateral } from 'utils/collaterals';
import { checkAllowance, getIsMultiCollateralSupported } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { useUserTicketsQuery } from '../../../../queries/markets/useUserTicketsQuery';
import ShareTicketModalV2 from '../../../Markets/Home/Parlay/components/ShareTicketModalV2';
import { ShareTicketModalProps } from '../../../Markets/Home/Parlay/components/ShareTicketModalV2/ShareTicketModalV2';
import TicketPosition from './components/TicketPosition';
import {
    Arrow,
    CategoryContainer,
    CategoryDisclaimer,
    CategoryIcon,
    CategoryInfo,
    CategoryLabel,
    ClaimAllContainer,
    Container,
    EmptyContainer,
    EmptySubtitle,
    EmptyTitle,
    ListContainer,
    additionalClaimButtonStyle,
    additionalClaimButtonStyleMobile,
} from './styled-components';

const Positions: React.FC<{ searchText?: string }> = ({ searchText }) => {
    const { t } = useTranslation();

    const [openClaimable, setClaimableState] = useState<boolean>(true);
    const [openOpenPositions, setOpenState] = useState<boolean>(true);
    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketData, setShareTicketData] = useState<ShareTicketModalProps | undefined>(undefined);
    const [hasAllowance, setHasAllowance] = useState(false);

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    // const isAA = useSelector((state: RootState) => getIsAA(state));
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const ticketPayment = useSelector(getTicketPayment);
    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;

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

    const userTicketsQuery = useUserTicketsQuery(
        isSearchTextWalletAddress ? searchText : walletAddress.toLowerCase(),
        networkId,
        {
            enabled: isWalletConnected,
        }
    );

    const marketDurationQuery = useMarketDurationQuery(networkId);

    const marketDuration =
        marketDurationQuery.isSuccess && marketDurationQuery.data ? Math.floor(marketDurationQuery.data) : 30;

    const userTicketsByStatus = useMemo(() => {
        const userTickets = userTicketsQuery.isSuccess && userTicketsQuery.data ? userTicketsQuery.data : [];

        const data = {
            open: [] as Ticket[],
            claimable: [] as Ticket[],
        };
        userTickets.forEach((ticket: Ticket) => {
            if (ticket.isClaimable) {
                data.claimable.push(ticket);
            }

            if (ticket.isOpen) {
                data.open.push(ticket);
            }
        });

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
    }, [userTicketsQuery.isSuccess, userTicketsQuery.data, searchText]);

    const totalParlayClaimableAmount = useMemo(
        () => userTicketsByStatus.claimable.reduce((partialSum, ticket) => partialSum + ticket.payout, 0),
        [userTicketsByStatus.claimable]
    );

    useEffect(() => {
        const { sportsAMMV2Contract, sUSDContract, signer } = networkConnector;
        if (sportsAMMV2Contract && signer && sUSDContract) {
            const collateralContractWithSigner = sUSDContract?.connect(signer);
            const addressToApprove = sportsAMMV2Contract.address;

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

    const isLoading = userTicketsQuery.isLoading;

    const claimAllRewards = async () => {
        const { signer, sportsAMMV2Contract } = networkConnector;
        if (signer) {
            const transactions: any = [];

            if (userTicketsByStatus.claimable.length) {
                if (sportsAMMV2Contract) {
                    userTicketsByStatus.claimable.forEach(async (market) => {
                        transactions.push(
                            new Promise(async (resolve, reject) => {
                                const id = toast.loading(t('market.toast-message.transaction-pending'));

                                try {
                                    const sportsAMMV2ContractWithSigner = sportsAMMV2Contract.connect(signer);

                                    const tx = isDefaultCollateral
                                        ? await sportsAMMV2ContractWithSigner?.exerciseTicket(market.id)
                                        : // TODO: not available yet
                                          await sportsAMMV2ContractWithSigner?.exerciseTicketWithOfframp(
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
                <CategoryInfo>
                    <CategoryIcon className="icon icon--claimable-flag" />
                    <CategoryLabel>{t('profile.categories.claimable')}</CategoryLabel>
                </CategoryInfo>
                <CategoryDisclaimer>
                    <Trans i18nKey="profile.winnings-are-forfeit" values={{ amount: marketDuration }} />
                </CategoryDisclaimer>
                <Arrow className={openClaimable ? 'icon icon--arrow-up' : 'icon icon--arrow-down'} />
            </CategoryContainer>
            {openClaimable && (
                <ListContainer>
                    {isLoading ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : (
                        <>
                            {userTicketsByStatus.claimable.length ? (
                                <>
                                    <ClaimAllContainer>
                                        <Button
                                            onClick={(e: any) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                claimAllRewards();
                                            }}
                                            disabled={!hasAllowance}
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
                                    {userTicketsByStatus.claimable.map((parlayMarket, index) => {
                                        return (
                                            <TicketPosition
                                                ticket={parlayMarket}
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
                <CategoryInfo>
                    <CategoryIcon className="icon icon--logo" />
                    <CategoryLabel>{t('profile.categories.open')}</CategoryLabel>
                </CategoryInfo>
                <Arrow className={openOpenPositions ? 'icon icon--arrow-up' : 'icon icon--arrow-down'} />
            </CategoryContainer>
            {openOpenPositions && (
                <ListContainer>
                    {userTicketsQuery.isLoading ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : (
                        <>
                            {userTicketsByStatus.open.length ? (
                                <>
                                    {userTicketsByStatus.open.map((parlayMarket, index) => {
                                        return <TicketPosition ticket={parlayMarket} key={index} />;
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
            {showShareTicketModal && shareTicketData && (
                <ShareTicketModalV2
                    markets={shareTicketData.markets}
                    multiSingle={false}
                    paid={shareTicketData.paid}
                    payout={shareTicketData.payout}
                    onClose={shareTicketData.onClose}
                    isTicketLost={shareTicketData.isTicketLost}
                    isTicketResolved={shareTicketData.isTicketResolved}
                />
            )}
        </Container>
    );
};

export default Positions;
