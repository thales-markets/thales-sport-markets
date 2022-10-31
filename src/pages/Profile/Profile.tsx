import { useParlayMarketsQuery } from 'queries/markets/useParlayMarketsQuery';
import useAccountMarketsQuery from 'queries/markets/useAccountMarketsQuery';
import { AccountPositionProfile } from 'queries/markets/useAccountMarketsQuery';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { ParlayMarket } from 'types/markets';

const Profile: React.FC = () => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state))
        ? '0xf12c220b631125425f4c69823d6187FE3C8d0999'
        : '0xf12c220b631125425f4c69823d6187FE3C8d0999';
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
                    data.claimable.push(market);
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
                if (!openMarkets?.length) {
                    const claimableMarkets = parlayMarket.positions.filter((position) => position.claimable);
                    if (claimableMarkets?.length < parlayMarket.sportMarkets?.length) {
                        const canceledMarkets = parlayMarket.sportMarkets.filter(
                            (sportMarket) => sportMarket.isCanceled
                        );
                        if (claimableMarkets?.length + canceledMarkets?.length == parlayMarket.sportMarkets?.length) {
                            data.claimable.push(parlayMarket);
                        }
                    }
                }
                const resolvedOrCanceledMarkets = parlayMarket.sportMarkets.filter(
                    (sportMarket) => sportMarket.isResolved || sportMarket.isCanceled
                );

                if (resolvedOrCanceledMarkets?.length !== parlayMarket.sportMarkets.length)
                    data.open.push(parlayMarket);
            });
        }
        return data;
    }, [parlayMarkets]);

    console.log('accountPositionsByStatus ', accountPositionsByStatus);
    console.log('parlayMarketsByStatus ', parlayMarketsByStatus);

    return <></>;
};

export default Profile;
