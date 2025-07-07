import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { UserPosition } from 'types/speedMarkets';
import { getPriceId } from 'utils/pyth';
import { refetchUserSpeedMarkets } from 'utils/queryConnector';
import { isUserWinner } from 'utils/speedMarkets';
import { useAccount, useChainId, useClient } from 'wagmi';

const NotificationsCount: React.FC<{ isClaimable: boolean }> = ({ isClaimable }) => {
    const networkId = useChainId();
    const client = useClient();
    const { address: walletAddress, isConnected } = useAccount();

    const isBiconomy = useSelector(getIsBiconomy);

    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        isBiconomy ? '' /* TODO: biconomyConnector.address */ : walletAddress || '',
        { enabled: isConnected }
    );

    const userActiveSpeedMarketsData = useMemo(
        () =>
            userActiveSpeedMarketsDataQuery.isSuccess && userActiveSpeedMarketsDataQuery.data
                ? userActiveSpeedMarketsDataQuery.data
                : [],
        [userActiveSpeedMarketsDataQuery]
    );

    const openSpeedMarkets = userActiveSpeedMarketsData.filter((marketData) => marketData.maturityDate > Date.now());
    const maturedSpeedMarkets = userActiveSpeedMarketsData.filter((marketData) => marketData.maturityDate < Date.now());

    const priceRequests = maturedSpeedMarkets.map((marketData) => ({
        priceId: getPriceId(networkId, marketData.asset),
        publishTime: millisecondsToSeconds(marketData.maturityDate),
    }));
    const pythPricesQueries = usePythPriceQueries(networkId, priceRequests, {
        enabled: priceRequests.length > 0,
    });

    // set final prices and claimable status
    const maturedWithPrices: UserPosition[] = maturedSpeedMarkets.map((marketData, index) => {
        const finalPrice = pythPricesQueries[index].data || 0;
        const isClaimable = !!isUserWinner(marketData.side, marketData.strikePrice, finalPrice);
        return {
            ...marketData,
            finalPrice,
            isClaimable,
        };
    });

    const claimableUserSpeedMarkets = maturedWithPrices.filter((marketData) => marketData.isClaimable);
    const maturedUserSpeedMarketsWithoutPrice = maturedWithPrices.filter((marketData) => marketData.finalPrice === 0);

    const pendingUserSpeedMarketsCount = openSpeedMarkets.length + maturedUserSpeedMarketsWithoutPrice.length;

    // Refresh open markets
    useInterval(() => {
        if (walletAddress && pendingUserSpeedMarketsCount > 0) {
            refetchUserSpeedMarkets(networkId, walletAddress);
        }
    }, secondsToMilliseconds(5));

    const notificationsCount = isClaimable ? claimableUserSpeedMarkets.length : pendingUserSpeedMarketsCount;

    return <Count>{notificationsCount}</Count>;
};

const Count = styled.span`
    color: ${(props) => props.theme.button.textColor.primary};
    font-weight: 600;
    font-size: 13px;
`;

export default NotificationsCount;
