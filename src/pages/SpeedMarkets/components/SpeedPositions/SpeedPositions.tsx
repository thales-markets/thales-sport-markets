import Scroll from 'components/Scroll';
import SimpleLoader from 'components/SimpleLoader';
import { millisecondsToSeconds } from 'date-fns';
import { PositionsFilter } from 'enums/speedMarkets';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import useUserResolvedSpeedMarketsQuery from 'queries/speedMarkets/useUserResolvedSpeedMarketsQuery';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow } from 'styles/common';
import { UserPosition } from 'types/speedMarkets';
import { getPriceId } from 'utils/pyth';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import smartAccountConnector from 'utils/smartAccount/smartAccountConnector';
import { isUserWinner } from 'utils/speedMarkets';
import { useAccount, useChainId, useClient } from 'wagmi';
import SpeedPositionCard from '../SpeedPositionCard';

const SpeedPositions: React.FC = () => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const isBiconomy = useSelector(getIsBiconomy);
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const [selectedFilter, setSelectedFilter] = useState(PositionsFilter.PENDING);

    const userResolvedSpeedMarketsDataQuery = useUserResolvedSpeedMarketsQuery({ networkId, client }, walletAddress, {
        enabled: isConnected,
    });

    const userResolvedSpeedMarketsData = useMemo(
        () =>
            userResolvedSpeedMarketsDataQuery.isSuccess && userResolvedSpeedMarketsDataQuery.data
                ? userResolvedSpeedMarketsDataQuery.data
                : [],
        [userResolvedSpeedMarketsDataQuery]
    );

    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        isBiconomy ? smartAccountConnector.biconomyAddress : walletAddress || '',
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

    const pendingUserSpeedMarkets = openSpeedMarkets.concat(
        maturedWithPrices.filter((marketData) => marketData.finalPrice === 0)
    );
    const claimableUserSpeedMarkets = maturedWithPrices.filter((marketData) => marketData.isClaimable);

    const positions =
        selectedFilter === PositionsFilter.PENDING
            ? pendingUserSpeedMarkets
            : selectedFilter === PositionsFilter.CLAIMABLE
            ? claimableUserSpeedMarkets
            : userActiveSpeedMarketsData.concat(userResolvedSpeedMarketsData);

    const isLoading =
        userActiveSpeedMarketsDataQuery.isLoading ||
        pythPricesQueries.some((pythPriceQuery) => pythPriceQuery.isLoading) ||
        (selectedFilter === PositionsFilter.ALL && userResolvedSpeedMarketsDataQuery.isLoading);

    return (
        <Container>
            <Filters>
                {Object.values(PositionsFilter).map((positionFilter, i) => {
                    return (
                        <FilterButton
                            key={`filter-${i}`}
                            isActive={positionFilter === selectedFilter}
                            onClick={() => setSelectedFilter(positionFilter)}
                        >
                            {t(`speed-markets.user-positions.filters.${positionFilter}`)}
                            {positionFilter === PositionsFilter.PENDING && !!pendingUserSpeedMarkets.length && (
                                <PendingPositionsCount isSelected={selectedFilter === PositionsFilter.PENDING}>
                                    {pendingUserSpeedMarkets.length}
                                </PendingPositionsCount>
                            )}
                            {positionFilter === PositionsFilter.CLAIMABLE && !!claimableUserSpeedMarkets.length && (
                                <ClaimablePositionsCount isSelected={selectedFilter === PositionsFilter.CLAIMABLE}>
                                    {claimableUserSpeedMarkets.length}
                                </ClaimablePositionsCount>
                            )}
                        </FilterButton>
                    );
                })}
            </Filters>
            <Scroll width="calc(100% + 10px)" height="100%">
                <Positions>
                    {isLoading ? (
                        <SimpleLoader />
                    ) : (
                        positions.map((position, i) => <SpeedPositionCard key={`position-${i}`} position={position} />)
                    )}
                </Positions>
            </Scroll>
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    gap: 6px;
`;

const Filters = styled(FlexDivRow)`
    gap: 7px;
`;

const FilterButton = styled(FlexDivCentered)<{ isActive: boolean }>`
    width: 100%;
    height: 31px;
    gap: 5px;
    background: ${(props) =>
        props.isActive
            ? props.theme.speedMarkets.button.background.active
            : props.theme.speedMarkets.button.background.primary};
    color: ${(props) =>
        props.isActive
            ? props.theme.speedMarkets.button.textColor.active
            : props.theme.speedMarkets.button.textColor.primary};
    border-radius: 6px;
    text-align: center;
    font-size: 12px;
    font-weight: 800;
    line-height: 100%;
    cursor: pointer;
`;

const Positions = styled(FlexDivColumn)`
    gap: 6px;
    padding-right: 10px;
`;

const PendingPositionsCount = styled(FlexDivCentered)<{ isSelected: boolean }>`
    width: 20px;
    height: 20px;
    background-color: ${(props) =>
        props.isSelected ? props.theme.speedMarkets.button.textColor.active : props.theme.background.octonary};
    color: ${(props) =>
        props.isSelected
            ? props.theme.speedMarkets.button.background.active
            : props.theme.speedMarkets.button.textColor.active};
    border-radius: 50%;
    text-align: center;
    font-weight: 600;
`;

const ClaimablePositionsCount = styled(PendingPositionsCount)`
    background-color: ${(props) =>
        props.isSelected ? props.theme.speedMarkets.button.textColor.active : props.theme.background.quaternary};
`;

export default SpeedPositions;
