import React, { useMemo } from 'react';

import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { useTranslation } from 'react-i18next';

import { useParlayMarketsQuery } from 'queries/markets/useParlayMarketsQuery';
import useAccountMarketsQuery, { AccountPositionProfile } from 'queries/markets/useAccountMarketsQuery';
import { ParlayMarket } from 'types/markets';
import { CategoryContainer, CategoryIcon, CategoryLabel, Container, ListContainer } from './styled-components';
import { isParlayClaimable } from 'utils/markets';
import ParlayPosition from './components/ParlayPosition';

const Positions: React.FC = () => {
    const { t } = useTranslation();

    // const [openClaimable, setClaimableState] = useState<boolean>(false);
    // const [openOpenPositions, setOpenState] = useState<boolean>(false);

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    // const walletAddress = useSelector((state: RootState) => getWalletAddress(state))
    // ? '0xf12c220b631125425f4c69823d6187FE3C8d0999'
    // : '0xf12c220b631125425f4c69823d6187FE3C8d0999';
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
                if (!openMarkets?.length && !parlayMarket.claimed) {
                    if (isParlayClaimable(parlayMarket)) data.claimable.push(parlayMarket);
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

    return (
        <Container>
            <CategoryContainer>
                <CategoryIcon className="icon icon--logo" />
                <CategoryLabel>{t('profile.categories.claimable')}</CategoryLabel>
            </CategoryContainer>
            <ListContainer>
                {parlayMarketsByStatus.claimable.map((parlayMarket, index) => {
                    return <ParlayPosition parlayMarket={parlayMarket} key={index} />;
                })}
            </ListContainer>
            <CategoryContainer>
                <CategoryIcon className="icon icon--logo" />
                <CategoryLabel>{t('profile.categories.open')}</CategoryLabel>
            </CategoryContainer>
            <ListContainer>
                {parlayMarketsByStatus.open.map((parlayMarket, index) => {
                    return <ParlayPosition parlayMarket={parlayMarket} key={index} />;
                })}
            </ListContainer>
        </Container>
    );
};

export default Positions;
