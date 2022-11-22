import React, { useMemo, useState } from 'react';

import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { useTranslation } from 'react-i18next';

import { useParlayMarketsQuery } from 'queries/markets/useParlayMarketsQuery';
import useAccountMarketsQuery, { AccountPositionProfile } from 'queries/markets/useAccountMarketsQuery';
import { ParlayMarket } from 'types/markets';
import {
    Arrow,
    CategoryContainer,
    CategoryIcon,
    CategoryLabel,
    Container,
    EmptyContainer,
    ListContainer,
} from './styled-components';
import { isParlayClaimable, isParlayOpen, isSportMarketExpired } from 'utils/markets';
import ParlayPosition from './components/ParlayPosition';
import SimpleLoader from 'components/SimpleLoader';
import { LoaderContainer } from 'pages/Markets/Home/Home';
import SinglePosition from './components/SinglePosition';

const Positions: React.FC = () => {
    const { t } = useTranslation();

    const [openClaimable, setClaimableState] = useState<boolean>(true);
    const [openOpenPositions, setOpenState] = useState<boolean>(true);

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    // const walletAddress = useSelector((state: RootState) => getWalletAddress(state))
    //     ? '0x4a24fd841e74c28309bca5730b40679e18c5fca0'
    //     : '0x4a24fd841e74c28309bca5730b40679e18c5fca0';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const parlayMarketsQuery = useParlayMarketsQuery(walletAddress, networkId, undefined, undefined, {
        enabled: isWalletConnected,
    });

    const accountMarketsQuery = useAccountMarketsQuery(walletAddress, networkId, {
        enabled: isWalletConnected,
    });

    const parlayMarkets = parlayMarketsQuery.isSuccess && parlayMarketsQuery.data ? parlayMarketsQuery.data : null;
    const accountPositions =
        accountMarketsQuery.isSuccess && accountMarketsQuery.data ? accountMarketsQuery.data : null;

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
                    if (isSportMarketExpired(market.market)) {
                        data.claimable.push(market);
                    }
                }
            });
        }
        return data;
    }, [accountPositions]);

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
        return data;
    }, [parlayMarkets]);

    const isLoading = parlayMarketsQuery.isLoading || accountMarketsQuery.isLoading;

    return (
        <Container>
            <CategoryContainer onClick={() => setClaimableState(!openClaimable)}>
                <CategoryIcon className="icon icon--claimable-flag" />
                <CategoryLabel>{t('profile.categories.claimable')}</CategoryLabel>
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
                            {parlayMarketsByStatus.claimable.length || accountPositionsByStatus.claimable.length ? (
                                <>
                                    {accountPositionsByStatus.claimable.map((singleMarket, index) => {
                                        return <SinglePosition position={singleMarket} key={`s-${index}`} />;
                                    })}
                                    {parlayMarketsByStatus.claimable.map((parlayMarket, index) => {
                                        return <ParlayPosition parlayMarket={parlayMarket} key={index} />;
                                    })}
                                </>
                            ) : (
                                <EmptyContainer>{t('profile.messages.no-claimable')}</EmptyContainer>
                            )}
                        </>
                    )}
                </ListContainer>
            )}
            <CategoryContainer onClick={() => setOpenState(!openOpenPositions)}>
                <CategoryIcon className="icon icon--logo" />
                <CategoryLabel>{t('profile.categories.open')}</CategoryLabel>
                <Arrow className={openOpenPositions ? 'icon icon--arrow-up' : 'icon icon--arrow-down'} />
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
                                <EmptyContainer>{t('profile.messages.no-open')}</EmptyContainer>
                            )}
                        </>
                    )}
                </ListContainer>
            )}
        </Container>
    );
};

export default Positions;
