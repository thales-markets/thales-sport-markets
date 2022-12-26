import React, { useEffect, useMemo, useState } from 'react';

import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
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
} from './styled-components';
import { isParlayClaimable, isParlayOpen, isSportMarketExpired } from 'utils/markets';
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

const Positions: React.FC<{ searchText?: string; setOpenPositionsValue: (value: number) => void }> = ({
    searchText,
    setOpenPositionsValue,
}) => {
    const { t } = useTranslation();

    const [openClaimable, setClaimableState] = useState<boolean>(true);
    const [openOpenPositions, setOpenState] = useState<boolean>(true);
    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketData, setShareTicketData] = useState<ShareTicketModalProps>({
        markets: [],
        totalQuote: 0,
        paid: 0,
        payout: 0,
        onClose: () => {},
    });

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

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

                if (resolvedOrCanceledMarkets?.length !== parlayMarket.sportMarkets.length)
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

    useEffect(() => {
        let openPositionsValueSum = 0;
        parlayMarketsByStatus.open.forEach((market) => {
            openPositionsValueSum += market.sUSDPaid;
        });
        accountPositionsByStatus.open.forEach((position) => {
            openPositionsValueSum += position.sUSDPaid;
        });
        setOpenPositionsValue(openPositionsValueSum);
    }, [parlayMarketsByStatus, accountPositionsByStatus, setOpenPositionsValue]);

    const isLoading = parlayMarketsQuery.isLoading || accountMarketsQuery.isLoading;

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
