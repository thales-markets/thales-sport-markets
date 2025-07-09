import Tooltip from 'components/Tooltip';
import { SPEED_MARKETS_WIDGET_Z_INDEX } from 'constants/ui';
import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import useInterval from 'hooks/useInterval';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { UserPosition } from 'types/speedMarkets';
import { getPriceId } from 'utils/pyth';
import { refetchUserSpeedMarkets } from 'utils/queryConnector';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { isUserWinner } from 'utils/speedMarkets';
import { useAccount, useChainId, useClient } from 'wagmi';

const NotificationsCount: React.FC<{ isClaimable: boolean }> = ({ isClaimable }) => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const isBiconomy = useSelector(getIsBiconomy);
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery({ networkId, client }, walletAddress, {
        enabled: isConnected,
    });

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

    return notificationsCount > 0 ? (
        <Tooltip
            overlay={
                isClaimable
                    ? t('speed-markets.tooltips.claimable-positions')
                    : t('speed-markets.tooltips.pending-positions')
            }
            zIndex={SPEED_MARKETS_WIDGET_Z_INDEX}
        >
            <Notification isClaimable={isClaimable}>
                <Count>{notificationsCount}</Count>
            </Notification>
        </Tooltip>
    ) : (
        <></>
    );
};

const Notification = styled.div<{ isClaimable: boolean }>`
    position: absolute;
    top: -10px;
    ${(props) => (props.isClaimable ? 'left: 2px;' : '')}
    ${(props) => (!props.isClaimable ? 'right: 2px;' : '')}
    background-color: ${(props) =>
        props.isClaimable ? props.theme.background.quaternary : props.theme.background.octonary};
    box-shadow: ${(props) => props.theme.shadow.notificationOpen};
    border-radius: 50%;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    cursor: pointer;
`;

const Count = styled.span`
    color: ${(props) => props.theme.button.textColor.primary};
    font-weight: 600;
    font-size: 13px;
`;

export default NotificationsCount;
