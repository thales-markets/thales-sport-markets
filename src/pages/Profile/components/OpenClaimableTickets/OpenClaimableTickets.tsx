import Button from 'components/Button';
import SimpleLoader from 'components/SimpleLoader';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { GAS_ESTIMATION_BUFFER_CLAIM_ALL } from 'constants/network';
import { ContractType } from 'enums/contract';
import { LoaderContainer } from 'pages/Markets/Home/HomeV2';
import usePositionCountV2Query from 'queries/markets/usePositionCountV2Query';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import { FlexDivCentered } from 'styles/common';
import { RootState } from 'types/redux';
import { getCollateral, getCollaterals, getDefaultCollateral, isLpSupported } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { getCaseAccentInsensitiveString } from 'utils/formatters/string';
import { refetchAfterClaim } from 'utils/queryConnector';
import { sendBiconomyTransaction } from 'utils/smartAccount/biconomy/biconomy';

import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { Address, Client, encodeFunctionData, isAddress } from 'viem';
import { estimateContractGas, waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import TicketDetails from './components/TicketDetails';
import {
    additionalClaimButtonStyle,
    additionalClaimButtonStyleMobile,
    Arrow,
    CategoryContainer,
    CategoryDisclaimer,
    CategoryIcon,
    CategoryIconWrapper,
    CategoryInfo,
    CategoryLabel,
    ClaimableTicketsNotificationCount,
    ClaimAllContainer,
    Container,
    Count,
    EmptyContainer,
    EmptySubtitle,
    EmptyTitle,
    Expand,
    ListContainer,
    OpenTicketsNotificationCount,
    StyledParlayEmptyIcon,
} from './styled-components';

type OpenClaimableTicketsProps = {
    searchText?: string;
};

const OpenClaimableTickets: React.FC<OpenClaimableTicketsProps> = ({ searchText }) => {
    const { t } = useTranslation();

    const isBiconomy = useSelector(getIsBiconomy);
    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();

    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const isSearchTextWalletAddress = searchText && isAddress(searchText);
    const [claimCollateralIndex, setClaimCollateralIndex] = useState(0);
    const [openClaimable, setClaimableState] = useState<boolean>(true);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [openOpenPositions, setOpenState] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const claimCollateralArray = useMemo(
        () =>
            getCollaterals(networkId).filter(
                (collateral) => !isLpSupported(collateral) || collateral === defaultCollateral
            ),
        [networkId, defaultCollateral]
    );
    const claimCollateral = useMemo(() => getCollateral(networkId, claimCollateralIndex, claimCollateralArray), [
        claimCollateralArray,
        networkId,
        claimCollateralIndex,
    ]);

    const positionsCountQuery = usePositionCountV2Query(walletAddress, { networkId, client }, { enabled: isConnected });

    const claimablePositionCount = useMemo(
        () => (positionsCountQuery.isSuccess && positionsCountQuery.data ? positionsCountQuery.data.claimable : 0),
        [positionsCountQuery.isSuccess, positionsCountQuery.data]
    );
    const openPositionCount = useMemo(
        () => (positionsCountQuery.isSuccess && positionsCountQuery.data ? positionsCountQuery.data.open : 0),
        [positionsCountQuery.isSuccess, positionsCountQuery.data]
    );

    const userTicketsQuery = useUserTicketsQuery(
        isSearchTextWalletAddress ? searchText : walletAddress,
        { networkId, client },
        { enabled: isSearchTextWalletAddress || isConnected }
    );

    const userTicketsByStatus = useMemo(() => {
        let userTickets = userTicketsQuery.isSuccess && userTicketsQuery.data ? userTicketsQuery.data : [];
        if (searchText && !isAddress(searchText)) {
            const normalizedSearch = getCaseAccentInsensitiveString(searchText);
            userTickets = userTickets.filter((ticket) =>
                ticket.sportMarkets.some(
                    (market) =>
                        getCaseAccentInsensitiveString(market.homeTeam).includes(normalizedSearch) ||
                        getCaseAccentInsensitiveString(market.awayTeam).includes(normalizedSearch)
                )
            );
        }

        const data = {
            open: userTickets.filter((ticket) => ticket.isOpen),
            claimable: userTickets.filter((ticket) => ticket.isClaimable),
        };
        return data;
    }, [userTicketsQuery.isSuccess, userTicketsQuery.data, searchText]);

    useEffect(() => {
        if (
            claimablePositionCount !== userTicketsByStatus.claimable.length ||
            openPositionCount !== userTicketsByStatus.open.length
        ) {
            refetchAfterClaim(walletAddress, networkId);
        }
    }, [claimablePositionCount, openPositionCount, userTicketsByStatus, walletAddress, networkId]);

    const claimBatch = async () => {
        const sportsAMMV2ContractWithSigner = getContractInstance(ContractType.SPORTS_AMM_V2, {
            client: walletClient?.data,
            networkId,
        });
        const multiCallContractWithSigner = getContractInstance(ContractType.MULTICALL, {
            client: walletClient?.data,
            networkId,
        });

        const id = toast.loading(t('market.toast-message.transaction-pending'));
        setIsSubmitting(true);

        const calls: { target: string; allowFailure: boolean; callData: any }[] = [];
        const claimTxs = [];

        try {
            if (userTicketsByStatus.claimable.length && sportsAMMV2ContractWithSigner) {
                for (let i = 0; i < userTicketsByStatus.claimable.length; i++) {
                    const ticket = userTicketsByStatus.claimable[i];
                    try {
                        const tx = encodeFunctionData({
                            abi: sportsAMMV2ContractWithSigner?.abi,
                            functionName: 'exerciseTicket',
                            args: [ticket.id],
                        });

                        if (isBiconomy) {
                            const biconomyClaimTx = {
                                to: sportsAMMV2ContractWithSigner.address,
                                data: tx,
                            };

                            claimTxs.push(biconomyClaimTx);
                        } else {
                            const isClaimCollateralDefaultCollateral = claimCollateral === defaultCollateral;
                            if (isClaimCollateralDefaultCollateral) {
                                calls.push({
                                    target: sportsAMMV2ContractWithSigner.address,
                                    allowFailure: true,
                                    callData: tx,
                                });
                            }
                        }
                    } catch (e) {
                        console.log('Error ', e);
                        return;
                    }
                }
                if (isBiconomy) {
                    const txHash = await sendBiconomyTransaction({
                        networkId: networkId,
                        transaction: claimTxs,
                        collateralAddress: claimCollateral,
                        useSession: true,
                    });

                    const txReceipt = await waitForTransactionReceipt(client as Client, {
                        hash: txHash,
                    });

                    if (txReceipt.status === 'success') {
                        toast.update(id, getSuccessToastOptions(t('market.toast-message.claim-winnings-success')));
                        refetchAfterClaim(walletAddress, networkId);
                    }
                } else {
                    if (multiCallContractWithSigner) {
                        const gasEstimation = await estimateContractGas(client as Client, {
                            address: multiCallContractWithSigner.address as Address,
                            abi: multiCallContractWithSigner.abi,
                            functionName: 'aggregate3',
                            args: [calls],
                        });
                        const gasEstimationWithBuffer = BigInt(
                            Math.ceil(Number(gasEstimation) * GAS_ESTIMATION_BUFFER_CLAIM_ALL)
                        );

                        const txHash = await multiCallContractWithSigner.write.aggregate3([calls], {
                            gas: gasEstimationWithBuffer,
                        });

                        const txReceipt = await waitForTransactionReceipt(client as Client, {
                            hash: txHash,
                        });

                        if (txReceipt.status === 'success') {
                            toast.update(id, getSuccessToastOptions(t('market.toast-message.claim-winnings-success')));
                            refetchAfterClaim(walletAddress, networkId);
                        }
                    }
                }
                setIsSubmitting(false);
            }
        } catch (e) {
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
            setIsSubmitting(false);
            console.log('Error ', e);

            return;
        }
    };

    const marketDuration = Math.floor(90);

    return (
        <Container>
            <CategoryContainer onClick={() => setClaimableState(!openClaimable)}>
                <CategoryInfo>
                    <CategoryIconWrapper>
                        {userTicketsByStatus.claimable.length > 0 && (
                            <ClaimableTicketsNotificationCount>
                                <Count>{userTicketsByStatus.claimable.length}</Count>
                            </ClaimableTicketsNotificationCount>
                        )}
                        <CategoryIcon className="icon icon--claimable-ticket" />
                    </CategoryIconWrapper>
                    <CategoryLabel>{t('profile.categories.claimable')}</CategoryLabel>
                </CategoryInfo>
                <CategoryDisclaimer>
                    <Trans i18nKey="profile.winnings-are-forfeit" values={{ amount: marketDuration }} />
                </CategoryDisclaimer>
                <Arrow className={openClaimable ? 'icon icon--caret-up' : 'icon icon--caret-down'} />
            </CategoryContainer>
            {openClaimable && (
                <ListContainer>
                    {userTicketsQuery.isLoading ? (
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
                                                claimBatch();
                                            }}
                                            additionalStyles={
                                                isMobile ? additionalClaimButtonStyleMobile : additionalClaimButtonStyle
                                            }
                                            padding="2px 5px"
                                            fontSize={isMobile ? '9px' : undefined}
                                            height={isMobile ? '19px' : '24px'}
                                        >
                                            {isSubmitting
                                                ? t('profile.card.claim-progress')
                                                : t('profile.card.claim-all')}
                                        </Button>
                                        <Tooltip
                                            overlay={t('profile.card.claim-batch-tooltip')}
                                            iconFontSize={isMobile ? 16 : 20}
                                            marginLeft={12}
                                            top={-2}
                                        />
                                    </ClaimAllContainer>
                                    {userTicketsByStatus.claimable.map((parlayMarket, index) => {
                                        return (
                                            <TicketDetails
                                                ticket={parlayMarket}
                                                key={index}
                                                claimCollateralIndex={claimCollateralIndex}
                                                setClaimCollateralIndex={setClaimCollateralIndex}
                                            />
                                        );
                                    })}
                                </>
                            ) : (
                                <EmptyContainer>
                                    <EmptyTitle>{t('profile.messages.no-claimable')}</EmptyTitle>
                                    <StyledParlayEmptyIcon />
                                    <EmptySubtitle>{t('profile.messages.ticket-subtitle')}</EmptySubtitle>
                                </EmptyContainer>
                            )}
                        </>
                    )}
                </ListContainer>
            )}
            <CategoryContainer>
                <CategoryInfo>
                    <CategoryIconWrapper>
                        {userTicketsByStatus.open.length > 0 && (
                            <OpenTicketsNotificationCount>
                                <Count>{userTicketsByStatus.open.length}</Count>
                            </OpenTicketsNotificationCount>
                        )}
                        <CategoryIcon className="icon icon--open-ticket" />
                    </CategoryIconWrapper>
                    <CategoryLabel>{t('profile.categories.open')}</CategoryLabel>
                </CategoryInfo>
                <FlexDivCentered>
                    <Expand active={showDetails} onClick={() => setShowDetails(!showDetails)}>
                        {showDetails ? '-' : '+'}
                    </Expand>
                    <Arrow
                        onClick={() => setOpenState(!openOpenPositions)}
                        className={openOpenPositions ? 'icon icon--caret-up' : 'icon icon--caret-down'}
                    />
                </FlexDivCentered>
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
                                        return (
                                            <TicketDetails
                                                ticket={parlayMarket}
                                                key={index}
                                                claimCollateralIndex={claimCollateralIndex}
                                                setClaimCollateralIndex={setClaimCollateralIndex}
                                                showDetailsExplicit={showDetails}
                                            />
                                        );
                                    })}
                                </>
                            ) : (
                                <EmptyContainer>
                                    <EmptyTitle>{t('profile.messages.no-open')}</EmptyTitle>
                                    <StyledParlayEmptyIcon />
                                    <EmptySubtitle>{t('profile.messages.ticket-subtitle')}</EmptySubtitle>
                                </EmptyContainer>
                            )}
                        </>
                    )}
                </ListContainer>
            )}
        </Container>
    );
};

export default OpenClaimableTickets;
