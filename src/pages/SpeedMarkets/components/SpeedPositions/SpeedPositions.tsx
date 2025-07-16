import CollateralSelector from 'components/CollateralSelector';
import Scroll from 'components/Scroll';
import SimpleLoader from 'components/SimpleLoader';
import { MARKET_DURATION_IN_DAYS } from 'constants/markets';
import { millisecondsToSeconds } from 'date-fns';
import { PositionsFilter } from 'enums/speedMarkets';
import { orderBy } from 'lodash';
import usePythPriceQueries from 'queries/prices/usePythPriceQueries';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import useUserResolvedSpeedMarketsQuery from 'queries/speedMarkets/useUserResolvedSpeedMarketsQuery';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { UserPosition } from 'types/speedMarkets';
import { getCollaterals, getDefaultCollateral, isLpSupported } from 'utils/collaterals';
import { getIsMultiCollateralSupported } from 'utils/network';
import { getPriceId } from 'utils/pyth';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import smartAccountConnector from 'utils/smartAccount/smartAccountConnector';
import { isUserWinner } from 'utils/speedMarkets';
import { useAccount, useChainId, useClient } from 'wagmi';
import ClaimAction from '../ClaimAction';
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
    const [claimCollateralIndex, setClaimCollateralIndex] = useState(0);
    const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
    const [isActionInProgress, setIsActionInProgress] = useState(false);

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);

    const claimCollateralArray = useMemo(
        () =>
            getCollaterals(networkId).filter(
                (collateral) => !isLpSupported(collateral) || collateral === getDefaultCollateral(networkId)
            ),
        [networkId]
    );

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

    const openSpeedMarkets = userActiveSpeedMarketsData.filter((marketData) => marketData.maturityDate >= Date.now());
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

    const maturedUserSpeedMarketsWithoutPrice = maturedWithPrices.filter((marketData) => marketData.finalPrice === 0);
    const pendingUserSpeedMarkets = openSpeedMarkets.concat(maturedUserSpeedMarketsWithoutPrice);
    const claimableUserSpeedMarkets = maturedWithPrices.filter((marketData) => marketData.isClaimable);
    const historyUserSpeedMarkets = maturedWithPrices
        .filter((marketData) => !marketData.isClaimable)
        .concat(userResolvedSpeedMarketsData);

    const positions =
        selectedFilter === PositionsFilter.PENDING
            ? orderBy(pendingUserSpeedMarkets, ['maturityDate'], ['asc'])
            : selectedFilter === PositionsFilter.CLAIMABLE
            ? orderBy(claimableUserSpeedMarkets, ['maturityDate'], ['desc'])
            : orderBy(historyUserSpeedMarkets, ['createdAt'], ['desc']);

    const isLoading =
        userActiveSpeedMarketsDataQuery.isLoading ||
        pythPricesQueries.some((pythPriceQuery) => pythPriceQuery.isLoading) ||
        (selectedFilter === PositionsFilter.HISTORY && userResolvedSpeedMarketsDataQuery.isLoading);

    // select position filter which has positions on first render
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            // only on first render
            if (pendingUserSpeedMarkets.length > 0) {
                setSelectedFilter(PositionsFilter.PENDING);
            } else if (claimableUserSpeedMarkets.length > 0) {
                setSelectedFilter(PositionsFilter.CLAIMABLE);
            }
            isFirstRender.current = false;
        }
    }, [pendingUserSpeedMarkets, claimableUserSpeedMarkets]);

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
            {selectedFilter === PositionsFilter.CLAIMABLE && !!positions.length && (
                <ClaimAllRow>
                    <ClaimAllWrapper>
                        <ClaimAction
                            positions={positions}
                            claimCollateralIndex={claimCollateralIndex}
                            isDisabled={isSubmittingBatch || isActionInProgress}
                            isActionInProgress={isActionInProgress}
                            setIsActionInProgress={setIsSubmittingBatch}
                        />
                    </ClaimAllWrapper>
                    {isMultiCollateralSupported && (
                        <FlexDivRowCentered>
                            <ClaimInLabel>{t('speed-markets.user-positions.claim-in')}:</ClaimInLabel>
                            <CollateralSelector
                                collateralArray={claimCollateralArray}
                                selectedItem={claimCollateralIndex}
                                onChangeCollateral={setClaimCollateralIndex}
                                preventPaymentCollateralChange
                                disabled={isSubmittingBatch || isActionInProgress}
                                topPosition="20px"
                            />
                        </FlexDivRowCentered>
                    )}
                </ClaimAllRow>
            )}
            {selectedFilter === PositionsFilter.HISTORY && (
                <HistoryInfo>
                    {t('speed-markets.user-positions.history-limit', { days: MARKET_DURATION_IN_DAYS })}
                </HistoryInfo>
            )}
            <Scroll width="calc(100% + 10px)" height="100%">
                <Positions>
                    {isLoading ? (
                        <SimpleLoader />
                    ) : !!positions.length ? (
                        positions.map((position, i) => (
                            <SpeedPositionCard
                                key={`position-${i}`}
                                position={position}
                                claimCollateralIndex={claimCollateralIndex}
                                isSubmittingBatch={isSubmittingBatch}
                                isActionInProgress={isActionInProgress}
                                setIsActionInProgress={setIsActionInProgress}
                            />
                        ))
                    ) : (
                        <NoPositions>{t('speed-markets.user-positions.no-positions')}</NoPositions>
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

const FilterButton = styled(FlexDivCentered)<{ isActive: boolean; isDisabled?: boolean }>`
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
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
    ${(props) => props.isDisabled && 'opacity: 0.5;'}
    user-select: none;
`;

const Positions = styled(FlexDivColumn)`
    height: 100%;
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

const ClaimAllRow = styled(FlexDivRow)`
    position: relative;
    gap: 5px;
`;

const ClaimAllWrapper = styled.div`
    width: 100%;
`;

const ClaimInLabel = styled.span`
    color: ${(props) => props.theme.status.win};
    font-size: 12px;
    font-weight: 800;
    line-height: 100%;
    margin-right: 3px;
    white-space: nowrap;
`;

const HistoryInfo = styled.span`
    font-size: 11px;
    line-height: 110%;
`;

const NoPositions = styled(FlexDivCentered)`
    height: 100%;
    font-size: 18px;
    font-weight: 600;
    line-height: 100%;
    text-transform: uppercase;
`;

export default SpeedPositions;
